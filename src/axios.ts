import axios from "axios";
import config from "./config";

axios.defaults.baseURL = config.backEnd.server;

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    return Promise.reject(error);
});

export const ax=axios;
