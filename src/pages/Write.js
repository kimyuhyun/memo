import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken, getId, getRefreshToken } from "../utils/common";
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
    const [title, setTitle] = useState("");
    const [memo, setMemo] = useState("");

    const idx = searchParams.get("idx") ?? "";
    const cate = searchParams.get("cate") ?? "";

    useEffect(() => {
        (async () => {
            if ((await isPossibleToken()) === -1) {
                navigate("/Memo2/login");
                return;
            }
        })();

        if (cate === "") {
            alert("카테고리를 선택해주세요.");
            navigate("/Memo2");
        }

        if (idx !== "") {
            getData();
        }
    }, [idx]);

    const getData = async () => {
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_detail?idx=${idx}`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        console.log(data);
        setTitle(data.title);
        setMemo(data.memo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        //유용한놈!
        const frm = Object.fromEntries(new FormData(e.target).entries());
        frm.memo = memo;
        frm.title = title;

        console.log(frm);

        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/write`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
            data: frm,
        });
        console.log(data);
        navigate(-1);
    };

    return (
        <div className="bg-white">
            <form id="frm1" onSubmit={handleSubmit}>
                <div className="d-flex flex-row align-items-center">
                    <button
                        className="btn btn-light btn-lg me-auto m-3"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(-1);
                        }}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <button className="btn btn-primary btn-lg m-3">
                        <i className="bi bi-check-lg"></i>
                    </button>
                </div>

                <input type="hidden" name="idx" value={idx} />
                <input type="hidden" name="cate" value={cate} />
                <input type="hidden" name="table" value="MEMO_ARTICLE_tbl" />

                <div className="mb-3 mx-3">
                    <input type="text" className="border form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="mb-3 mx-3 pb-5">
                    <Editor
                        className="form-control flex-fill"
                        onValueChange={(code) => {
                            setMemo(code);
                        }}
                        value={memo}
                        tabSize={4}
                        highlight={(code) => highlight(code, languages.js)}
                        padding={10}
                        style={{
                            fontFamily: "monospace",
                            fontSize: 14,
                            minHeight: "700px",
                        }}
                    />
                </div>
            </form>
        </div>
    );
};
