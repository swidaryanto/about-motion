import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";

const PlaygroundApp = lazy(() =>
  import("./PlaygroundApp.js").then((module) => ({ default: module.PlaygroundApp }))
);

function AppShell() {
  return React.createElement(
    Suspense,
    { fallback: React.createElement("div", { className: "app-loading-fallback" }, "Loading motion playground…") },
    React.createElement(PlaygroundApp)
  );
}

createRoot(document.getElementById("app")).render(React.createElement(AppShell));
