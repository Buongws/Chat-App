import React from "react";

const ServerIcon = React.memo(({ label, imgSrc, isMainServer, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-12 my-1 rounded-full flex justify-center items-center relative cursor-pointer`}
    >
      {isMainServer && (
        <div className="absolute w-1 h-full bg-white top-0 right-[110%] rounded-sm"></div>
      )}
      <img
        src={imgSrc}
        alt={label}
        className={`w-12 h-12 object-cover ${
          isMainServer ? "rounded-lg" : "rounded-full"
        }`}
      />
    </div>
  );
});

export default ServerIcon;
