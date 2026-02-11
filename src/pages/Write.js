import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken, getId, getRefreshToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";

const customEditorStyle = EditorView.theme({
    ".cm-scroller": {
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
                <div className="flex flex-row justify-between">
                    <button className="text-white rounded-full hover:bg-gray-400 p-6" onClick={(e) => navigate(-1)}>
                        <ArrowLeftIcon className="size-6" />
                    </button>

                    <button type="submit" className="text-white rounded-full hover:bg-gray-400 p-6">
                        <CheckIcon className="size-6" />
                    </button>
                </div>

                <input type="hidden" name="idx" value={idx} />
                <input type="hidden" name="cate" value={cate} />
                <input type="hidden" name="table" value="MEMO_ARTICLE_tbl" />

                <div className="mb-4 mx-4">
                    <input
                        type="text"
                        className="block w-full rounded border border-gray-600 bg-black text-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-4 mx-4 pb-12 border">
                    <CodeMirror
                        value={memo}
                        basicSetup={{
                            lineNumbers: false,
                            foldGutter: false,
                            highlightActiveLine: false,
                            indentOnInput: false,
                            scrollPastEnd: false,
                            scrollbarStyle: null,
                            autocompletion: false,
                            searchKeymap: false,
                            search: false,
                        }}
                        theme="dark"
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
