import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getAccessToken } from "../utils/common";
import { useNavigate, Link, useSearchParams, Outlet, useLocation } from "react-router-dom";
import { isPossibleToken } from "../utils/store";
import SearchPopup from "./SearchPopup";
import { HardDriveIcon, SearchIcon, SettingsIcon } from "lucide-react";

export default () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [cateList, setCateList] = useState([]);
    const [isSearchPopup, setIsSearchPopup] = useState(false);
    const cate = searchParams.get("cate") ?? "";

    const location = useLocation();
    const [lastSegment, setLastSegment] = useState("");

    useEffect(() => {
        getCate();
    }, []);

    useEffect(() => {
        setLastSegment(location.pathname.replace(/\/$/, "").split("/").pop());
    }, [location.pathname]);

    const getCate = async () => {
        if ((await isPossibleToken()) === -1) {
            navigate("/Memo2/login");
            return;
        }

        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_cate`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        setCateList(data);
    };

    const handleOnKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            navigate(`/Memo2/search?keyword=${e.target.value}`);
            setIsSearchPopup(false);
        }
    };

    if (cateList.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="shadow-lg rounded p-12">
                    <h3 className="mt-6">토큰이 만료 되어 로그인이 필요합니다.</h3>
                    <button
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded cursor-pointer text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700 w-full mt-6"
                        onClick={() => navigate("/Memo2/login")}
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-screen">
                {/* 상단 탭 메뉴 */}
                <div className="flex flex-wrap bg-black">
                    <button
                        className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer whitespace-nowrap"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsSearchPopup(!isSearchPopup);
                        }}
                    >
                        <SearchIcon className="size-4" />
                    </button>

                    {cateList.map((row, i) => (
                        <button
                            key={i}
                            className={`
                                rounded
                                px-3 py-2 text-sm whitespace-nowrap
                                hover:text-white hover:bg-blue-500
                                ${row.idx == cate ? "text-white bg-blue-500" : "text-gray-400"}
                            `}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsSearchPopup(false);
                                navigate(`/Memo2?cate=${row.idx}`);
                            }}
                        >
                            {row.name1}
                        </button>
                    ))}

                    <Link
                        className={`
                            rounded  
                            px-3 py-2 text-sm 
                            hover:text-white hover:bg-blue-500
                            ${lastSegment == `setting` ? `text-white bg-blue-500` : `text-gray-400`}
                        `}
                        to="/Memo2/setting"
                    >
                        <SettingsIcon className="size-4" />
                    </Link>
                    <Link
                        className={`
                            rounded  
                            px-3 py-2 text-sm 
                            hover:text-white hover:bg-blue-500
                            ${lastSegment == `file_room` ? `text-white bg-blue-500` : `text-gray-400`}
                        `}
                        to="/Memo2/file_room"
                    >
                        <HardDriveIcon className="size-4" />
                    </Link>
                </div>

                {/* 메인 콘텐츠 */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet context={{ getCate }} />
                </main>
            </div>

            {isSearchPopup && <SearchPopup setIsSearchPopup={setIsSearchPopup} handleOnKeyPress={handleOnKeyPress} />}
        </>
    );
};
