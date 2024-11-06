import { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  InputGroup,
  Input,
} from "reactstrap";

function InviteCodeModal({ isOpen, toggle, inviteCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        className="text-gray-300 custom-modal"
        centered={true}
      >
        <ModalHeader
          toggle={toggle}
          className="bg-[#2f3136] text-gray-300 border-b-0"
        >
          <button
            onClick={toggle}
            className="absolute top-2 right-4 text-gray-300 hover:text-white transition-colors text-2xl"
          >
            &times;
          </button>
        </ModalHeader>
        <ModalBody className="bg-[#2f3136] text-gray-300 rounded-b-md">
          <p>Use this invite code to invite friends to your server:</p>
          <InputGroup className="mt-3 ">
            <Input
              value={inviteCode}
              readOnly
              className="bg-[#36393F] text-gray-50 focus:bg-[#36393F]"
            />
            <Button
              onClick={handleCopy}
              className={`py-2 px-3 rounded-full text-white transition-colors ${
                copied ? "bg-green-500" : "bg-DiscordPurple"
              }`}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </InputGroup>
          <p className="mt-3 text-xs ">
            The invite code will only be valid for 1 day.
          </p>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default InviteCodeModal;
