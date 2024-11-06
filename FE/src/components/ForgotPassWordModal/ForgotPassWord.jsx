import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { requestForgotPassword } from "../../actions/serverActions";

const ForgotPasswordModal = ({ isOpen, toggle }) => {
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmittedEmail(values.email);
    setError("");
    setIsSubmitted(false);

    try {
      await dispatch(requestForgotPassword(values)).unwrap();
      setIsSubmitted(true);
      resetForm();
    } catch (error) {
      setError("This email has not been registered, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitted(false);
      setSubmittedEmail("");
      setError("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader
        className="bg-gray-800 text-xl font-bold text-white"
        toggle={toggle}
      >
        {isSubmitted ? "Instructions sent" : "Forgot Password"}
      </ModalHeader>
      <ModalBody className="bg-gray-800">
        {isSubmitted ? (
          <p className="text-white text-lg">
            We sent instructions to change your password to {submittedEmail}.
            Please check both your inbox and spam folder.
          </p>
        ) : (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="bg-gray-800">
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-400 mb-2">
                    Please provide your email address:
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 bg-gray-700 focus:bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Email address"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                  {error && (
                    <div className="text-red-500 text-sm mt-1">{error}</div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </ModalBody>
      {isSubmitted && (
        <ModalFooter className="bg-gray-800">
          <Button
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
            onClick={toggle}
          >
            Close
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
