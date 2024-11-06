import AppRoutes from "@routes/AppRoutes";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import "bootstrap/dist/css/bootstrap.css";
import "@styles/index.css";
import { ToastContainer } from "react-toastify";
import ErrorBoundaries from "./utility/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ErrorBoundaries>
      <BrowserRouter>
        <ToastContainer />
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundaries>
  </Provider>
  // </React.StrictMode>
);
