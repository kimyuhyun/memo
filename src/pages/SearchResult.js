import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken, getId, getRefreshToken } from "../utils/common";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import PopupContent from "./PopupContent";

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") ?? "";
    const [list, setList] = useState([]);
    const [cate, setCate] = useState("");
    const [detail, setDetail] = useState(null);
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });

    useEffect(() => {
        (async () => {
            if ((await isPossibleToken()) === -1) {
                navigate("/Memo2/login");
                return;
            }
        })();

        if (keyword !== "") {
            getSearchResult();
        }
    }, []);

    const getSearchResult = async () => {
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/search?keyword=${keyword}`,
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
            x: e.pageX - 60,
            y: e.pageY + 20,
            idx,
            isShow,
        });
    };

    console.log(list);

    return (
        <div className="container-fluid">
            <button className="btn btn-light btn-lg me-auto mt-2" onClick={(e) => navigate(-1)}>
                <i className="bi bi-arrow-left"></i>
            </button>

            <div className="row">
                {list.map((row, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-3 mt-3">
                        <div className="d-flex flex-column border shadow-sm bg-white" style={{ height: "200px" }}>
                            <div className="d-flex flex-row border-bottom bg-light">
                                <div className="d-flex flex-fill align-items-center ms-2 fw-bold">
                                    {row.title} {row.exp}
                                </div>

                                <button
                                    className="btn text-dark"
                                    type="button"
                                    onClick={(e) => {
                                        handleMenu(e, row.idx);
                                        setCate(row.cate);
                                    }}
                                >
                                    <i className="bi bi-three-dots-vertical"></i>
                                </button>
                            </div>
                            <Editor
                                onClick={() => setDetail(row)}
                                readOnly={true}
                                value={row.memo}
                                tabSize={4}
                                highlight={(code) => highlight(code, languages.js)}
                                padding={10}
                                style={{
                                    height: "100%",
                                    fontFamily: "monospace",
                                    fontSize: "12px",
                                }}
                            />
                        </div>
                    </div>
                ))}
                <div className="m-5"></div>
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

            {detail && <PopupContent detail={detail} setDetail={setDetail} setRefresh={getSearchResult} />}
        </div>
    );
};
