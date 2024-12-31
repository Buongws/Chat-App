import { Bars4Icon, XMarkIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import ImageBanner from "/src/assets/images/landingPage/LOGOX.png";
import ImageBannerBlack from "/src/assets/images/landingPage/LOGOBLACK.png";
import ImageHeroLeft from "/src/assets/images/landingPage/Frame-1.png";
import ImageHeroRight from "/src/assets/images/landingPage/Frame-2.png";
import ImageHeroMiddle from "/src/assets/images/landingPage/Frame.png";
import ImageHeroMobile from "/src/assets/images/landingPage/ArtMobile.webp";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const navigateLogin = () => {
    navigate("/login");
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-discord_blue flex items-center justify-between pb-4 px-6">
        <a href="/">
          <img
            src={ImageBanner}
            className="w-[9rem] h-30 object-contain"
            alt=""
          />
        </a>
        <div className="hidden lg:flex text-white space-x-6">
          <a className="link">Download</a>

          <a className="link">Nitro</a>
          <a className="link">Safety</a>
          <a className="link">Support</a>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={navigateLogin}
            className="bg-white p-2 rounded-full text-xs md:text-sm px-4 focus:outline-none hover:shadow-2xl hover:text-discord_blurple transition duration-200 ease-in-out whitespace-nowrap font-medium"
          >
            Login
          </button>
          <Bars4Icon
            className="h-9 text-white cursor-pointer lg:hidden"
            onClick={() => setSidebarOpen(true)}
          />
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed z-10 rounded top-0 right-0 w-64 bg-white h-full shadow-lg transition-transform transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } lg:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <img
            src={ImageBannerBlack}
            className="w-24 h-10 object-contain text-black"
            alt=""
          />
          <XMarkIcon
            className="h-8 w-8 text-gray-600 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
        <nav className="flex flex-col p-4 space-y-4 text-gray-900">
          <a className="link" href="#">
            Download
          </a>
          <a className="link" href="#">
            Nitro
          </a>
          <a className="link" href="#">
            Safety
          </a>
          <a className="link" href="#">
            Support
          </a>
        </nav>
      </div>

      {/* Main content */}
      <div
        className="bg-discord_blue md:pb-0 sm:pb-0"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div className="h-full md:flex relative">
          <div className="flex flex-col gap-7  justify-center py-4 px-6 w-full items-center text-center">
            <h1 className="lg:text-6xl text-white font-extrabold sm:text-3xl">
              IMAGINE A PLACE ...
            </h1>
            <h2 className="text-white text-lg font-light tracking-wide lg:max-w-3xl w-full">
              ...where you can belong to a school club, a gaming group, or a
              worldwide art community. Where just you and a handful of friends
              can spend time together. A place that makes it easy to talk every
              day and hang out more often.
            </h2>

            <div className="flex flex-col items-center sm:flex-row md:flex-col lg:flex-row sm:items-center gap-6">
              <button
                onClick={navigateLogin}
                className="bg-gray-900 text-white w-76 font-medium flex items-center justify-center rounded-full p-4 text-lg hover:shadow-2xl hover:bg-gray-800 focus:outline-none transition duration-200 ease-in-out"
              >
                Open SYNC ROOM in your browser
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 w-full">
            <img className="w-full" src={ImageHeroMiddle} alt="" />
          </div>

          <div className="absolute right-0 bottom-0 hidden md:block">
            <img
              className="md:h-[300px] lg:h-[400px]"
              src={ImageHeroLeft}
              alt=""
            />
          </div>
          <div className="absolute left-0 bottom-0 hidden md:block">
            <img
              className="md:h-[300px] lg:h-[400px]"
              src={ImageHeroRight}
              alt=""
            />
          </div>

          {/* ImageHeroMobile: Visible only on mobile */}
          <div className="absolute left-0 bottom-0 md:hidden flex justify-center w-full">
            <img className="h-[400px]" src={ImageHeroMobile} alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
