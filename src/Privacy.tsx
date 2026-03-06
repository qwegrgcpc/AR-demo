const Privacy = () => {
  return (
    <div
      style={{
        padding: "40px 20px",
        width: "100vw",
        minHeight: "100vh",
        boxSizing: "border-box",
        fontFamily: "sans-serif",
        color: "#e0e0e0",
        backgroundColor: "#111",
        lineHeight: "1.6",
      }}
    >
      <div
        style={{
          backgroundColor: "#222",
          padding: "40px",
          borderRadius: "8px",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{
            borderBottom: "1px solid #444",
            paddingBottom: "15px",
            marginTop: 0,
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: "#aaa", fontSize: "0.9em" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 style={{ marginTop: "30px" }}>1. Introduction</h2>
        <p>
          Welcome to our AR application. We respect your privacy and are
          committed to protecting your personal data. This privacy policy will
          inform you as to how we look after your personal data when you use our
          application.
        </p>

        <h2 style={{ marginTop: "30px" }}>2. Data We Collect</h2>
        <p>
          Our application uses Snap Camera Kit to provide Augmented Reality (AR)
          experiences. To enable these features, we request access to your
          device's camera and microphone.
        </p>
        <ul style={{ paddingLeft: "20px" }}>
          <li style={{ marginBottom: "10px" }}>
            <strong>Camera Data:</strong> We process camera video streams
            locally to apply AR effects (Lenses). We do not store or transmit
            raw video data to our servers unless explicitly initiated by you
            (e.g., recording a video).
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Microphone Data:</strong> We access the microphone to
            capture audio when recording AR experiences.
          </li>
          <li style={{ marginBottom: "10px" }}>
            <strong>Facial features and skeletal tracking:</strong> Snap Camera
            Kit processes data locally on your device to track facial
            expressions and body movements specifically required to render
            certain Lenses accurately.
          </li>
        </ul>

        <h2 style={{ marginTop: "30px" }}>3. How We Use Your Data</h2>
        <p>
          The data collected is used solely for the purpose of providing the AR
          features within the application.
        </p>
        <ul style={{ paddingLeft: "20px" }}>
          <li style={{ marginBottom: "10px" }}>
            To apply visual AR effects in real-time.
          </li>
          <li style={{ marginBottom: "10px" }}>
            To allow you to interact with AR elements using facial or body
            tracking.
          </li>
        </ul>

        <h2 style={{ marginTop: "30px" }}>4. Third-Party Services</h2>
        <p>
          We use Snap Camera Kit as a third-party service provider. Please refer
          to{" "}
          <a
            href="https://snap.com/en-US/privacy/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4da6ff", textDecoration: "none" }}
          >
            Snap Inc.'s Privacy Policy
          </a>{" "}
          for more information on how they handle data.
        </p>

        <h2 style={{ marginTop: "30px" }}>5. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy
          practices, please contact the developer.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
