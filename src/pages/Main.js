import React from "react";
import axios from "axios";
import List from "./List";
import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import Write from "./Write";

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cateList, setCateList] = useState([]);
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

    return (
        <div className="pt-1">
            {cateList.length > 0 ? (
                <>
                    <ul className="nav nav-underline">
                        {cateList.map((row, i) => (
                            <li key={i} className="nav-item">
                                <Link
                                    className={`nav-link ${row.idx == cate ? "active" : ""} tabs`}
                                    onClick={(e) => {
                                        e.preventDefault();
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
                    </ul>
                    {idx !== "" ? <Write /> : <List />}
                </>
            ) : (
                <>
                    <h3>다시 로그인 해주세요.</h3>
                    <button className="btn btn-link" onClick={() => navigate("/Memo2/login")}>
                        Login
                    </button>
                </>
            )}
        </div>
    );
};
