import { memo } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { deleteChannel } from "../../actions/serverActions";
import Toast from "../../utility/toast";

function DeleteChannelModal({
  toggleEditChannelModal,
  isOpen,
  toggle,
  channelId,
  onChannelUpdate,
}) {
  const dispatch = useDispatch();

  console.log("DeleteChannelModal -> channelId", channelId);

  const handleDeleteChannel = () => {
    dispatch(deleteChannel(channelId))
      .then(() => {
        toggle();
        toggleEditChannelModal();
        onChannelUpdate();
        Toast.showSuccess("Channel deleted successfully");
      })
      .catch(() => {
        Toast.showError("Channel deletion failed");
      });
  };
  return (
    <div className="flex justify-items-start items-center h-screen">
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalBody className="bg-[#36393F] text-gray-100 text-center">
          <h2 className="text-lg font-bold mb-4">Delete Channel</h2>
          <p className="text-sm mb-4">
            Are you sure you want to delete{" "}
            <span className="font-bold">Channel Name</span>? This cannot be
            undone.
          </p>
        </ModalBody>
        <ModalFooter className="bg-[#2f3136]">
          <Button
            className=" text-white border-none underline hover:bg-none"
            onClick={toggle}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteChannel}
            className="bg-red-700 text-white border-none hover:bg-red-900 transition-colors"
          >
            Delete Channel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default memo(DeleteChannelModal);
