import CameraKitView from "./components/CameraKitView";
import "./App.css";

function App() {
  const apiToken = import.meta.env.VITE_CAMERA_KIT_API_TOKEN;
  const lensId = import.meta.env.VITE_LENS_ID;
  const lensGroupId = import.meta.env.VITE_LENS_GROUP_ID;

  if (!apiToken || !lensId || !lensGroupId) {
    return (
      <div
        style={{
          padding: "20px",
          color: "white",
          backgroundColor: "#333",
          minHeight: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Missing Environment Variables</h2>
        <p>
          Please make sure you have created a <code>.env.local</code> file in
          your project root with the following variables:
        </p>
        <pre
          style={{
            backgroundColor: "#111",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          {`VITE_CAMERA_KIT_API_TOKEN=your_api_token
VITE_LENS_ID=your_lens_id
VITE_LENS_GROUP_ID=your_lens_group_id`}
        </pre>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CameraKitView
        apiToken={apiToken}
        lensId={lensId}
        lensGroupId={lensGroupId}
      />
    </div>
  );
}

export default App;
