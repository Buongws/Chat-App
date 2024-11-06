import { Formik, Form, Field, ErrorMessage } from "formik";
import { Fragment, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import Toast from "../utility/toast";
import { resetPassword } from "../api/main";
const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const handleResetPassword = useCallback(async (values, { setSubmitting }) => {
    if (!token) {
      Toast.showError("Invalid or missing reset token");
      setSubmitting(false);
      return;
    }
    const formattedToken = token.replaceAll("@@", ".");
    try {
      await resetPassword(formattedToken, values);

      Toast.showSuccess("Password reset successful");
      Toast.showInfo("Please login with your new password");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Error resetting password: ", error);
      Toast.showError("Failed to reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
        "Password must contain at least one number and one special character"
      )
      .required("Password is required"),
  });

  return (
    <Fragment>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-LoginGray p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Reset Password
          </h2>

          <Formik
            initialValues={{
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleResetPassword}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-gray-400 mb-2"
                  >
                    NEW PASSWORD
                    <span className="text-red-500"> *</span>
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 py-2 bg-InputFieldDark text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 mt-1"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-DiscordPurple text-white py-2 rounded-md hover:bg-DiscordPurpleDark transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Fragment>
  );
};

export default ResetPassword;
