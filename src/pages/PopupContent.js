import { showAlert, showConfirm } from "../components/Alert";
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
    const [isCopied, setCopied] = useState(false);
    const backdropRef = useRef(null);
    const codeRef = useRef(null);
    const editorViewRef = useRef(null);
    const copyTimeoutRef = useRef(null);
    const [isMobile] = useState(() => window.matchMedia("(max-width: 1023px)").matches);

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
        if (await showConfirm("삭제하시겠습니까?")) {
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
                showAlert(data.msg);
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

    const copyTextToClipboard = (text) => {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand("copy") ? resolve() : reject();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textarea);
            }
        });
    };

    const handleCopyLine = () => {
        if (hoveredLine === null) return;
        const doc = editorViewRef.current?.state?.doc;
        const text = doc ? doc.line(hoveredLine).text : detail.memo.split("\n")[hoveredLine - 1] || "";
        copyTextToClipboard(text)
            .then(() => {
                setCopied(true);
                clearTimeout(copyTimeoutRef.current);
                copyTimeoutRef.current = setTimeout(() => {
                    setCopied(false);
                    setHoveredLine(null);
                }, 2000);
            })
            .catch((err) => {
                console.error(err);
                showAlert("복사 실패");
            });
    };

    const handleCursorUpdate = useCallback((update) => {
        if (!update.selectionSet) return;
        const pos = update.view.state.selection.main.head;
        const line = update.view.state.doc.lineAt(pos);
        setHoveredLine(line.number);
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
                <div className="w-full max-w-5xl p-4 max-lg:max-w-full max-lg:h-dvh max-lg:p-0 max-lg:m-0">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg flex flex-col w-full max-h-[90vh] overflow-hidden max-lg:h-full max-lg:max-h-full max-lg:rounded-none max-lg:border-0">
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

                            <div className="flex flex-1 justify-center">
                                {hoveredLine !== null && (
                                    <button
                                        className="flex flex-row bg-gray-700 hover:bg-gray-600 text-white rounded p-2 z-10 text-xs"
                                        onClick={handleCopyLine}
                                        title="복사"
                                    >
                                        {isCopied ? "복사됨" : `포커스된 ${hoveredLine}번째 라인 복사`}
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                className="ml-auto px-3 py-3 rounded-full hover:bg-gray-400"
                                onClick={() => setDetail(null)}
                            >
                                <XIcon className="size-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0 relative" ref={codeRef}>
                            <CodeMirror
                                value={detail.memo}
                                readOnly={isMobile}
                                editable={!isMobile}
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
                            to={`/Memo2?idx=${contextMenu.idx}&cate=${contextMenu.cate}&mode=edit`}
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
