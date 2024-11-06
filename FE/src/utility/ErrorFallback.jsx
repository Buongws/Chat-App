import Toast from "./toast";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

const ErrorFallback = () => {
  const { message } = useSelector((state) => state.message);
  Toast.showError(message);
  return (
    <div>
      <ToastContainer />
    </div>
  );
};
export default ErrorFallback;
