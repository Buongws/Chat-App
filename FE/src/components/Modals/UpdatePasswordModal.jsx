import { Fragment } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { updatePassword } from "../../actions/serverActions";
import { useDispatch } from "react-redux";
import Toast from "../../utility/toast";
import { ToastContainer } from "react-toastify";

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain at least one number and one special character"
    )
    .required("Password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .matches(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "New Password must contain at least one number and one special character"
    )
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const UpdatePasswordModal = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();

  const handlePasswordSave = async (
    values,
    { setSubmitting, setFieldError, resetForm }
  ) => {
    const { currentPassword, newPassword } = values;
    try {
      const response = await dispatch(
        updatePassword({
          oldPassword: currentPassword,
          newPassword: newPassword,
        })
      );
      if (response && response?.payload?.statusCode === 200) {
        Toast.showSuccess("Password updated successfully");
        resetForm();
        toggle();
      } else {
        throw new Error("Failed to update password. Please try again.");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setFieldError("currentPassword", "Current password is incorrect");
      } else {
        setFieldError(
          "general",
          "Failed to update password. Please try again."
        );
        Toast.showError("Failed to update password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fragment>
      <ToastContainer />
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalHeader
          toggle={toggle}
          className="text-white bg-[#36393F] border-b-0"
        >
          <h2 className="text-xl font-semibold">Update your password</h2>
        </ModalHeader>

        <Formik
          initialValues={{
            currentPassword: "abcxyz123@",
            newPassword: "abcxyz123@",
            confirmPassword: "abcxyz123@",
          }}
          validationSchema={validationSchema}
          onSubmit={handlePasswordSave}
        >
          {({ errors, touched, resetForm, isSubmitting }) => (
            <Form>
              <ModalBody className="bg-[#36393F]">
                <p className="text-md text-gray-400 mb-4">
                  Enter your current password and a new password.
                </p>

                <div className="mb-4">
                  <label className="text-gray-400 text-md mb-2">
                    Current Password
                  </label>
                  <Field
                    name="currentPassword"
                    type="password"
                    className={`w-full px-3 py-2 text-white bg-[#1e1f22] border-none rounded focus:outline-none ${
                      errors.currentPassword && touched.currentPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="currentPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-gray-400 text-md mb-2">
                    New Password
                  </label>
                  <Field
                    name="newPassword"
                    type="password"
                    className={`w-full px-3 py-2 text-white bg-[#1e1f22] border-none rounded focus:outline-none ${
                      errors.newPassword && touched.newPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-gray-400 text-md mb-2">
                    Confirm New Password
                  </label>
                  <Field
                    name="confirmPassword"
                    type="password"
                    className={`w-full px-3 py-2 text-white bg-[#1e1f22] border-none rounded focus:outline-none ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {errors.general && (
                  <div className="text-red-500 text-sm mt-2">
                    {errors.general}
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="bg-[#25282c] border-t-0">
                <Button
                  className="text-gray-400 underline border-none hover:text-white"
                  onClick={() => {
                    resetForm();
                    toggle();
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  className="bg-DiscordPurple hover:bg-DiscordPurpleDark px-4 py-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Done"}
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </Fragment>
  );
};

export default UpdatePasswordModal;
