import React from "react";
import ReactDOM from "react-dom/client";
import "../reset.css";
import "../vscode.css";
import "../App.css";

export const renderToPage = (element: JSX.Element) => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>{element}</React.StrictMode>
  );
};
