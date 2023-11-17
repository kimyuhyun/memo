import React from "react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { getAccessToken } from "../utils/common";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { Link } from "react-router-dom";

var closeReadyMillSec = 0;

export default ({ detail, setDetail, setRefresh }) => {
    const editorRef = useRef(null);
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });

    useEffect(() => {
        editorRef.current._input.focus();
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

    return (
        <>
            <div
                className="modal bg-dark bg-opacity-50"
                style={{ display: "block" }}
                id="backdrop"
                onClick={() => closeContextMenu()}
                onDoubleClick={(e) => handleDoubleClick(e)}
                onKeyDown={(e) => handleKeyDown(e)}
            >
                <div className="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header py-2">
                            <button className="btn btn-sm text-dark" type="button" onClick={(e) => handleMenu(e)}>
                                <i className="bi bi-three-dots-vertical"></i>
                            </button>

                            <button type="button" className="btn-close" onClick={() => setDetail(null)}></button>
                        </div>

                        <div className="modal-body p-0">
                            <div className="border bg-white border-top-0">
                                <Editor
                                    ref={editorRef}
                                    onValueChange={(code) => {
                                        setDetail({
                                            ...detail,
                                            memo: code,
                                        });
                                    }}
                                    value={detail.memo}
                                    tabSize={4}
                                    highlight={(code) => highlight(code, languages.js)}
                                    padding={10}
                                    style={{
                                        minHeight: "500px",
                                        fontFamily: "monospace",
                                        fontSize: "12px",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="position-absolute" style={{ left: contextMenu.x, top: contextMenu.y, display: contextMenu.isShow, zIndex: 9999 }}>
                <div className="border rounded bg-white shadow-lg">
                    <div className="border-bottom">
                        <Link className="btn text-primary" to={`/Memo2?idx=${contextMenu.idx}&cate=${contextMenu.cate}`}>
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
