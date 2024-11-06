import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const LogoutConfirmModal = ({ isOpen, toggle, onConfirm }) => (
  <Modal isOpen={isOpen} toggle={toggle} centered>
    <ModalHeader toggle={toggle} className="bg-[#313338] text-white">
      Confirm Logout
    </ModalHeader>
    <ModalBody className="bg-[#313338] text-white">
      Are you sure you want to log out?
    </ModalBody>
    <ModalFooter className="bg-[#313338]">
      <Button
        color="secondary"
        onClick={toggle} // Close the modal without logging out
        className="bg-gray-500 hover:bg-gray-600 text-white"
      >
        Cancel
      </Button>
      <Button
        color="danger"
        onClick={onConfirm} // Call handleLogout only here
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Logout
      </Button>
    </ModalFooter>
  </Modal>
);

export default LogoutConfirmModal;
