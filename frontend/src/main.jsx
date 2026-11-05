import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/fonts.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/home.css";
import "./styles/commerce.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
import "./styles/editorial.css";
import "./styles/refinamiento.css";
import "./styles/hero-portada.css";
