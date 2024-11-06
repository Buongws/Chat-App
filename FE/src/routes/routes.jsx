import { lazy } from "react";
import NotFoundPage from "../pages/NotFoundPage";
import ResetPassword from "../pages/ResetPassword";

const Home = lazy(() => import("@pages/Home"));
const Login = lazy(() => import("@pages/Login"));
const Channels = lazy(() => import("@pages/channels/Channels"));
const Register = lazy(() => import("@pages/Register"));
const Invite = lazy(() => import("@pages/Invite"));

export const routes_here = [
  {
    path: "/",
    element: <Home />,
    isPrivate: false,
  },
  {
    path: "/login",
    element: <Login />,
    isPrivate: false,
  },
  {
    path: "/register",
    element: <Register />,
    isPrivate: false,
  },
  {
    path: "/channels/:serverId",
    element: <Channels />,
    isPrivate: false,
  },
  {
    path: "/channels/:serverId/:channelId",
    element: <Channels />,
    isPrivate: false,
  },
  {
    path: "/join/:serverId/:code",
    element: <Invite />,
    isPrivate: false,
  },
  {
    path: "/user/reset-password/:token",
    element: <ResetPassword />,
    isPrivate: false,
  },
  {
    path: "*",
    element: <NotFoundPage />,
    isPrivate: false,
  },
];
