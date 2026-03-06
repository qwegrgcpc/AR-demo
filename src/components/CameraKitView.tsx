import { useEffect, useRef, useState } from "react";
import {
  bootstrapCameraKit,
  CameraKit,
  CameraKitSession,
  type Lens,
} from "@snap/camera-kit";

interface CameraKitViewProps {
  apiToken: string;
  lensId: string;
  lensGroupId: string;
}

export default function CameraKitView({
  apiToken,
  lensId,
  lensGroupId,
}: CameraKitViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<CameraKitSession | null>(null);
  const cameraKitRef = useRef<CameraKit | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Lens state
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [activeLens, setActiveLens] = useState<Lens | null>(null);

  // Camera state
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Capture state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function initCameraKit() {
      if (!canvasRef.current) return;

      try {
        // 1. Bootstrap Camera Kit
        const cameraKit = await bootstrapCameraKit({
          apiToken: apiToken,
        });
        if (!isMounted) return;
        cameraKitRef.current = cameraKit;

        // 2. Create a Session with the canvas element
        const session = await cameraKit.createSession({
          liveRenderTarget: canvasRef.current,
        });
        if (!isMounted) return;
        sessionRef.current = session;

        // 3. Get Media Stream from user's webcam and set as source
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStreamRef.current = mediaStream;
        await session.setSource(mediaStream);
        await session.play();

        // 4. Load lenses from Lens Group and apply default
        const { lenses: loadedLenses } =
          await cameraKit.lensRepository.loadLensGroups([lensGroupId]);
        if (!isMounted) return;

        setLenses(loadedLenses);
        if (loadedLenses.length > 0) {
          const defaultLens =
            loadedLenses.find((l) => l.id === lensId) || loadedLenses[0];
          await session.applyLens(defaultLens);
          setActiveLens(defaultLens);
        }
      } catch (error) {
        console.error("Error initializing Camera Kit:", error);
      }
    }

    initCameraKit();

    return () => {
      isMounted = false;
      // Cleanup
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (sessionRef.current) {
        sessionRef.current.pause();
        sessionRef.current.destroy();
      }
    };
  }, [apiToken, lensId, lensGroupId, facingMode]);

  const handleTakePhoto = () => {
    if (!canvasRef.current) return;

    // Convert canvas to data URL (PNG)
    const dataUrl = canvasRef.current.toDataURL("image/png");

    // Create an anchor element to trigger download
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `snap-photo-${new Date().getTime()}.png`;
    link.click();
  };

  const handleApplyLens = async (lens: Lens) => {
    if (!sessionRef.current) return;
    try {
      await sessionRef.current.applyLens(lens);
      setActiveLens(lens);
    } catch (error) {
      console.error("Error applying lens:", error);
    }
  };

  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!canvasRef.current) return;
    recordedChunksRef.current = [];

    // Capture the stream from the canvas
    const stream = canvasRef.current.captureStream(30); // 30 FPS

    const options = { mimeType: "video/webm; codecs=vp9" };
    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      console.warn(
        "video/webm; codecs=vp9 not supported. Falling back to default.",
      );
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: mediaRecorder.mimeType || "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `snap-video-${new Date().getTime()}.webm`;
      link.click();
      URL.revokeObjectURL(url);
      recordedChunksRef.current = [];
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Modern styles for the controls
  const carouselStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "120px",
    left: "0",
    width: "100%",
    display: "flex",
    gap: "15px",
    padding: "10px 20px",
    overflowX: "auto",
    scrollBehavior: "smooth",
    zIndex: 10,
    // Using simple webkit scrollbar hiding inline, or assume external CSS
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  };

  const lensIconStyle = (isActive: boolean): React.CSSProperties => ({
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    border: isActive ? "3px solid #ffba00" : "3px solid transparent",
    objectFit: "cover",
    cursor: "pointer",
    transition:
      "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), border 0.2s ease",
    flexShrink: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    boxShadow: isActive
      ? "0 4px 15px rgba(255, 186, 0, 0.4)"
      : "0 4px 10px rgba(0,0,0,0.3)",
  });

  const controlsStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "20px",
    padding: "15px 30px",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(10px)",
    borderRadius: "50px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    zIndex: 10,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 24px",
    border: "none",
    borderRadius: "30px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "120px",
  };

  const photoButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "white",
    color: "black",
  };

  const recordButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: isRecording ? "#ff3b30" : "rgba(255, 255, 255, 0.2)",
    color: "white",
  };

  const flipButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(10px)",
    border: "none",
    color: "white",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 20,
    transition: "transform 0.2s ease, background-color 0.2s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "100vw",
          maxHeight: "100vh",
          objectFit: "contain",
        }}
      />

      {/* Camera Toggle Button */}
      <button
        style={flipButtonStyle}
        onClick={handleToggleCamera}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
        }}
        title="Flip Camera"
      >
        🔄
      </button>

      {/* Lens Carousel */}
      {lenses.length > 0 && (
        <div style={carouselStyle} className="hide-scrollbar">
          {lenses.map((lens) => {
            const isActive = activeLens?.id === lens.id;
            return (
              <img
                key={lens.id}
                src={lens.iconUrl || ""}
                alt={lens.name}
                style={{
                  ...lensIconStyle(isActive),
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                }}
                onClick={() => handleApplyLens(lens)}
                onMouseOver={(e) => {
                  if (!isActive)
                    e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.transform = "scale(1)";
                }}
                draggable={false}
              />
            );
          })}
        </div>
      )}

      {/* Capture Controls */}
      <div style={controlsStyle}>
        <button
          onClick={handleTakePhoto}
          style={photoButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          📷 Photo
        </button>
        <button
          onClick={handleToggleRecording}
          style={recordButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isRecording ? "⏹ Stop" : "🔴 Record"}
        </button>
      </div>
    </div>
  );
}
