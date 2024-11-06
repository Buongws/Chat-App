import Discord404 from "../../assets/images/Discord404Logo.svg";
const NotFoundChannel = () => {
  return (
    <div className="flex items-center justify-center flex-1 text-center">
      <div>
        <img src={Discord404} alt="No Channels" className="mx-auto" />
        <h2 className="text-gray-400 text-xl mt-4">NO TEXT CHANNELS</h2>
        <p className="text-gray-500 mt-2">
          You find yourself in a strange place. You don’t have access to any
          text channels, or there are none in this server.
        </p>
      </div>
    </div>
  );
};

export default NotFoundChannel;
