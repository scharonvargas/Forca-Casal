import { createRoot } from "react-dom/client";
import App from "./App";
import NotAllowed from "./pages/not-allowed";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
if (window.location.pathname === "/not-allowed") {
  root.render(<NotAllowed />);
} else {
  root.render(<App />);
}
