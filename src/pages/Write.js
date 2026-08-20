import { showAlert } from "../components/Alert";
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
    "&": {
        height: "100%",
    },
    ".cm-scroller": {
        backgroundColor: "#000",
        overflow: "auto",
    },
    ".cm-content": {
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
            showAlert("카테고리를 선택해주세요.");
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
        navigate(`/Memo2?cate=${cate}`);
    };

    return (
        <div className="bg-black h-screen overflow-hidden">
            <form id="frm1" onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="flex flex-col">
                    <div className="flex flex-row justify-between">
                        <button
                            type="button"
                            className="text-white rounded-full hover:bg-gray-400 p-6"
                            onClick={(e) => navigate(-1)}
                        >
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
                            className="block w-full rounded border border-gray-600 bg-gray-900 text-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-4 mx-4 border flex-1 min-h-0">
                    <CodeMirror
                        value={memo}
                        height="100%"
                        className="h-full"
                        basicSetup={{
                            lineNumbers: false,
                            foldGutter: false,
                            highlightActiveLine: false,
                            indentOnInput: false,
                            scrollPastEnd: true,
                            scrollbarStyle: true,
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
