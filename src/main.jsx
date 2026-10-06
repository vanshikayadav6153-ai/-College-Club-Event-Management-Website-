import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

document.querySelectorAll("body > dialog, body > .toast").forEach((element) => element.remove());
createRoot(document.querySelector(".app-shell")).render(<App />);