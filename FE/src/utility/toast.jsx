import { Fragment } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, Slide } from "react-toastify";

const ToastConfig = {
  transition: Slide,
  position: "bottom-left",
  theme: "colored",
  hideProgressBar: true,
  autoClose: 2000,
};

const SuccessToast = ({ message }) => (
  <Fragment>
    <div className={`toastify-header ${!message && "pb-0"}`}>
      <div className="title-wrapper"></div>
    </div>
    {message && (
      <div className="toastify-body">
        <span role="img" aria-label="toast-text">
          <h1>{message}</h1>
        </span>
      </div>
    )}
  </Fragment>
);

const DefaultToast = ({ message }) => (
  <Fragment>
    <div className={`toastify-header ${!message && "pb-0"}`}>
      <div className="title-wrapper"></div>
    </div>
    {message && (
      <div className="toastify-body">
        <span role="img" aria-label="toast-text">
          <p>{message}</p>
        </span>
      </div>
    )}
  </Fragment>
);

const WarningToast = ({ message }) => (
  <Fragment>
    <div className={`toastify-header ${!message && "pb-0"}`}>
      <div className="title-wrapper"></div>
    </div>
    {message && (
      <div className="toastify-body">
        <span role="img" aria-label="toast-text">
          <p>{message}</p>
        </span>
      </div>
    )}
  </Fragment>
);

const ErrorToast = ({ message }) => (
  <Fragment>
    <div className={`toastify-header ${!message && "pb-0"}`}>
      <div className="title-wrapper"></div>
    </div>
    {message && (
      <div className="toastify-body">
        <span
          role="img"
          aria-label="toast-text"
          className="toastify-error-text"
        >
          <p>{message}</p>
        </span>
      </div>
    )}
  </Fragment>
);

const InfoToast = ({ message }) => (
  <Fragment>
    <div className={`toastify-header ${!message && "pb-0"}`}>
      <div className="title-wrapper"></div>
    </div>
    {message && (
      <div className="toastify-body">
        <span role="img" aria-label="toast-text">
          <p>{message}</p>
        </span>
      </div>
    )}
  </Fragment>
);

const Toast = {};

Toast.showDefault = (message) => {
  toast(<DefaultToast message={message} />, ToastConfig);
};

Toast.showSuccess = (message) => {
  toast.success(<SuccessToast message={message} />, ToastConfig);
};

Toast.showError = (message) => {
  toast.error(<ErrorToast message={message} />, ToastConfig);
};

Toast.showWarning = (message) => {
  toast.warning(<WarningToast message={message} />, ToastConfig);
};

Toast.showInfo = (message) => {
  toast.info(<InfoToast message={message} />, ToastConfig);
};

export default Toast;
