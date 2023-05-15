import React from "react";
import axios from "axios";
import List from "./List";
import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cateList, setCateList] = useState([]);
    const cate = searchParams.get("cate") ?? "";

    useEffect(() => {
        getCate();
    }, []);

    const getCate = async () => {
        if ((await isPossibleToken()) === -1) {
            navigate("/login");
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
        <div>
            <ul className="nav nav-tabs">
                {cateList.map((row, i) => (
                    <li key={i} className="nav-item">
                        <Link
                            className={`nav-link ${row.idx == cate ? "active" : ""} tabs`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`?cate=${row.idx}`);
                            }}
                        >
                            {row.name1}
                        </Link>
                    </li>
                ))}
                <li className="nav-item">
                    <Link className="nav-link tabs" to="/setting">
                        <i class="bi bi-gear"></i>
                    </Link>
                </li>
            </ul>
            <List />
        </div>
    );
};
