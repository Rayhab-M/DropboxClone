import React from "react";
import ReactDOM from "react-dom/client";  // Use this import for React 18
import App from "./App";
import { Amplify } from "aws-amplify";
import config from './aws-exports';

// Configure Amplify with the config object
Amplify.configure(config);

// Create a root for the app and render it
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
