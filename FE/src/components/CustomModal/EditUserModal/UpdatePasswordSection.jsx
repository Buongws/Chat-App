import { Button } from "reactstrap";
import UpdatePasswordModal from "../../Modals/UpdatePasswordModal";
import EditUserForm from "../../../components/UserProfile/EditUserForm";
export default function UpdatePasswordSection({
  userName,
  userEmail,
  userImageUrl,
  handleUpdate,
  togglePasswordModal,
  passwordModal,
}) {
  return (
    <div className="w-full md:w-3/4 bg-[#36393F] p-6 flex flex-col justify-start items-start space-y-6">
      <EditUserForm
        username={userName}
        email={userEmail}
        imageUrl={userImageUrl}
        handleUpdate={handleUpdate}
      />

      <div className="w-full mr-auto bg-[#2f3136] p-6 rounded-md">
        <span className="text-white text-lg font-semibold">
          Password and Authentication
        </span>
        <div className="mt-4">
          <Button
            className="p-3 rounded-xs h-fit bg-DiscordPurple text-xs text-white font-bold hover:bg-DiscordPurpleDark"
            onClick={togglePasswordModal}
          >
            Change Password
          </Button>
        </div>
        <UpdatePasswordModal
          isOpen={passwordModal}
          toggle={togglePasswordModal}
        />
      </div>
    </div>
  );
}
