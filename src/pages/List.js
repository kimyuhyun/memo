import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/common";
// import Editor from "react-simple-code-editor";
// import { highlight, languages } from "prismjs/components/prism-core";
// import "prismjs/components/prism-clike";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";

import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import PopupContent from "./PopupContent";

const customEditorStyle = EditorView.theme({
    ".cm-scroller": {
        overflow: "hidden !important", // 스크롤 완전 제거
    },
    ".cm-content": {
        height: "120px",
        fontFamily: "monospace",
        fontSize: "12px",
        backgroundColor: "#000000", // 원하는 배경색
    },
});

export default () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [originList, setOriginList] = useState([]);
    const [list, setList] = useState([]);
    const [detail, setDetail] = useState(null);
    const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, idx: 0, isShow: "none" });
    const [filter, setFilter] = useState("");

    const cate = searchParams.get("cate") ?? "";

    // console.log(list);

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
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_list?cate=${cate}`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setList(data);
        setOriginList(data);
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
            <div className="row pt-3 pb-1">
                <div className="col-12 col-md-6 col-lg-6 col-xl-4 mt-1 ps-1 pe-1">
                    <div className="input-group flex-nowrap">
                        <input
                            type="text"
                            className="form-control form-control-sm border-end-0 bg-dark text-white"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <button
                            className="btn border border-start-0 bg-dark"
                            style={{ zIndex: "0" }}
                            type="button"
                            onClick={() => setFilter("")}
                        >
                            <i className="bi bi-x-lg text-white"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="row pe-1">
                {list.map((row, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-2 mt-1 ps-1 pe-0">
                        <div className="d-flex flex-column border">
                            <div className="d-flex flex-row border-bottom bg-dark" style={{ height: "50px" }}>
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

                                <button className="btn" type="button" onClick={(e) => handleMenu(e, row.idx)}>
                                    <i className="bi bi-three-dots-vertical"></i>
                                </button>
                            </div>

                            <CodeMirror
                                onClick={() => setDetail(row)}
                                value={row.memo}
                                basicSetup={{
                                    lineNumbers: false, // 줄 번호 표시 제거
                                    foldGutter: false,
                                    highlightActiveLine: false,
                                    indentOnInput: false,
                                    scrollPastEnd: false, // 문서 끝을 넘어서는 스크롤 방지
                                    scrollbarStyle: null, // 스크롤바 완전 제거
                                    autocompletion: false, // 자동완성 비활성화
                                }}
                                extensions={[customEditorStyle, javascript({ jsx: true })]}
                                theme="dark" // 다크 테마 설정
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
                <div className="border rounded bg-black shadow-lg">
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
