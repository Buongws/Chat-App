import { Input } from "reactstrap";

export default function EditChannelNameSection({
  channelName,
  handleChannelNameChange,
}) {
  return (
    <div className="ml-4 mb-7 w-full">
      <span>CHANNEL NAME</span>
      <Input
        type="text"
        value={channelName}
        onChange={handleChannelNameChange}
        className="bg-[#1e1f22] mt-2 text-white pb-2 px-4 w-full rounded-md focus:bg-[#1e1f22] border-none"
      />
    </div>
  );
}
