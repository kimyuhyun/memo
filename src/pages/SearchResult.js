import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken, getId, getRefreshToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import PopupContent from "./PopupContent";
import { ArrowLeftIcon, LoaderIcon } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";

const cmSetup = {
    lineNumbers: false,
    foldGutter: false,
    highlightActiveLine: false,
    indentOnInput: false,
    scrollPastEnd: false,
    autocompletion: false,
};

const listEditorStyle = EditorView.theme({
    ".cm-scroller": { backgroundColor: "#000" },
    ".cm-content": { fontFamily: "monospace", fontSize: "12px" },
});

const jsxExt = javascript({ jsx: true });

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") ?? "";

    const [list, setList] = useState([]);
    const [cate, setCate] = useState("");
    const [detail, setDetail] = useState(null);
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(keyword);

        (async () => {
            if ((await isPossibleToken()) === -1) {
                navigate("/Memo2/login");
                return;
            }
        })();

        if (keyword !== "") {
            getSearchResult();
        }
    }, [keyword]);

    const getSearchResult = async () => {
        setLoading(true);
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/search?keyword=${keyword}`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setList(data);
        setLoading(false);
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
            getSearchResult();

            setContextMenu({ ...contextMenu, isShow: "none" });
        }
    };

    const handleMenu = (e, idx) => {
        e.preventDefault();
        var isShow = "none";
        if (contextMenu.isShow === "none") {
            isShow = "block";
        }

        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            idx,
            isShow,
        });
    };

    console.log(list);

    return (
        <div>
            <div className="flex flex-row justify-start items-center p-4">
                {/* <button className="text-white rounded-full hover:bg-gray-400 p-6" onClick={(e) => navigate(-1)}>
                    <ArrowLeftIcon className="size-6" />
                </button> */}

                <div className="text-2xl">{keyword}</div>
            </div>

            <div className="flex flex-wrap pr-1">
                {loading && (
                    <div className="w-full flex justify-center py-12">
                        <LoaderIcon className="size-6 animate-spin text-gray-400" />
                    </div>
                )}
                {!loading &&
                    list.map((row, i) => (
                        <div key={i} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/6 mt-1 pl-1 pr-0">
                            <div className="flex flex-col border">
                                <div className="flex flex-row border-b bg-gray-800" style={{ height: "50px" }}>
                                    <div className="flex flex-1 items-center ml-2 font-bold">
                                        {row.title} {row.exp}
                                    </div>

                                    <button
                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded cursor-pointer border border-transparent text-sm transition-colors text-gray-300"
                                        type="button"
                                        onClick={(e) => {
                                            handleMenu(e, row.idx);
                                            setCate(row.cate);
                                        }}
                                    >
                                        <i className="bi bi-three-dots-vertical"></i>
                                    </button>
                                </div>

                                <div
                                    className="overflow-hidden cursor-pointer"
                                    style={{ height: "120px" }}
                                    onClick={() => setDetail(row)}
                                >
                                    <CodeMirror
                                        value={row.memo}
                                        readOnly={true}
                                        editable={false}
                                        basicSetup={cmSetup}
                                        theme="dark"
                                        extensions={[listEditorStyle, jsxExt]}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                {!loading && list.length === 0 && (
                    <div className="w-full flex justify-center py-12">
                        <div className="text-gray-400">검색 결과가 없습니다.</div>
                    </div>
                )}
            </div>

            <div
                className="fixed bg-gray-800/50"
                style={{ width: "100vw", height: "100vh", left: 0, top: 0, display: contextMenu.isShow }}
                onClick={() => setContextMenu({ ...contextMenu, isShow: "none" })}
            ></div>

            <div className="absolute" style={{ left: contextMenu.x, top: contextMenu.y, display: contextMenu.isShow }}>
                <div className="border rounded bg-white shadow-lg">
                    <div className="border-b">
                        <Link
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded cursor-pointer border border-transparent text-sm transition-colors text-blue-500"
                            to={`/Memo2?idx=${contextMenu.idx}&cate=${cate}`}
                        >
                            <i className="bi bi-pencil-square"></i> 수정
                        </Link>
                    </div>
                    <div>
                        <button
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded cursor-pointer border border-transparent text-sm transition-colors text-red-500"
                            type="button"
                            onClick={() => handleDelete(contextMenu.idx)}
                        >
                            <i className="bi bi-trash"></i> 삭제
                        </button>
                    </div>
                </div>
            </div>

            {detail && <PopupContent detail={detail} setDetail={setDetail} setRefresh={getSearchResult} />}
        </div>
    );
};
