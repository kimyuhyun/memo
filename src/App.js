import "./css/bootstrap.icons.css";
import axios from "axios";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { getAccessToken, getRefreshToken, setAccessToken } from "./utils/common";
import { useEffect } from "react";

import Layout from "./pages/Layout";
import Main from "./pages/Main";
import Login from "./pages/Login";
import SearchResult from "./pages/SearchResult";
import Setting from "./pages/Setting";
import NotFound from "./pages/NotFound";
import FileRoom from "./pages/FileRoom";

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "production") {
    console.log = function no_console() {};
    console.warn = function no_console() {};
}

// 요청 인터셉터 추가하기
// axios.interceptors.request.use(
//     async (config) => {
//         // 요청을 보내기 전에 수행할 일

//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// 응답 인터셉터 추가
axios.interceptors.response.use(
    async (res) => {
        // console.log(res);
        if (res.data.code === -1) {
            // window.location.href = "/login";
        } else if (res.data.code === 100) {
            // setAccessToken(res.data.access_token);
        }
        return res;
    },
    async (error) => {
        // 오류 응답을 처리
        // ...
        return Promise.reject(error);
    },
);

export default () => {
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        console.log(getAccessToken());
        if (getAccessToken() === null || getAccessToken() === "undefined") {
            if (location.pathname === "/Memo2/login") {
            } else {
                navigate("/Memo2/login");
                return;
            }
        }
    }, []);

    return (
        <Routes>
            <Route path="/Memo2/login" element={<Login />} />
            <Route path="/Memo2" element={<Layout />}>
                <Route index element={<Main />} />
                <Route path="search" element={<SearchResult />} />
                <Route path="setting" element={<Setting />} />
                <Route path="file_room" element={<FileRoom />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
