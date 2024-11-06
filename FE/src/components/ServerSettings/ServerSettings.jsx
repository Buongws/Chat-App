import { useState, useEffect, useCallback, memo } from "react";
import { Button, Modal, Input } from "reactstrap";
import { useDispatch } from "react-redux";
import { fetchServers, updateServer } from "../../actions/serverActions";
import HandleChangesSection from "./EditServer/HandleChangesSection";
import ExitSection from "./EditServer/ExitSection";
import Toast from "../../utility/toast";

function ServerSettings({
  isOpen,
  toggle,
  serverId,
  serverName,
  imageUrl,
  setServerName,
  setImageUrl,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [originalServerName, setOriginalServerName] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  useEffect(() => {
    if (serverName && imageUrl) {
      setOriginalServerName(serverName);
      setOriginalImageUrl(imageUrl);
    }
  }, []);

  const dispatch = useDispatch();

  const handleServerNameChange = useCallback(
    (e) => {
      setServerName(e.target.value);
      setHasChanges(e.target.value !== serverName || imageFile !== null);
    },
    [serverName, imageFile]
  );

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file)); // Update preview with the new image
      setHasChanges(true);
    }
  }, []);

  const handleSaveChanges = useCallback(() => {
    const formData = new FormData();
    formData.append("serverName", serverName);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    dispatch(updateServer({ id: serverId, data: formData }))
      .then(() => {
        setHasChanges(false);
        setShowAlert(false);
        dispatch(fetchServers());
        Toast.showSuccess("Server updated successfully");
      })
      .catch(() => {
        Toast.showError("Failed to update server");
      });
  }, [serverName, imageFile, dispatch, serverId]);

  useEffect(() => {
    if (hasChanges) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [hasChanges]);

  const handleResetChanges = () => {
    setServerName(originalServerName);
    setImageUrl(originalImageUrl);
    setHasChanges(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      fullscreen
      className="bg-gray-900 text-gray-300"
    >
      <div className="flex h-full ">
        <div className="w-full md:w-1/4 bg-[#2f3136] md:pl-12 lg:pl-48 pt-4 pr-2 overflow-y-auto">
          <h4 className="text-gray-400 mt-5 mb-6 text-center md:text-left text-sm font-bold cursor-default">
            Server Settings
          </h4>
          <ul className="mt-4 space-y-4 cursor-pointer">
            <li
              className={`p-2 rounded ${
                activeTab === "Overview"
                  ? "bg-gray-700 text-white"
                  : "hover:bg-gray-700 text-gray-400"
              }`}
              onClick={() => setActiveTab("Overview")}
            >
              Overview
            </li>
          </ul>
        </div>
        <div className="w-2/4 bg-[#36393F] p-6 flex flex-col justify-start items-start">
          <h3 className="mt-5 text-white font-bold text-lg mb-6 cursor-default">
            Server Overview
          </h3>
          <div className="flex items-center">
            <div className="relative">
              <img
                src={imageUrl}
                alt="Server"
                className="w-32 h-32 rounded-full border-solid border-2 border-[#33363d]"
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer "
              />
            </div>
            <div className="ml-4 w-1/3">
              <span className="text-sm">
                {" "}
                We recommend an image of at least 512x512 for the server.
              </span>
              <Button
                color="secondary"
                onClick={() =>
                  document.querySelector('input[type="file"]').click()
                }
                className="bg-[#36393F] px-1 py-2 mt-3 text-sm text-white py-2 px-4 rounded-md hover:bg-[#3f4247] transition-colors "
              >
                Upload Image
              </Button>
            </div>

            <div className="ml-4 mb-7">
              <span>SERVER NAME</span>
              <Input
                type="text"
                value={serverName}
                onChange={handleServerNameChange}
                className="bg-[#1e1f22] mt-2 text-white pb-2 px-4 rounded-md focus:bg-[#1e1f22] border-none"
              />
            </div>
          </div>
        </div>
        <ExitSection toggle={toggle} />
      </div>

      {showAlert && (
        <HandleChangesSection
          handleResetChanges={handleResetChanges}
          handleSaveChanges={handleSaveChanges}
        />
      )}
    </Modal>
  );
}

export default memo(ServerSettings);
