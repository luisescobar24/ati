import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import PandaParticles from "./panda.tsx"; // Asegúrate que el nombre coincida

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/panda" element={<PandaParticles />} />
      </Routes>
    </Router>
  </StrictMode>
);
