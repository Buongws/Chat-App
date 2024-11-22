import microphone from "../../assets/images/icons/microphone.png";
import headset from "../../assets/images/icons/headset.png";
import mutedMicrophone from "../../assets/images/icons/4649-microphone-muted.png"; // Add a muted mic icon
import mutedHeadset from "../../assets/images/icons/muted-headset.png"; // Add a muted headset icon
import ecBigger from "../../assets/images/icons/ec-bigger.png";
import { useCallback, useState } from "react";
import EditUserModal from "../CustomModal/EditUserModal/EditUserModal";
import { useSelector } from "react-redux";

const Footer = ({
  handleUpdate,
  toggleMicMute,
  toggleHeadphoneMute,
  isMicMuted,
  isHeadphoneMuted,
}) => {
  const [modal, setModal] = useState(false);

  const toggleModal = useCallback(() => {
    setModal(!modal);
    if (handleUpdate) {
      handleUpdate();
    }
  }, [modal]);

  const { user } = useSelector((state) => state.user);

  return (
    <div className="absolute left-0 bottom-0 right-0 bg-gray-800 p-2 flex justify-between items-center">
      <div className="flex items-center">
        <img
          src={user?.data?.imageUrl}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-2">
          <p className="text-white text-sm font-bold">{user?.data?.name}</p>
          <p className="text-gray-400 text-xs truncate max-w-[7rem]">
            {user?.data?.userId}
          </p>
        </div>
      </div>
      <div className="flex">
        <div
          className="relative cursor-pointer mr-3"
          onClick={() => toggleMicMute()}
        >
          <img
            src={isMicMuted ? mutedMicrophone : microphone}
            alt="Mute/Unmute Mic"
          />
        </div>
        <div
          className="relative cursor-pointer mr-3"
          onClick={() => toggleHeadphoneMute()}
        >
          <img
            src={isHeadphoneMuted ? mutedHeadset : headset}
            alt="Mute/Unmute Headphone"
          />
        </div>
        <div className="relative cursor-pointer" onClick={toggleModal}>
          <img src={ecBigger} alt="Settings" />
        </div>
        <EditUserModal
          isOpen={modal}
          toggle={toggleModal}
          userName={user?.data?.name}
          userEmail={user?.data?.email}
          userImageUrl={user?.data?.imageUrl}
          handleChange={handleUpdate}
        />
      </div>
    </div>
  );
};

export default Footer;
