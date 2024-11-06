import { ErrorMessage, Field } from "formik";
import { Button } from "reactstrap";

export default function EditEmailSection({
  values,
  isEditingEmail,
  handleChange,
  isEmailRevealed,
  maskedEmail,
  toggleEmailReveal,
  handleEmailSave,
  toggleEmailEdit,
}) {
  return (
    <div className="mb-4 p-3">
      <label className="block text-sm mb-3">Email</label>
      <div className="flex items-center justify-between">
        {isEditingEmail ? (
          <Field
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1e1f22] focus:bg-[#1e1f22] border-none border-gray-500 rounded focus:outline-none mr-2"
          />
        ) : (
          <span>{isEmailRevealed ? values.email : maskedEmail}</span>
        )}
        <div className="flex items-center">
          <Button
            onClick={toggleEmailReveal}
            className="mr-2 text-white underline border-none hover:bg-none"
            type="button"
          >
            {isEmailRevealed ? "Hide" : "Reveal"}
          </Button>
          <Button
            onClick={() => {
              if (isEditingEmail) handleEmailSave(values.email);
              toggleEmailEdit();
            }}
            type="button"
            className="bg-[#36393F] text-sm text-white font-bold hover:bg-gray-600"
          >
            {isEditingEmail ? "Save" : "Edit"}
          </Button>
        </div>
      </div>
      <ErrorMessage name="email" component="div" className="text-red-500" />
    </div>
  );
}
