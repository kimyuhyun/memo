import React, { useRef } from "react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { getAccessToken } from "../utils/common";

import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import PopupContent from "./PopupContent";
import { Edit, EditIcon, LoaderIcon, MoreVerticalIcon, StarIcon, Trash2Icon, XIcon } from "lucide-react";
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
    ".cm-scroller": { backgroundColor: "#000", overflow: "hidden" },
    ".cm-content": { fontFamily: "monospace", fontSize: "12px", height: "120px", overflow: "hidden" },
});

const jsxExt = javascript({ jsx: true });

const LazyCodeMirror = ({ value, onClick }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { rootMargin: "200px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="overflow-hidden cursor-pointer h-[120px]" onClick={onClick}>
            {visible ? (
                <CodeMirror
                    value={value}
                    readOnly={true}
                    editable={false}
                    basicSetup={cmSetup}
                    theme="dark"
                    extensions={[listEditorStyle, jsxExt]}
                />
            ) : (
                <pre className="bg-black text-white text-xs font-mono p-2 m-0 h-full">{value}</pre>
            )}
        </div>
    );
};
const listCache = new Map();

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [originList, setOriginList] = useState([]);
    const [list, setList] = useState([]);
    const [detail, setDetail] = useState(null);
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);

    const cate = searchParams.get("cate") ?? "";

    useEffect(() => {
        setFilter("");
        getList();
    }, [cate]);

    useEffect(() => {
        const filteredList = originList.filter((row) => {
            return (
                row.title.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                row.memo.toLowerCase().indexOf(filter.toLowerCase()) > -1
            );
        });
        setList(filteredList);
    }, [filter]);

    const getList = async () => {
        if ((await isPossibleToken()) === -1) {
            navigate("/Memo2/login");
            return;
        }

        const cached = listCache.get(cate);
        if (cached) {
            setList(cached);
            setOriginList(cached);
        } else {
            setLoading(true);
        }

        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_list?cate=${cate}`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        listCache.set(cate, data);
        setList(data);
        setOriginList(data);
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
            getList();

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

    async function setFav(idx) {
        const frm = {};
        frm.idx = idx;
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/set_fav`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
            data: frm,
        });

        getList();
    }

    const memoizedList = useMemo(
        () =>
            list.map((row) => (
                <div key={row.idx} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/6 mt-1 pl-1 pr-0">
                    <div className="flex flex-col border">
                        <div className="flex flex-row  items-center border-b bg-gray-800" style={{ height: "50px" }}>
                            <div
                                className="h-[32px] px-1 flex items-center cursor-pointer rounded-full hover:bg-gray-400"
                                onClick={() => setFav(row.idx)}
                            >
                                {row.is_fav == 0 ? (
                                    <StarIcon className="size-5" />
                                ) : (
                                    <StarIcon fill="currentColor" className="size-5 text-yellow-400" />
                                )}
                            </div>
                            <div className="flex flex-1 items-center ml-1 font-bold text-sm">
                                {row.title} {row.exp}
                            </div>
                            <button
                                className="flex items-center h-[32px] px-2 rounded-full hover:bg-gray-400"
                                type="button"
                                onClick={(e) => handleMenu(e, row.idx)}
                            >
                                <MoreVerticalIcon className="size-4" />
                            </button>
                        </div>
                        <LazyCodeMirror value={row.memo} onClick={() => setDetail(row)} />
                    </div>
                </div>
            )),
        [list],
    );

    return (
        <div className="w-full">
            <div className="flex flex-wrap my-2">
                <div className="w-full md:w-1/2 lg:w-1/2 xl:w-1/3 mt-1 pl-1 pr-1">
                    <div className="flex flex-row">
                        <input
                            type="text"
                            className="w-full rounded rounded-r-none border border-gray-600 bg-gray-800 text-white px-2 py-1 text-xs focus:outline-none border-r-0"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <button
                            className="px-2 py-2 rounded rounded-l-none cursor-pointer text-sm border border-l-0 bg-gray-800 hover:bg-gray-400"
                            type="button"
                            onClick={() => setFilter("")}
                        >
                            <XIcon className="size-6" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap pr-1">
                {loading && (
                    <div className="w-full flex justify-center py-12">
                        <LoaderIcon className="size-6 animate-spin text-gray-400" />
                    </div>
                )}
                {!loading && memoizedList}
                <div className="m-12"></div>

                <Link
                    className={`
                            p-5 rounded-full text-sm bg-gray-800 text-white hover:bg-gray-700
                            fixed bottom-0 right-0 mr-4 mb-4
                        `}
                    to={`/Memo2?cate=${cate}&mode=write`}
                >
                    <EditIcon className="size-4" />
                </Link>
            </div>

            <div
                className="fixed bg-white/25"
                style={{ width: "100vw", height: "100vh", left: 0, top: 0, display: contextMenu.isShow }}
                onClick={() => setContextMenu({ ...contextMenu, isShow: "none" })}
            ></div>

            <div className="absolute" style={{ left: contextMenu.x, top: contextMenu.y, display: contextMenu.isShow }}>
                <div className="border rounded bg-black">
                    <div className="border-b">
                        <Link
                            className="flex items-center justify-center px-4 py-2 rounded cursor-pointer text-blue-500 hover:bg-gray-400"
                            to={`/Memo2?idx=${contextMenu.idx}&cate=${cate}&mode=write`}
                        >
                            <Edit className="size-4 mr-2" /> 수정
                        </Link>
                    </div>
                    <div>
                        <button
                            className="flex items-center justify-center px-4 py-2 rounded cursor-pointer text-red-500 hover:bg-gray-400"
                            type="button"
                            onClick={() => handleDelete(contextMenu.idx)}
                        >
                            <Trash2Icon className="size-4 mr-2" /> 삭제
                        </button>
                    </div>
                </div>
            </div>

            {detail && <PopupContent detail={detail} setDetail={setDetail} setRefresh={getList} />}
        </div>
    );
};
