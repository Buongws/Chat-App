export default function UserProfileImageSection({
  values,
  handleImageClick,
  currentImageUrl,
  imageInputRef,
  handleImageChange,
}) {
  return (
    <div className="flex items-center mb-6">
      <div className="relative group cursor-pointer" onClick={handleImageClick}>
        <img
          src={currentImageUrl}
          alt="Profile"
          className="w-16 h-16 rounded-full"
        />

        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#36393F] rounded-full"></div>

        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      <h2 className="ml-4 text-lg font-bold cursor-default">
        {values.username}
      </h2>
    </div>
  );
}
