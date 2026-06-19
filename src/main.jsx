import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PwaProvider } from "./context/PwaContext.jsx";
import { ReactLenis } from "lenis/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PwaProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </PwaProvider>
  </StrictMode>,
);
