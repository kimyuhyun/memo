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

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [list, setList] = useState([]);
    const [popupContent, setPopupContent] = useState("");
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });

    const cate = searchParams.get("cate") ?? "";

    useEffect(() => {
        getList();
    }, [cate]);

    const getList = async () => {
        if ((await isPossibleToken()) === -1) {
            navigate("/Memo2/login");
            return;
        }
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_list?cate=${cate}`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setList(data);
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
            x: e.pageX - 60,
            y: e.pageY + 20,
            idx,
            isShow,
        });
    };

    const handlePopup = (e) => {
        if (typeof e === "object") {
            if (e.target.id === "backdrop") {
                setPopupContent("");
            }
        } else {
            setPopupContent(e);
        }
    };

    console.log(list);

    return (
        <div className="container-fluid bg-white">
            <div className="row">
                {list.map((row, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-4 mt-3">
                        <div className="border shadow">
                            <div className="bg-light border-bottom d-flex flex-row">
                                <div className="d-flex flex-fill align-items-center ms-2">
                                    {row.title} {row.exp}
                                </div>
                                <div>
                                    <button className="btn btn-link" type="button" onClick={() => handlePopup(row.memo)}>
                                        <i className="bi bi-arrows-fullscreen"></i>
                                    </button>

                                    <button className="btn text-dark" type="button" onClick={(e) => handleMenu(e, row.idx)}>
                                        <i className="bi bi-three-dots-vertical"></i>
                                    </button>
                                </div>
                            </div>
                            <Editor
                                onClick={() => handlePopup(row.memo)}
                                readOnly={true}
                                value={row.memo}
                                tabSize={4}
                                highlight={(code) => highlight(code, languages.js)}
                                padding={10}
                                style={{
                                    maxHeight: "300px",
                                    fontFamily: "monospace",
                                    fontSize: "12px",
                                }}
                            />
                        </div>
                    </div>
                ))}
                <div className="m-5"></div>

                <div
                    className="position-fixed rounded-circle bg-dark rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px", right: "20px", bottom: "20px" }}
                >
                    <Link className="btn btn-dark rounded-circle" to={`/Memo2/write?cate=${cate}`}>
                        <i className="bi bi-pencil-square"></i>
                    </Link>
                </div>
            </div>

            <div
                className="position-fixed bg-dark bg-opacity-50"
                style={{ width: "100vw", height: "100vh", left: 0, top: 0, display: contextMenu.isShow }}
                onClick={() => setContextMenu({ ...contextMenu, isShow: "none" })}
            ></div>

            <div className="position-absolute bg-white shadow-lg" style={{ left: contextMenu.x, top: contextMenu.y, display: contextMenu.isShow }}>
                <div className="border">
                    <div className="border-bottom">
                        <Link className="btn text-primary" to={`/Memo2?idx=${contextMenu.idx}&cate=${cate}`}>
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

            {popupContent && (
                <div className="modal bg-dark bg-opacity-50" style={{ display: "block" }} id="backdrop">
                    <div className="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="btn-close" onClick={() => handlePopup("")}></button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="border bg-white">
                                    <Editor
                                        onValueChange={(code) => {
                                            setPopupContent(code);
                                        }}
                                        value={popupContent}
                                        tabSize={4}
                                        highlight={(code) => highlight(code, languages.js)}
                                        padding={15}
                                        style={{
                                            fontFamily: "monospace",
                                            fontSize: "14px",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
