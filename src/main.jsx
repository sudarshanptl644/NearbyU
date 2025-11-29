import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./CSS/login.css"; // Assuming you have a default css file, otherwise remove this line
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
