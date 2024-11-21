import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken, getId, getRefreshToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";

const customEditorStyle = EditorView.theme({
    ".cm-scroller": {
        // overflow: "hidden !important", // 스크롤 완전 제거
        backgroundColor: "#000",
    },
    ".cm-content": {
        minHeight: "500px",
        fontFamily: "monospace",
        fontSize: "12px",
    },
});

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
        <div className="">
            <form id="frm1" onSubmit={handleSubmit}>
                <div className="d-flex flex-row align-items-center">
                    <button className="btn btn-lg me-auto m-3" type="button" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <button className="btn btn-primary btn-lg m-3" type="submit">
                        <i className="bi bi-check-lg"></i>
                    </button>
                </div>

                <input type="hidden" name="idx" value={idx} />
                <input type="hidden" name="cate" value={cate} />
                <input type="hidden" name="table" value="MEMO_ARTICLE_tbl" />

                <div className="mb-3 mx-3">
                    <input
                        type="text"
                        className="border form-control bg-black"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-3 mx-3 pb-5 border">
                    <CodeMirror
                        value={memo}
                        basicSetup={{
                            lineNumbers: false, // 줄 번호 표시 제거
                            foldGutter: false,
                            highlightActiveLine: false,
                            indentOnInput: false,
                            scrollPastEnd: false, // 문서 끝을 넘어서는 스크롤 방지
                            scrollbarStyle: null, // 스크롤바 완전 제거
                            autocompletion: false, // 자동완성 비활성화
                            searchKeymap: false, // 검색 단축키 비활성화
                            search: false, // 검색 기능 비활성화
                        }}
                        theme="dark" // 다크 테마 설정
                        extensions={[customEditorStyle, javascript({ jsx: true })]}
                        onChange={(code) => {
                            setMemo(code);
                        }}
                    />
                </div>
            </form>
        </div>
    );
};
