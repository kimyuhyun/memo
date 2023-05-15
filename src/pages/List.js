import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/common";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [list, setList] = useState([]);

    const cate = searchParams.get("cate") ?? "";

    useEffect(() => {
        getList();
    }, [cate]);

    const getList = async () => {
        if ((await isPossibleToken()) === -1) {
            navigate("/login");
            return;
        }
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_list?cate=${cate}`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setList(data);
    };

    const handleDelete = async (idx) => {
        if (window.confirm("삭제하시겠습니까?")) {
            const { data } = await axios({
                url: `${process.env.REACT_APP_HOST}/del`,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${getAccessToken()}`,
                },
                data: {
                    idx: idx,
                    table: "MEMO_ARTICLE_tbl",
                },
            });
            if (data.code === 0) {
                alert(data.msg);
            }
            getList();
        }
    };

    console.log(list);

    return (
        <div>
            <div className="float-start">
                {list.map((row, i) => (
                    <div key={i} className="ms-2 mt-2 border shadow-sm float-start">
                        <div className="bg-light border-bottom d-flex flex-row">
                            <div className="d-flex flex-fill align-items-center ms-2">
                                {row.title} {row.exp}
                            </div>
                            <div>
                                <Link className="btn btn-link" to={`/write?idx=${row.idx}&cate=${cate}`}>
                                    <i className="bi bi-pencil-square"></i>
                                </Link>

                                <button className="btn btn-link text-danger" onClick={() => handleDelete(row.idx)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <Editor
                            onValueChange={(code) => {
                                const newList = [...list];
                                newList[i].memo = code;
                                setList(newList);
                            }}
                            value={row.memo}
                            tabSize={4}
                            highlight={(code) => highlight(code, languages.js)}
                            padding={10}
                            style={{
                                fontFamily: "monospace",
                                fontSize: 14,
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="float-start m-5"></div>
            

            <div
                className="position-fixed rounded-circle bg-dark rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "50px", height: "50px", right: "20px", bottom: "20px" }}
            >
                <Link className="btn btn-dark rounded-circle" to={`/write?cate=${cate}`}>
                    <i className="bi bi-pencil-square"></i>
                </Link>
            </div>
        </div>
    );
};
