import "./css/bootstrap.icons.css";
import "./css/bootstrap5.3.0.css";
import axios from "axios";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/Login";
import Write from "./pages/Write";
import Setting from "./pages/Setting";
import NotFound from "./pages/NotFound";
import { getAccessToken, getRefreshToken, setAccessToken } from "./utils/common";
import { useEffect } from "react";

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
        console.log("QWEQWE", res);
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
    }
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
            <Route path="/Memo2" element={<Main />}></Route>
            <Route path="/Memo2/login" element={<Login />}></Route>
            <Route path="/Memo2/write" element={<Write />}></Route>
            <Route path="/Memo2/setting" element={<Setting />}></Route>
            <Route path="*" element={<NotFound />}></Route>
        </Routes>
    );
};
