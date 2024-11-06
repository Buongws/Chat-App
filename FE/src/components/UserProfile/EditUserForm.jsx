import { useState, useRef, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useDispatch } from "react-redux";
import { updateUser } from "../../actions/serverActions";

import EditUserNameSection from "./EditUserForm/EditUserNameSection";
import EditEmailSection from "./EditUserForm/EditEmailSection";
import UserProfileImageSection from "./EditUserForm/UserProfileImageSection";
import Toast from "../../utility/toast";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .required("Username is required"),
});

const EditUserForm = ({ username, email, imageUrl, handleUpdate }) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(username);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);

  useEffect(() => {
    setCurrentUsername(username);
  }, [username]);

  useEffect(() => {
    setCurrentEmail(email);
  }, [email]);

  useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  const dispatch = useDispatch();

  const imageInputRef = useRef(null);

  const maskedEmail = `${"*".repeat(
    currentEmail?.indexOf("@")
  )}${currentEmail?.slice(currentEmail?.indexOf("@"))}`;

  const toggleUsernameEdit = () => setIsEditingUsername(!isEditingUsername);
  const toggleEmailEdit = () => setIsEditingEmail(!isEditingEmail);
  const toggleEmailReveal = () => setIsEmailRevealed(!isEmailRevealed);

  const handleImageClick = () => {
    imageInputRef.current.click();
  };

  const uploadImage = (image) => {
    const formData = new FormData();
    formData.append("image", image);
    try {
      dispatch(updateUser(formData)).then(() => {
        if (handleUpdate) {
          handleUpdate();
        }
        Toast.showSuccess("Profile image updated successfully");
      });
    } catch (error) {
      Toast.showError("Failed to update profile image");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setCurrentImageUrl(newImageUrl);
      uploadImage(file);
    }
  };

  const handleUsernameSave = (name) => {
    const formData = new FormData();
    formData.append("name", name);

    dispatch(updateUser(formData))
      .unwrap()
      .then(() => {
        if (handleUpdate) {
          handleUpdate();
        }
        Toast.showSuccess("Username updated successfully");
      })
      .catch(() => {
        Toast.showError("Failed to update username");
      });
  };

  const handleEmailSave = async (email) => {
    const formData = new FormData();
    formData.append("email", email);

    dispatch(updateUser(formData))
      .unwrap()
      .then(() => {
        if (handleUpdate) {
          handleUpdate();
        }
        Toast.showSuccess("Email updated successfully");
      })
      .catch(() => {
        Toast.showError("Failed to update email");
      });
  };

  return (
    <Formik
      initialValues={{
        username: currentUsername,
        email: currentEmail,
      }}
      validationSchema={validationSchema}
    >
      {({ values, handleChange }) => (
        <Form className="w-full mx-auto bg-[#2f3136] border-[#1f2024] p-6 text-white">
          <UserProfileImageSection
            values={values}
            handleImageClick={handleImageClick}
            currentImageUrl={currentImageUrl}
            imageInputRef={imageInputRef}
            handleImageChange={handleImageChange}
          />

          <div className="p-3 bg-[#313540] rounded-md">
            {/* Username Section */}
            <EditUserNameSection
              values={values}
              isEditingUsername={isEditingUsername}
              handleChange={handleChange}
              handleUsernameSave={handleUsernameSave}
              toggleUsernameEdit={toggleUsernameEdit}
            />

            {/* Email Section */}
            <EditEmailSection
              values={values}
              isEditingEmail={isEditingEmail}
              handleChange={handleChange}
              isEmailRevealed={isEmailRevealed}
              maskedEmail={maskedEmail}
              toggleEmailReveal={toggleEmailReveal}
              handleEmailSave={handleEmailSave}
              toggleEmailEdit={toggleEmailEdit}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default EditUserForm;
