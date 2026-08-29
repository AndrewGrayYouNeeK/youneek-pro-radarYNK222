import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import AppErrorBoundary from "@/components/AppErrorBoundary.jsx";
import "@/index.css";
import "@/lib/platform";

document.documentElement.classList.add("dark");
document.body.classList.add("dark");
document.title = "YouNeeK Pro Radar — MAKING IT RAIN";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
