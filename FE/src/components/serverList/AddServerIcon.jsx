import { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import { XMarkIcon, PlusIcon } from "@heroicons/react/16/solid";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { createServer } from "../../actions/serverActions";
import Toast from "../../utility/toast";

const AddServerIcon = ({ onServerCreated }) => {
  const [modal, setModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.servers);

  const toggle = () => setModal(!modal);

  const handleFileChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFieldValue("image", file);
    }
  };

  const validationSchema = Yup.object().shape({
    serverName: Yup.string().required("Server name is required"),
    image: Yup.mixed().required("Image is required"),
  });

  const handleCreateServer = (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("serverName", values.serverName);
    formData.append("image", values.image);

    dispatch(createServer(formData))
      .then(() => {
        setImagePreview(null);
        toggle();
        setSubmitting(false);

        // Trigger re-fetch of servers if onServerCreated is provided
        if (onServerCreated) {
          onServerCreated();
        }

        Toast.showSuccess("Server created successfully");
      })
      .catch(() => {
        setSubmitting(false);
        Toast.showError("Failed to create server");
      });
  };

  const closeBtn = (
    <div className="absolute right-4 top-2">
      <button className="close mb-3" onClick={toggle} type="button">
        <XMarkIcon className="h-6 w-6 text-gray-500" />
      </button>
    </div>
  );

  return (
    <>
      <Button
        className="mt-2 bg-gray-700 w-12 h-12 rounded-full flex justify-center items-center cursor-pointer hover:bg-green-600"
        onClick={toggle}
      >
        <svg
          className="text-green-400"
          aria-hidden="false"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z"
          ></path>
        </svg>
      </Button>

      <Modal isOpen={modal} toggle={toggle} centered>
        <ModalHeader className="relative flex justify-center border-none text-center bg-[#2b2d31]">
          <div className="py-3 font-bold text-2xl text-white">
            Customize Your Server
          </div>
          {closeBtn}
          <div className="text-gray-400 text-xl">
            Give your new server a personality with a name and an icon. You can
            always change it later.
          </div>
        </ModalHeader>
        <ModalBody className="text-center bg-[#2b2d31]">
          <Formik
            initialValues={{ serverName: "", image: null }}
            validationSchema={validationSchema}
            onSubmit={handleCreateServer}
          >
            {({ setFieldValue, isSubmitting, values }) => (
              <Form>
                <FormGroup>
                  <div className="mb-3 flex justify-center">
                    <input
                      type="file"
                      id="serverImage"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="serverImage" className="cursor-pointer">
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex justify-center items-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Server Icon"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <PlusIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </label>
                  </div>
                  <Label
                    for="serverName"
                    className="mb-2 flex text-sm font-bold text-white"
                  >
                    SERVER NAME
                  </Label>
                  <Field
                    name="serverName"
                    as={Input}
                    placeholder="Enter server name"
                    className="p-2 text-white placeholder-white bg-[#1e1f22] border-none focus:ring-0 rounded-md w-full"
                    style={{ backgroundColor: "#1e1f22" }}
                  />
                  <div className="flex text-[12px] text-[#696e75]">
                    By creating a server, you agree to Discord{" "}
                    <a className="ml-2 text-[#03a0ef]"> Community Guidelines</a>
                  </div>
                </FormGroup>
                <ModalFooter className="flex justify-between bg-[#2b2d31]  border-none">
                  <Button
                    color="secondary"
                    onClick={toggle}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={
                      isSubmitting || !values.serverName || !values.image
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                  >
                    {isSubmitting || loading ? "Creating..." : "Create"}
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </>
  );
};

export default AddServerIcon;
