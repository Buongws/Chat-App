import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { register } from "../actions/auth";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [emailTooltipOpen, setEmailTooltipOpen] = useState(false);
  const [usernameTooltipOpen, setUsernameTooltipOpen] = useState(false);
  const [passwordTooltipOpen, setPasswordTooltipOpen] = useState(false);

  const toggleEmailTooltip = () => setEmailTooltipOpen(!emailTooltipOpen);
  const toggleUsernameTooltip = () =>
    setUsernameTooltipOpen(!usernameTooltipOpen);
  const togglePasswordTooltip = () =>
    setPasswordTooltipOpen(!passwordTooltipOpen);
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    username: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .required("Username is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
        "Password must contain at least one number and one special character"
      )
      .required("Password is required"),
  });

  const handleRegister = (values, { setSubmitting }) => {
    const { username, email, password } = values;
    dispatch(register(username, email, password))
      .then(() => {
        setTimeout(() => navigate("/login"), 1000);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };

  return (
    <Fragment>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-LoginGray p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Create an account
          </h2>

          <Formik
            initialValues={{
              email: "test23@gmail.com",
              username: "wgegfwef",
              password: "abcxyz123@",
            }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
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
                    htmlFor="username"
                    className="block text-gray-400 mb-2"
                  >
                    USERNAME
                    <span id="username-reminder" className="text-red-500">
                      {" "}
                      *
                    </span>
                    <Tooltip
                      placement="right"
                      isOpen={usernameTooltipOpen}
                      target="username-reminder"
                      toggle={toggleUsernameTooltip}
                    >
                      Username should have at least 3 characters
                    </Tooltip>
                  </label>
                  <Field
                    type="text"
                    id="username"
                    name="username"
                    className="w-full px-3 py-2 bg-InputFieldDark text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <ErrorMessage
                    name="username"
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

                <button
                  type="submit"
                  className="w-full bg-DiscordPurple text-white py-2 rounded-md hover:bg-DiscordPurpleDark transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Continue"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-left">
            <p className="text-gray-400">
              <Link to="/login" className="text-blue-500 hover:underline">
                Already have an account?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default RegisterForm;
