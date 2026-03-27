import ReactDOM from "react-dom/client";
import App from "/src/App.jsx";
import { StoreProvider } from "/src/store/StoreProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <StoreProvider>
    <App />
  </StoreProvider>
  // </React.StrictMode>
);
