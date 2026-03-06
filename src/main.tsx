import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Privacy from "./Privacy.tsx";

const isPrivacy =
  window.location.pathname === "/privacy" ||
  window.location.pathname === "/privacy/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isPrivacy ? <Privacy /> : <App />}</StrictMode>,
);
