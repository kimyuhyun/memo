import axios from "axios";
import { getAccessToken } from "./common";

export const isPossibleToken = async () => {
    const { data } = await axios({
        url: `${process.env.REACT_APP_HOST}/is_possible_token`,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${getAccessToken()}`,
        },
    });
    return data.code;
};
