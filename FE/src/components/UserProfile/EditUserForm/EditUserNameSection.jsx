import { ErrorMessage, Field } from "formik";
import { Button } from "reactstrap";

export default function EditUserNameSection({
  values,
  isEditingUsername,
  handleChange,
  handleUsernameSave,
  toggleUsernameEdit,
}) {
  return (
    <div className="mb-4 p-3">
      <label className="block text-sm mb-3">Username</label>
      <div className="flex items-center justify-between">
        {isEditingUsername ? (
          <Field
            name="username"
            type="text"
            value={values.username}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1e1f22] focus:bg-[#1e1f22] border-none border-gray-500 rounded focus:outline-none mr-2"
          />
        ) : (
          <span>{values.username}</span>
        )}
        <Button
          onClick={() => {
            if (isEditingUsername) handleUsernameSave(values.username);
            toggleUsernameEdit();
          }}
          type="button"
          className="bg-[#36393F] text-sm text-white font-bold hover:bg-gray-600"
        >
          {isEditingUsername ? "Save" : "Edit"}
        </Button>
      </div>
      <ErrorMessage name="username" component="div" className="text-red-500" />
    </div>
  );
}
