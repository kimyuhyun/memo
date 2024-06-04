import React from "react";
import axios from "axios";
import List from "./List";
import { useEffect, useState, useRef } from "react";
import { getAccessToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import Write from "./Write";
import SearchPopup from "./SearchPopup";


export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cateList, setCateList] = useState([]);
    const [isSearchPopup, setIsSearchPopup] = useState(false);
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
            navigate(`/Memo2/search?keyword=${e.target.value}`);
            setIsSearchPopup(false);
        }
    };

    return (
        <>
            {cateList.length > 0 ? (
                <>
                    <ul className="nav nav-pills mt-1 ms-1">
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsSearchPopup(!isSearchPopup);
                                }}
                            >
                                <i className="bi bi-search"></i>
                            </a>
                        </li>

                        {cateList.map((row, i) => (
                            <li key={i} className="nav-item">
                                <Link
                                    className={`nav-link ${row.idx == cate ? "active" : ""}`}
                                    style={{ fontSize: "14px" }}
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
                            <Link className="nav-link tabs" to="/Memo2/file_room">
                                <i className="bi bi-hdd"></i>
                            </Link>
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

            {isSearchPopup && <SearchPopup setIsSearchPopup={setIsSearchPopup} handleOnKeyPress={handleOnKeyPress} />}
            
        </>
    );
};
