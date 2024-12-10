import { Formik, Form, Field, ErrorMessage } from "formik";
import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { login } from "../actions/auth";
import { Tooltip } from "reactstrap";
import ForgotPasswordModal from "../components/ForgotPassWordModal/ForgotPassWord";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [emailTooltipOpen, setEmailTooltipOpen] = useState(false);
  const [passwordTooltipOpen, setPasswordTooltipOpen] = useState(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const toggleForgotPassword = () => setForgotPasswordOpen(!forgotPasswordOpen);

  const toggleEmailTooltip = () => setEmailTooltipOpen(!emailTooltipOpen);
  const togglePasswordTooltip = () =>
    setPasswordTooltipOpen(!passwordTooltipOpen);

  const handleLogin = (values, { setSubmitting }) => {
    const { email, password } = values;

    dispatch(login(email, password))
      .then(() => {
        setIsRedirecting(true);
        setTimeout(() => navigate("/"), 1000);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };

  if (isLoggedIn && !isRedirecting) {
    setIsRedirecting(true);
    setTimeout(() => navigate("/channels/@me"), 2000);
  }

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be at most 100 characters")
      .required("Password is required"),
  });

  return (
    <Fragment>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-LoginGray p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Welcome back!
          </h2>

          <Formik
            initialValues={{
              email: "test23@gmail.com",
              password: "abcxyz123@",
            }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-400 mb-2">
                    EMAIL
                    <span>
                      <span id="email-reminder" className="text-red-500">
                        {" "}
                        *
                      </span>
                      <Tooltip
                        placement="right"
                        isOpen={emailTooltipOpen}
                        target="email-reminder"
                        toggle={toggleEmailTooltip}
                      >
                        Email should include @
                      </Tooltip>
                    </span>
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 bg-InputFieldDark text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-gray-400 mb-2"
                  >
                    PASSWORD
                    <span id="password-reminder" className="text-red-500">
                      {" "}
                      *
                    </span>
                    <Tooltip
                      placement="right"
                      isOpen={passwordTooltipOpen}
                      target="password-reminder"
                      toggle={togglePasswordTooltip}
                    >
                      Password must contain at least 6 characters, one number,
                      and one special character.
                    </Tooltip>
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
                <p
                  className="text-left text-blue-500 hover:underline cursor-pointer mb-2"
                  onClick={toggleForgotPassword}
                >
                  Forgot Your Password?
                </p>
                <ForgotPasswordModal
                  isOpen={forgotPasswordOpen}
                  toggle={toggleForgotPassword}
                />

                <button
                  type="submit"
                  className="w-full bg-DiscordPurple text-white py-2 rounded-md hover:bg-DiscordPurpleDark transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Log In"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-left">
            <p className="text-gray-400">
              Need an account?{" "}
              <Link to={"/register"} className="text-blue-500 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginForm;
