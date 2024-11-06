import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  SET_MESSAGE,
} from "./types";

import Toast from "../utility/toast";

import AuthService from "../services/auth.service";

export const register = (username, email, password) => (dispatch) => {
  return AuthService.register(username, email, password).then(
    () => {
      dispatch({
        type: REGISTER_SUCCESS,
      });
      Toast.showSuccess(REGISTER_SUCCESS);
      dispatch({
        type: SET_MESSAGE,
        // payload: response.data.message,
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: REGISTER_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      Toast.showError(message);

      return Promise.reject();
    }
  );
};

export const login = (email, password) => (dispatch) => {
  return AuthService.login(email, password).then(
    (data) => {
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("socketcluster.authToken", data.data.accessToken);

      // Dispatch login success action
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: data },
      });
      Toast.showSuccess(LOGIN_SUCCESS);

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      // Dispatch login fail action
      dispatch({
        type: LOGIN_FAIL,
      });

      // Dispatch error message
      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      Toast.showError(message);

      return Promise.reject();
    }
  );
};

export const logout = () => (dispatch) => {
  AuthService.logout();

  dispatch({
    type: LOGOUT,
  });
};
