import { Button } from "reactstrap";

export default function HandleChangesSection({
  handleResetChanges,
  handleSaveChanges,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-between p-4 shadow-lg">
      <span>Careful — you have unsaved changes!</span>
      <div>
        <Button color="secondary" onClick={handleResetChanges} className="mr-2">
          Reset
        </Button>
        <Button color="success" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
