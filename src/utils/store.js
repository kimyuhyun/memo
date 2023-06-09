import axios from "axios";
import { getAccessToken, setAccessToken } from "./common";

export const isPossibleToken = async () => {
    const { data } = await axios({
        url: `${process.env.REACT_APP_HOST}/is_possible_token`,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${getAccessToken()}`,
        },
    });

    if (data.access_token) {
        setAccessToken(data.access_token);
    }

    return data.code;
};
