import { notification } from "antd";
import axios, { AxiosRequestConfig } from "axios";
import { defaultTo, get } from "lodash";
import { ERROR_MESSAGE, URL } from "../constants";
import { store } from "../store";
import { actionLogout } from "../store/authSlice";

export const instanceAxios = axios.create({
  baseURL: `//localhost:5173/`
});

instanceAxios.defaults.headers.common["Content-Type"] = "application/json";

instanceAxios.interceptors.response.use(
  (response) => {
    if (response.data.code && +response.data.code !== 200) {
      const message = defaultTo(get(response, "data.message"), ERROR_MESSAGE);
      notification.error({ message });
      return Promise.reject(response);
    }
    return response;
  },
  (error) => {
    if (!axios.isCancel(error)) {
      const message = defaultTo(get(error, "message"), ERROR_MESSAGE);
      notification.error({ message });
    }

    const { url } = error.config;
    if (error.response.status === 401) {
      store.dispatch(actionLogout());
    }
    return Promise.reject(error);
  }
);

export default function request(options: AxiosRequestConfig) {
  return instanceAxios(options);
}
