import { useDispatch } from "react-redux";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { deleteServerMember } from "../../actions/serverActions";
import Toast from "../../utility/toast";
import { useEffect } from "react";

const DeleteMemberModal = ({
  serverId,
  isOpen,
  toggle,
  user,
  handleUpdate,
}) => {
  const dispatch = useDispatch();

  const handleDeleteMember = (serverId, user) => {
    dispatch(deleteServerMember({ id: serverId, data: { memberId: user } }))
      .unwrap()
      .then(() => {
        Toast.showSuccess("Member deleted successfully!");
        toggle();
        if (handleUpdate) {
          handleUpdate();
        }
      })
      .catch(() => {
        Toast.showError("Failed to delete member from Server!");
        toggle();
      });
  };
  useEffect(() => {
    if (handleUpdate) {
      handleUpdate();
    }
  }, [toggle]);

  return (
    <div className="flex justify-items-start items-center h-screen">
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalBody className="bg-[#36393F] text-gray-100 text-center">
          <h2 className="text-lg font-bold mb-4">Delete Member</h2>
          <p className="text-sm mb-4">
            Are you sure you want to delete{" "}
            <span className="font-bold">{user?.name}</span>? This cannot be
            undone.
          </p>
        </ModalBody>
        <ModalFooter className="bg-[#2f3136]">
          <Button
            className="text-white border-none underline hover:bg-none"
            onClick={toggle}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteMember(serverId, user?.userId)}
            className="bg-red-700 text-white border-none hover:bg-red-900 transition-colors"
          >
            Delete Member
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DeleteMemberModal;
