import { useState } from "react";
import DiscordBlackLogo from "../assets/images/landingPage/LOGOX.png";
import PageNotFoundGif from "../assets/images/DiscordPageNotFoundGIF.gif";
import { useNavigate } from "react-router-dom";
import Bars4Icon from "@heroicons/react/24/solid/Bars4Icon";
const NotFoundPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="bg-white flex flex-col min-h-screen justify-between">
        <header className="absolute top-0 w-full flex items-center justify-between px-6 py-4">
          <img
            src={DiscordBlackLogo}
            alt="Discord Logo"
            className="w-[8rem] h-[6rem] cursor-pointer"
            onClick={() => navigate("/")}
          />

          <nav className="hidden md:flex space-x-6">
            <a href="" className="text-sm text-gray-600 hover:text-gray-900">
              Download
            </a>
            <a href="" className="text-sm text-gray-600 hover:text-gray-900">
              Nitro
            </a>
            <a href="" className="text-sm text-gray-600 hover:text-gray-900">
              Discover
            </a>
            <a href="" className="text-sm text-gray-600 hover:text-gray-900">
              Safety
            </a>
            <a href="" className="text-sm text-gray-600 hover:text-gray-900">
              Support
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              className="bg-indigo-600 text-white rounded-full px-8 py-2 text-sm"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 focus:outline-none"
              >
                <Bars4Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {isOpen && (
            <nav className="absolute top-16 mt-2 right-0 bg-white w-full flex flex-col items-center py-4 space-y-4 shadow-md md:hidden">
              <a href="" className="text-sm text-gray-600 hover:text-gray-900">
                Download
              </a>
              <a href="" className="text-sm text-gray-600 hover:text-gray-900">
                Nitro
              </a>
              <a href="" className="text-sm text-gray-600 hover:text-gray-900">
                Discover
              </a>
              <a href="" className="text-sm text-gray-600 hover:text-gray-900">
                Safety
              </a>
              <a href="" className="text-sm text-gray-600 hover:text-gray-900">
                Support
              </a>
            </nav>
          )}
        </header>
        <main className="flex-grow flex flex-col md:flex-row items-center justify-center w-full px-6 md:px-12 lg:px-24 py-12 space-y-12 md:space-y-0">
          <div className="md:w-1/2 mt-16 md:pr-6">
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-600 mb-4">
              WRONG TURN?
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              You look lost, stranger. You know what helps when you are lost? A
              piping hot bowl of noodles. Take a seat, we are frantically at
              work here cooking up something good. Oh, you need something to
              read? These might help you:
            </p>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-500 hover:underline">
                  Status Page
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-500 hover:underline">
                  @SyncRoom
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-500 hover:underline">
                  SyncRoom Support
                </a>
              </li>
            </ul>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <img
              src={PageNotFoundGif}
              alt="404 illustration"
              className="w-4/5 md:w-full max-w-md"
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default NotFoundPage;
