import React from "react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAccessToken } from "../utils/common";
import { CopyIcon, Edit, MoreVerticalIcon, StarIcon, Trash2Icon, XIcon } from "lucide-react";
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

const jsxExt = javascript({ jsx: true });

var closeReadyMillSec = 0;

export default ({ detail, setDetail, setRefresh }) => {
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });
    const [isStar, setStar] = useState(false);
    const [hoveredLine, setHoveredLine] = useState(null);
    const [copyBtnPos, setCopyBtnPos] = useState({ x: 0, y: 0 });
    const backdropRef = useRef(null);
    const codeRef = useRef(null);
    const editorViewRef = useRef(null);

    useEffect(() => {
        if (detail.is_fav == 1) {
            setStar(true);
        } else {
            setStar(false);
        }
        backdropRef.current?.focus();
    }, []);

    const handleMenu = (e) => {
        e.preventDefault();
        var isShow = "none";
        if (contextMenu.isShow === "none") {
            isShow = "block";
        }

        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            idx: detail.idx,
            cate: detail.cate,
            isShow: isShow,
        });
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

            setRefresh();
            setContextMenu({ ...contextMenu, isShow: "none" });
            setDetail(null);
        }
    };
    const closeContextMenu = () => {
        if (contextMenu.isShow === "block") {
            setContextMenu({ ...contextMenu, isShow: "none" });
        }
    };

    const handleDoubleClick = (e) => {
        if (e.target.id === "backdrop") {
            setDetail(null);
        }
    };

    const handleCopyLine = () => {
        if (hoveredLine === null) return;
        const lines = detail.memo.split("\n");
        navigator.clipboard.writeText(lines[hoveredLine - 1] || "");
        setHoveredLine(null);
    };

    const handleCursorUpdate = useCallback((update) => {
        if (!update.selectionSet || !codeRef.current) return;
        const view = update.view;
        const pos = view.state.selection.main.head;
        const line = view.state.doc.lineAt(pos);
        if (line.from === line.to || pos < line.to) {
            setHoveredLine(null);
            return;
        }
        const endCoords = view.coordsAtPos(line.to);
        if (!endCoords) {
            setHoveredLine(null);
            return;
        }
        setHoveredLine(line.number);
        const containerRect = codeRef.current.getBoundingClientRect();
        setCopyBtnPos({
            x: endCoords.left - containerRect.left + codeRef.current.scrollLeft + 50,
            y: endCoords.top - containerRect.top + codeRef.current.scrollTop - 6,
        });
    }, []);

    const cursorExt = useMemo(() => EditorView.updateListener.of(handleCursorUpdate), [handleCursorUpdate]);

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

        if (data.is_fav == 1) {
            setStar(true);
        } else {
            setStar(false);
        }

        setRefresh();
    }

    return (
        <>
            <div
                ref={backdropRef}
                className="fixed inset-0 z-50 flex items-center justify-center bg-white/25"
                id="backdrop"
                tabIndex={-1}
                onClick={() => closeContextMenu()}
                onDoubleClick={(e) => handleDoubleClick(e)}
            >
                <div className="w-full max-w-5xl p-4 max-lg:max-w-full max-lg:min-h-screen max-lg:m-0">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg flex flex-col w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center border-b border-gray-700 p-0 bg-black">
                            <button
                                className="px-3 py-3 rounded-full hover:bg-gray-400"
                                type="button"
                                onClick={(e) => handleMenu(e)}
                            >
                                <MoreVerticalIcon className="size-5" />
                            </button>

                            <button
                                className="px-3 py-3 rounded-full hover:bg-gray-400"
                                onClick={() => setFav(detail.idx, detail.is_fav)}
                            >
                                {isStar ? (
                                    <StarIcon fill="currentColor" className="size-5 text-yellow-400" />
                                ) : (
                                    <StarIcon className="size-5" />
                                )}
                            </button>

                            <button
                                type="button"
                                className="ml-auto px-3 py-3 rounded-full hover:bg-gray-400"
                                onClick={() => setDetail(null)}
                            >
                                <XIcon className="size-5" />
                            </button>
                        </div>

                        <div
                            className="flex-1 overflow-y-auto p-0 relative"
                            ref={codeRef}
                        >
                            <CodeMirror
                                value={detail.memo}
                                readOnly={true}
                                editable={true}
                                basicSetup={{
                                    lineNumbers: false,
                                    foldGutter: false,
                                    highlightActiveLine: false,
                                    indentOnInput: false,
                                    scrollPastEnd: false,
                                    autocompletion: false,
                                }}
                                theme="dark"
                                extensions={[customEditorStyle, jsxExt, cursorExt]}
                                onCreateEditor={(view) => {
                                    editorViewRef.current = view;
                                }}
                            />
                            {hoveredLine !== null && (
                                <button
                                    className="absolute flex flex-row bg-gray-700 hover:bg-gray-600 text-white rounded p-1 z-10 text-xs"
                                    style={{ top: copyBtnPos.y, left: copyBtnPos.x }}
                                    onClick={handleCopyLine}
                                    title="복사"
                                >
                                    <CopyIcon className="size-3 mr-1" /> 복사
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="absolute"
                style={{ left: contextMenu.x, top: contextMenu.y, display: contextMenu.isShow, zIndex: 9999 }}
            >
                <div className="border rounded bg-black">
                    <div className="border-b">
                        <Link
                            className="flex items-center justify-center px-4 py-2 rounded cursor-pointer text-blue-500 hover:bg-gray-400"
                            to={`/Memo2?idx=${contextMenu.idx}&cate=${contextMenu.cate}`}
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
        </>
    );
};
