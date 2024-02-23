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
import PopupContent from "./PopupContent";

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [list, setList] = useState([]);
    const [detail, setDetail] = useState(null);
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });

    const cate = searchParams.get("cate") ?? "";

    console.log(list);

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
        console.log("handleMenu", e);
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
        console.log(data);

        getList();
    }

    return (
        <div className="container-fluid">
            <div className="row pe-1">
                {list.map((row, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-2 mt-1 ps-1 pe-0">
                        <div className="d-flex flex-column border bg-white" style={{ height: "140px" }}>
                            <div className="d-flex flex-row border-bottom bg-light">
                                <div
                                    className="ms-1 d-flex align-items-center"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setFav(row.idx, row.is_fav)}
                                >
                                    <i className={`bi bi-star${row.is_fav == 0 ? "" : "-fill text-warning"}`}></i>
                                </div>
                                <div
                                    className="d-flex flex-fill align-items-center ms-1 fw-bold"
                                    style={{ fontSize: "14px" }}
                                >
                                    {row.title} {row.exp}
                                </div>

                                <button className="btn text-dark" type="button" onClick={(e) => handleMenu(e, row.idx)}>
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

            <div
                className="position-absolute"
                style={{ left: contextMenu.x, top: contextMenu.y, display: contextMenu.isShow }}
            >
                <div className="border rounded bg-white shadow-lg">
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

            {detail && <PopupContent detail={detail} setDetail={setDetail} setRefresh={getList} />}
        </div>
    );
};
