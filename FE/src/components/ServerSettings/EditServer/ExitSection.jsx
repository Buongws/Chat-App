import { Button } from "reactstrap";

export default function ExitSection({ toggle }) {
  return (
    <div className="w-1/4 bg-[#36393F] flex items-start justify-start p-4 flex-col ">
      <Button
        onClick={toggle}
        className="mt-12 p-3 rounded-full bg-[#36393F] text-xs text-white font-bold hover:bg-gray-600 "
      >
        <span className="px-1">X</span>
      </Button>
      <p className="text-xs pl-4 mt-2 font-bold">ESC</p>
    </div>
  );
}
