import React from "react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAccessToken } from "../utils/common";

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

var closeReadyMillSec = 0;

export default ({ detail, setDetail, setRefresh }) => {
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });
    const [isStar, setStar] = useState(false);

    useEffect(() => {
        // editorRef.current._input.focus();
        if (detail.is_fav == 1) {
            setStar(true);
        } else {
            setStar(false);
        }
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

    const handleKeyDown = (e) => {
        console.log(e.key);

        if (e.key === "q" || e.key === "ㅂ") {
            const nowMillSec = new Date().getTime();
            if (nowMillSec > closeReadyMillSec + 1000) {
                closeReadyMillSec = nowMillSec;
                return;
            }

            if (nowMillSec <= closeReadyMillSec + 1000) {
                setDetail(null);
                closeReadyMillSec = 0;
            }
        }
    };

    async function setFav(idx) {
        console.log("setFav", idx);

        //유용한놈!
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
                className="modal bg-white bg-opacity-25"
                style={{ display: "block" }}
                id="backdrop"
                onClick={() => closeContextMenu()}
                onDoubleClick={(e) => handleDoubleClick(e)}
                onKeyDown={(e) => handleKeyDown(e)}
            >
                <div className="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header p-0 bg-black" style={{ height: "50px" }}>
                            <button className="btn" type="button" onClick={(e) => handleMenu(e)}>
                                <i className="bi bi-three-dots-vertical"></i>
                            </button>

                            <div
                                className="ms-3 d-flex align-items-center"
                                style={{ cursor: "pointer" }}
                                onClick={() => setFav(detail.idx, detail.is_fav)}
                            >
                                <i className={`bi bi-star${isStar ? "-fill text-warning" : ""}`}></i>
                            </div>

                            <button type="button" className="btn-close me-2" onClick={() => setDetail(null)}></button>
                        </div>

                        <div className="modal-body p-0">
                            <div className="border border-top-0">
                                <CodeMirror
                                    value={detail.memo}
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
                                        setDetail({
                                            ...detail,
                                            memo: code,
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="position-absolute"
                style={{ left: contextMenu.x, top: contextMenu.y, display: contextMenu.isShow, zIndex: 9999 }}
            >
                <div className="border rounded bg-black shadow-lg">
                    <div className="border-bottom">
                        <Link
                            className="btn text-primary"
                            to={`/Memo2?idx=${contextMenu.idx}&cate=${contextMenu.cate}`}
                        >
                            <i className="bi bi-pencil-square"></i> 수정
                        </Link>
                    </div>
                    <div>
                        <button className="btn text-danger" type="button" onClick={() => handleDelete(contextMenu.idx)}>
                            <i className="bi bi-trash"></i> 삭제
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
