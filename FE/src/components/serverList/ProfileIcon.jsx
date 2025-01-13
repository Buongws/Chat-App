import { useNavigate } from "react-router-dom";
import discordIcon from "../../assets/images/landingPage/LOGOX.png";

const ProfileIcon = ({ onClick }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/channels/@me");
    onClick();
  };

  return (
    <div
      className="mt-2 w-[48px] h-[48px] p-3 bg-gray-700 rounded-full flex justify-center items-center relative cursor-pointer hover:bg-blue-600 hover:rounded-lg"
      onClick={handleProfileClick}
    >
      <img src={discordIcon} alt="discord" className="w-12 h-12 object-cover" />
    </div>
  );
};

export default ProfileIcon;
