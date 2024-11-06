import { Button } from "reactstrap";

export default function HandleChangesSection({
  handleResetField,
  handleSaveChanges,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-between p-4 shadow-lg">
      <span>Careful — you have unsaved changes!</span>
      <div>
        <Button color="secondary" onClick={handleResetField} className="mr-2">
          Reset
        </Button>
        <Button color="success" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
