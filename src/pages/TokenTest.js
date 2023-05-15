import React from "react";
import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "../utils/common";


export default () => {

    const login = async () => {
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/login`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: {
                email: "escnet@naver.com",
                pass1: "1",
            }
        });
        console.log(data);

        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
    }
    
    return (
        <div>
            <button onClick={login}>토큰 발급</button>
        </div>
    );

};