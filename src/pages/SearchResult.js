import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken, getId, getRefreshToken } from "../utils/common";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import PopupContent from "./PopupContent";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";

const customEditorStyle = EditorView.theme({
    ".cm-scroller": {
        overflow: "hidden !important", // 스크롤 완전 제거
        backgroundColor: "#000000", // 원하는 배경색
    },
    ".cm-content": {
        height: "120px",
        fontFamily: "monospace",
        fontSize: "12px",
    },
});

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
            x: e.pageX,
            y: e.pageY,
            idx,
            isShow,
        });
    };

    console.log(list);

    return (
        <div className="container-fluid">
            <div className="d-flex flex-row mt-2 align-items-center">
                <button className="btn btn-lg" onClick={(e) => navigate(-1)}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <div>{keyword}</div>
            </div>

            <div className="row pe-1">
                {list.map((row, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-2 mt-1 ps-1 pe-0">
                        <div className="d-flex flex-column border">
                            <div className="d-flex flex-row border-bottom bg-dark" style={{ height: "50px" }}>
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
                                    searchKeymap: false, // 검색 단축키 비활성화
                                    search: false, // 검색 기능 비활성화
                                }}
                                extensions={[customEditorStyle, javascript({ jsx: true })]}
                                theme="dark" // 다크 테마 설정
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

            {detail && <PopupContent detail={detail} setDetail={setDetail} setRefresh={getSearchResult} />}
        </div>
    );
};
