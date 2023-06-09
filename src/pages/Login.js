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
            <div className="login bg-light">
                <form id="frm1" className="form-signin text-center bg-white p-4 shadow" onSubmit={(e) => handleSubmit(e)}>
                    <h1 className="h3 mb-3 font-weight-normal">
                        <i className="bi bi-door-open"></i> Login
                    </h1>

                    <div className="input-group id">
                        <span className="input-group-text">
                            <i className="bi bi-envelope"></i>
                        </span>
                        <input className="form-control" ref={inputEmail} type="text" name="email" placeholder="이메일" required />
                    </div>

                    <div className="input-group pw">
                        <span className="input-group-text">
                            <i className="bi bi-key-fill"></i>
                        </span>
                        <input className="form-control" type="password" name="pass1" placeholder="패스워드" required />
                    </div>

                    <button className="btn btn-primary w-100 mt-3" type="submit">
                        로그인
                    </button>

                    <p className="mt-4 mb-3 text-muted">@2023~{year}</p>
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
                .form-signin .checkbox {
                    font-weight: 400;
                }
                .form-signin .form-control {
                    position: relative;
                    box-sizing: border-box;
                    height: auto;
                    padding: 10px;
                    font-size: 16px;
                }
                .form-signin .form-control:focus {
                    z-index: 2;
                }

                .form-signin .id .form-control {
                    margin-bottom: -1px;
                    border-bottom-right-radius: 0;
                }

                .form-signin .id .input-group-text {
                    margin-bottom: -1px;
                    border-bottom-left-radius: 0;
                }

                .form-signin .pw .form-control {
                    border-top-right-radius: 0;
                }

                .form-signin .pw .input-group-text {
                    border-top-left-radius: 0;
                }
            `}</style>
        </>
    );
};
