import { useState, useEffect, useCallback } from "react";
import { Modal } from "reactstrap";
import { useDispatch } from "react-redux";
import DeleteChannelModal from "../Modals/DeleteChannelModal";
import { updateChannel } from "../../actions/serverActions";
import ExitSection from "./EditChannelModal/ExitSection";
import EditChannelNameSection from "./EditChannelModal/EditChannelNameSection";
import LeftMenu from "./EditChannelModal/LeftMenu";
import HandleChangesSection from "./EditChannelModal/HandleChangesSection";
import Toast from "../../utility/toast";

function EditChannelModal({
  isOpen,
  toggle,
  channelId,
  channelName,
  setChannelName,
  onChannelUpdate,
}) {
  const [originalChannelName, setOriginalChannelName] = useState("");
  const [deleteChannelModal, setDeleteChannelModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  const dispatch = useDispatch();

  const toggleDeleteChannelModal = useCallback(
    () => setDeleteChannelModal(!deleteChannelModal),
    [deleteChannelModal]
  );

  useEffect(() => {
    if (channelName && !hasChanges) {
      setOriginalChannelName(channelName);
    }
  }, [channelName, hasChanges]);

  const handleChannelNameChange = (e) => {
    const newValue = e.target.value;
    setChannelName(newValue);
    setHasChanges(newValue !== channelName);
  };

  const handleSaveChanges = () => {
    dispatch(updateChannel({ id: channelId, data: { channelName } }))
      .then(() => {
        setHasChanges(false);
        setShowAlert(false);
        Toast.showSuccess("Channel updated successfully");

        if (onChannelUpdate) {
          onChannelUpdate();
        }
      })
      .catch(() => {
        Toast.showError("Failed to update channel");
      });
  };

  const handleResetField = () => {
    setChannelName(originalChannelName);
    setHasChanges(false);
  };

  useEffect(() => {
    if (hasChanges) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [hasChanges]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      fullscreen
      className="bg-gray-900 text-gray-300"
    >
      <div className="flex h-full min-h-screen">
        {/* Sidebar */}
        <LeftMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleDeleteChannelModal={toggleDeleteChannelModal}
        />

        {/* Main content */}
        <div className="w-full md:w-1/2 bg-[#36393F] p-6 flex flex-col justify-start items-start">
          <h3 className="mt-5 text-white font-bold text-lg mb-6 cursor-default">
            Channel Overview
          </h3>

          {/* Channel Name Input */}
          <EditChannelNameSection
            channelName={channelName}
            handleChannelNameChange={handleChannelNameChange}
          />
        </div>

        {/* Close Button */}
        <ExitSection toggle={toggle} />
      </div>

      {/* Delete Channel Modal */}
      <DeleteChannelModal
        toggleEditChannelModal={toggle}
        isOpen={deleteChannelModal}
        toggle={toggleDeleteChannelModal}
        channelId={channelId}
        onChannelUpdate={onChannelUpdate}
      />

      {/* Unsaved changes alert */}
      {showAlert && (
        <HandleChangesSection
          handleResetField={handleResetField}
          handleSaveChanges={handleSaveChanges}
        />
      )}
    </Modal>
  );
}

export default EditChannelModal;
