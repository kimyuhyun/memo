export const getAccessToken = () => {
    const accessToken = localStorage.getItem("access_token");
    return accessToken;
};


export const setAccessToken = (accessToken) => {
    localStorage.setItem("access_token", accessToken);
};

export const setId = (id) => {
    localStorage.setItem("id", id);
};

export const getId = () => {
    return localStorage.getItem("id");
};

export const utilConvertToMillis = (strTime) => {
    const time = new Date(strTime).getTime() / 1000;
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const inputTime = time;
    const diffTime = currentTime - inputTime;
    var postTime;
    switch (true) {
        case diffTime < 60:
            postTime = "방금";
            break;
        case diffTime < 3600:
            postTime = parseInt(diffTime / 60) + "분 전";
            break;
        case diffTime < 86400:
            postTime = parseInt(diffTime / 3600) + "시간 전";
            break;
        case diffTime < 604800:
            postTime = parseInt(diffTime / 86400) + "일 전";
            break;
        case diffTime > 604800:
            var date = new Date(time * 1000);
            var month = date.getMonth() + 1;
            var day = date.getDate();
            if (date.getMonth() + 1 < 10) {
                month = "0" + date.getMonth() + 1;
            }
            if (date.getDate() < 10) {
                day = "0" + date.getDate();
            }
            postTime = date.getFullYear() + "-" + month + "-" + day;
            break;
        default:
            postTime = time;
    }
    return postTime;
};

export const replaceAll = (str, searchStr, replaceStr) => {
    if (str === "") {
        return str;
    }
    return str.split(searchStr).join(replaceStr);
};
