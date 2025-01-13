import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import {
  XMarkIcon,
  HashtagIcon,
  SpeakerWaveIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Formik, Form, Field } from "formik";

const CustomModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  type,
  onSubmit,
  validationSchema,
  initialValues,
}) => {
  const isServerModal = type === "server";

  return (
    <Modal isOpen={isOpen} onClose={onClose} centered>
      <div className="bg-[#313338] text-white rounded-md w-full">
        <ModalHeader
          className={`border-b border-gray-700 p-4 ${
            isServerModal ? "text-center" : ""
          }`}
        >
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="text-sm text-gray-400">{subtitle}</div>
          <button
            onClick={onClose}
            className={`absolute ${
              isServerModal ? "top-8 right-8" : "top-4 right-4"
            } text-gray-400 hover:text-gray-200`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </ModalHeader>
        <ModalBody className="p-4">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ setFieldValue, isSubmitting, values }) => (
              <Form>
                <FormGroup>
                  {isServerModal && (
                    <div className="mb-3 flex justify-center">
                      <input
                        type="file"
                        id="serverImage"
                        accept="image/*"
                        onChange={(e) => {
                          // Handle file change
                          setFieldValue("image", e.currentTarget.files[0]);
                        }}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="serverImage" className="cursor-pointer">
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex justify-center items-center overflow-hidden">
                          {values.image ? (
                            <img
                              src={URL.createObjectURL(values.image)}
                              alt="Server Icon"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <PlusIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                  {!isServerModal && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-xs font-bold uppercase text-gray-400">
                        CHANNEL TYPE
                      </h3>
                      <div className="space-y-2 bg-[#2b2d31] p-2 rounded">
                        <label
                          className={`flex items-center justify-between cursor-pointer p-3 ${
                            values.channelType === "TEXT"
                              ? "bg-[#404249]"
                              : "hover:bg-[#35373C]"
                          }`}
                        >
                          <div className="flex items-center">
                            <HashtagIcon className="mr-3 h-6 w-6" />
                            <div className="flex flex-col">
                              <span className="text-base font-medium">
                                Text
                              </span>
                              <span className="text-xs text-[#B5BAC1]">
                                Send messages, images, GIFs, emoji, opinions,
                                and puns
                              </span>
                            </div>
                          </div>
                          <Field
                            type="radio"
                            name="channelType"
                            value="TEXT"
                            className="w-5 h-5 border-2 border-[#B5BAC1] rounded-full checked:bg-[#404249] appearance-none relative before:absolute before:inset-0 before:m-auto before:w-2 before:h-2 before:rounded-full before:bg-white before:opacity-0 checked:before:opacity-100"
                          />
                        </label>
                        <div className="h-px bg-[#35373C]"></div>
                        <label
                          className={`flex items-center justify-between cursor-pointer p-3 ${
                            values.channelType === "VOICE"
                              ? "bg-[#404249]"
                              : "hover:bg-[#35373C]"
                          }`}
                        >
                          <div className="flex items-center">
                            <SpeakerWaveIcon className="mr-3 h-6 w-6" />
                            <div className="flex flex-col">
                              <span className="text-base font-medium">
                                Voice
                              </span>
                              <span className="text-xs text-[#B5BAC1]">
                                Hang out together with voice, video, and screen
                                share
                              </span>
                            </div>
                          </div>
                          <Field
                            type="radio"
                            name="channelType"
                            value="VOICE"
                            className="w-5 h-5 border-2 border-[#B5BAC1] rounded-full checked:bg-[#404249] appearance-none relative before:absolute before:inset-0 before:m-auto before:w-2 before:h-2 before:rounded-full before:bg-white before:opacity-0 checked:before:opacity-100"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                  <Label
                    htmlFor={isServerModal ? "serverName" : "channelName"}
                    className="mb-2 flex text-xs font-bold uppercase text-gray-400"
                  >
                    {isServerModal ? "SERVER NAME" : "CHANNEL NAME"}
                  </Label>
                  <Field
                    name={isServerModal ? "serverName" : "channelName"}
                    as={Input}
                    placeholder={
                      isServerModal ? "Enter server name" : "new-channel"
                    }
                    className="p-2 text-white placeholder-gray-500 bg-[#1e1f22] border-none focus:ring-0 rounded-md w-full"
                    style={{ backgroundColor: "#1e1f22" }}
                  />
                  {isServerModal && (
                    <div className="flex text-[12px] text-[#696e75] mt-2">
                      By creating a server, you agree to SyncRoom{" "}
                      <a className="ml-2 text-[#03a0ef]">
                        {" "}
                        Community Guidelines
                      </a>
                    </div>
                  )}
                </FormGroup>
                <ModalFooter
                  className={`border-t border-gray-700 p-4 ${
                    isServerModal ? "flex justify-between" : "flex justify-end"
                  }`}
                >
                  {isServerModal ? (
                    <>
                      <Button
                        color="secondary"
                        onClick={onClose}
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
                        {isSubmitting ? "Creating..." : "Create"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={onClose}
                        className="hover:underline mr-3 cursor-pointer mt-2"
                      >
                        Cancel
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          !values[isServerModal ? "serverName" : "channelName"]
                        }
                        className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-[#5865f2] disabled:opacity-50 px-4 py-2 rounded"
                      >
                        Create {isServerModal ? "Server" : "Channel"}
                      </Button>
                    </>
                  )}
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </div>
    </Modal>
  );
};

export default CustomModal;
