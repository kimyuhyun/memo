import React from "react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setId, getId, setAccessToken } from "../utils/common";
import { useNavigate } from "react-router-dom";

export default () => {
    const [year, setYear] = useState(0);
    const navigate = useNavigate();

    const inputEmail = useRef();

    useEffect(() => {
        const today = new Date();
        setYear(today.getFullYear());

        inputEmail.current.focus();
        if (getId() !== null && getId() !== "undefined") {
            inputEmail.current.value = getId();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        //유용한놈!
        const frm = Object.fromEntries(new FormData(e.target).entries());
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/login`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: frm,
        });
        console.log(data);
        if (data.code === 1) {
            setAccessToken(data.access_token);
            setId(frm.email);
            navigate("/Memo2");
        } else {
            alert(data.msg);
        }
    };

    return (
        <>
            <div className="login">
                <form id="frm1" className="form-signin text-center p-6 shadow" onSubmit={(e) => handleSubmit(e)}>
                    <h1 className="text-2xl font-bold mb-4">
                        <i className="bi bi-door-open"></i> Login
                    </h1>

                    <div className="flex id">
                        <span className="flex items-center px-3 bg-gray-700 text-gray-300 border border-gray-600 text-sm">
                            <i className="bi bi-envelope"></i>
                        </span>
                        <input className="block w-full rounded border border-gray-600 bg-gray-900 text-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" ref={inputEmail} type="text" name="email" placeholder="이메일" required />
                    </div>

                    <div className="flex pw">
                        <span className="flex items-center px-3 bg-gray-700 text-gray-300 border border-gray-600 text-sm">
                            <i className="bi bi-key-fill"></i>
                        </span>
                        <input className="block w-full rounded border border-gray-600 bg-gray-900 text-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" type="password" name="pass1" placeholder="패스워드" required />
                    </div>

                    <button className="inline-flex items-center justify-center px-3 py-1.5 rounded cursor-pointer text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700 w-full mt-4" type="submit">
                        로그인
                    </button>

                    <p className="mt-6 mb-4 text-gray-500">@2023~{year}</p>
                </form>
            </div>

            <style jsx="true">{`
                .login {
                    height: 100vh;
                    display: -ms-flexbox;
                    display: flex;
                    -ms-flex-align: center;
                    align-items: center;
                }
                .form-signin {
                    width: 100%;
                    max-width: 400px;
                    padding: 15px;
                    margin: auto;
                }
                .form-signin .id input {
                    position: relative;
                    box-sizing: border-box;
                    height: auto;
                    padding: 10px;
                    font-size: 16px;
                    margin-bottom: -1px;
                    border-bottom-right-radius: 0;
                }
                .form-signin .id input:focus {
                    z-index: 2;
                }
                .form-signin .id span {
                    margin-bottom: -1px;
                    border-bottom-left-radius: 0;
                }

                .form-signin .pw input {
                    position: relative;
                    box-sizing: border-box;
                    height: auto;
                    padding: 10px;
                    font-size: 16px;
                    border-top-right-radius: 0;
                }
                .form-signin .pw input:focus {
                    z-index: 2;
                }
                .form-signin .pw span {
                    border-top-left-radius: 0;
                }
            `}</style>
        </>
    );
};
