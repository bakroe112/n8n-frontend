import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { MainRouter } from "./router/index.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MainRouter />
  </React.StrictMode>
);
