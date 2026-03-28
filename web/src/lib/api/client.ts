import axios from "axios";

export const apiClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

export const mlClient = axios.create({
    baseURL: "http://127.0.0.1:5000",
    withCredentials: true,
});
