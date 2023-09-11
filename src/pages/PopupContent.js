import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/common";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";

export default ({ detail, setDetail, setRefresh }) => {
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });

    const handleMenu = (e) => {
        e.preventDefault();
        var isShow = "none";
        if (contextMenu.isShow === "none") {
            isShow = "block";
        }

        setContextMenu({
            x: e.pageX - 0,
            y: e.pageY + 20,
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

    return (
        <>
            <div className="modal bg-dark bg-opacity-50" style={{ display: "block" }} id="backdrop" onClick={() => closeContextMenu()}>
                <div className="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header py-2">
                            <button className="btn btn-sm text-dark" type="button" onClick={(e) => handleMenu(e)}>
                                <i className="bi bi-three-dots-vertical"></i>
                            </button>

                            <button type="button" className="btn-close" onClick={() => setDetail(null)}></button>
                        </div>
                        <div className="modal-body p-0">
                            <div className="border bg-white">
                                <Editor
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
