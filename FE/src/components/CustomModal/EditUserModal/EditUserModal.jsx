import { useState, useCallback, memo } from "react";
import { Modal } from "reactstrap";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../actions/auth";
import LeftMenu from "./LeftMenu";
import UpdatePasswordSection from "./UpdatePasswordSection";
import ExitSection from "./ExitSection";

function EditUserModal({
  isOpen,
  toggle,
  userName,
  userEmail,
  userImageUrl,
  handleUpdate,
}) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [passwordModal, setPasswordModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const togglePasswordModal = useCallback(() => {
    setPasswordModal(!passwordModal);
    if (handleUpdate) {
      handleUpdate();
    }
  }, [passwordModal]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      fullscreen
      className="bg-gray-900 text-gray-300"
    >
      <div className="flex h-full">
        <LeftMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />

        <UpdatePasswordSection
          userName={userName}
          userEmail={userEmail}
          userImageUrl={userImageUrl}
          handleUpdate={handleUpdate}
          togglePasswordModal={togglePasswordModal}
          passwordModal={passwordModal}
        />

        <ExitSection toggle={toggle} />
      </div>
    </Modal>
  );
}

export default memo(EditUserModal);
