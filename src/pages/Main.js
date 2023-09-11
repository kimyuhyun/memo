import React from "react";
import axios from "axios";
import List from "./List";
import { useEffect, useState, useRef } from "react";
import { getAccessToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import Write from "./Write";

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cateList, setCateList] = useState([]);
    const [isSearchPopup, setIsSearchPopup] = useState(false);
    const inputSearchEl = useRef();
    const cate = searchParams.get("cate") ?? "";
    const idx = searchParams.get("idx") ?? "";

    useEffect(() => {
        getCate();
    }, []);

    const getCate = async () => {
        if ((await isPossibleToken()) === -1) {
            navigate("/Memo2/login");
            return;
        }

        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_cate`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setCateList(data);
    };

    const handleOnKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            navigate(`/Memo2/search?keyword=${inputSearchEl.current.value}`);
            setIsSearchPopup(false);
        }
    };

    return (
        <>
            {cateList.length > 0 ? (
                <>
                    <ul className="nav nav-underline nav-fill">
                        {cateList.map((row, i) => (
                            <li key={i} className="nav-item ms-2">
                                <Link
                                    className={`nav-link ${row.idx == cate ? "active" : ""} tabs`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsSearchPopup(false);
                                        navigate(`/Memo2?cate=${row.idx}`);
                                    }}
                                >
                                    {row.name1}
                                </Link>
                            </li>
                        ))}
                        <li className="nav-item">
                            <Link className="nav-link tabs" to="/Memo2/setting">
                                <i className="bi bi-gear"></i>
                            </Link>
                        </li>

                        <li className="nav-item">
                            <a
                                className="nav-link tabs"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsSearchPopup(!isSearchPopup);
                                    setTimeout(() => {
                                        inputSearchEl.current.value = "";
                                        inputSearchEl.current.focus();
                                    }, 100);
                                }}
                            >
                                <i className="bi bi-search"></i>
                            </a>
                        </li>
                    </ul>
                    {idx !== "" ? <Write /> : <List />}
                </>
            ) : (
                <div className="vh-100 d-flex align-items-center justify-content-center">
                    <div className="shadow-lg rounded p-5">
                        <h3 className="mt-4">토큰이 만료 되어 로그인이 필요합니다.</h3>
                        <button className="btn btn-primary w-100 mt-4" onClick={() => navigate("/Memo2/login")}>
                            Login
                        </button>
                    </div>
                </div>
            )}

            <div className={`${isSearchPopup ? "d-block" : "d-none"} position-fixed top-50 start-50 translate-middle w-75`} style={{ zIndex: "9999" }}>
                <input ref={inputSearchEl} onKeyPress={handleOnKeyPress} type="text" className="form-control form-control-lg shadow-lg" placeholder="검색어를 입력해주세요." />
            </div>
        </>
    );
};
