import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../utils/common";
import { ArrowLeftIcon, FileIcon, UploadCloudIcon, XIcon } from "lucide-react";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
const isImage = (name) => {
    const ext = (name || "").split(".").pop().toLowerCase();
    return IMAGE_EXTS.includes(ext);
};

function FileRoom() {
    const navigate = useNavigate();
    const [isDragEnter, setDragEnter] = useState(false);
    const [isUploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);
    const [systemInfo, setSystemInfo] = useState(null);

    const fetchFiles = async () => {
        try {
            const { data } = await axios({
                url: `${process.env.REACT_APP_HOST}/get_files`,
                method: "GET",
                headers: { Authorization: `Bearer ${getAccessToken()}` },
            });
            setFiles(data.list || []);
        } catch (err) {
            console.error(err);
        } finally {
            getSystemInfo();
        }
    };

    useEffect(() => {
        fetchFiles();
        getSystemInfo();
    }, []);

    const dragEnter = (e) => {
        e.preventDefault();
        setDragEnter(true);
    };

    const dragLeave = (e) => {
        e.preventDefault();
        setDragEnter(false);
    };
    const dragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const drop = async (e) => {
        e.preventDefault();
        setDragEnter(false);
        setUploading(true);

        var urlLink = "";
        var file = null;
        try {
            const imageUrl = e.dataTransfer.getData("text/html");
            const rex = /src="?([^"\s]+)"?\s*/;
            const url = rex.exec(imageUrl);
            urlLink = url[1];
        } catch (e) {}

        if (urlLink) {
            var base64 = "";
            if (urlLink.includes("base64")) {
                base64 = urlLink;
            } else {
                const res = await axios.get(urlLink, { responseType: "blob" });
                const blob = res.data;
                const blobToBase64 = (blob) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onerror = reject;
                        reader.onload = () => {
                            resolve(reader.result);
                        };
                        reader.readAsDataURL(blob);
                    });

                base64 = await blobToBase64(blob);
            }

            //base64 to file
            const arr = base64.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            var n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            file = new File([u8arr], "변환된파일", { type: mime });
        } else {
            // 로컬파일 업로드!!
            const files = [...e.dataTransfer.files];
            file = files[0];
        }
        if (!file) {
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await axios({
                url: `${process.env.REACT_APP_HOST}/upload_file`,
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${getAccessToken()}`,
                },
                data: formData,
            });
            console.log("upload result:", data);
            if (data.code === 0) {
                alert(data.msg);
            }
            fetchFiles();
        } catch (err) {
            console.error(err);
            alert("업로드 실패");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (f) => {
        if (!window.confirm(`"${f.name}" 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const { data } = await axios({
                url: `${process.env.REACT_APP_HOST}/del_file`,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${getAccessToken()}`,
                },
                data: { url: f.url },
            });

            if (data.code === 0) {
                alert(data.msg);
            }
            fetchFiles();
        } catch (err) {
            console.error(err);
            alert("삭제 실패");
        }
    };

    const getSystemInfo = async () => {
        try {
            const { data } = await axios({
                url: `${process.env.REACT_APP_HOST}/get_system_info`,
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });
            console.log(data);

            setSystemInfo(data);
        } catch (err) {
            console.error(err);
        }
    };

    const formatBytes = (bytes) => {
        const mb = bytes / (1024 * 1024);
        return mb.toFixed(1) + " MB";
    };

    return (
        <div className="pt-8">
            <div
                className={`${isDragEnter ? "bg-gray-600 border-blue-400" : "bg-gray-800 border-gray-600"} border-2 border-dashed rounded-lg mx-6 mb-4 p-6 flex flex-col items-center justify-center`}
                onDragEnter={(e) => dragEnter(e)}
                onDragLeave={(e) => dragLeave(e)}
                onDragOver={(e) => dragOver(e)}
                onDrop={(e) => drop(e)}
            >
                {isUploading ? (
                    <div className="text-white text-sm">업로드 중...</div>
                ) : (
                    <div>
                        <div className="flex flex-col items-center">
                            <UploadCloudIcon className="size-8 text-gray-400 mb-2" />
                            <div className="text-gray-400 text-sm">파일을 드래그하여 업로드</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="ms-8 mb-8 text-gray-500 text-xs">
                {systemInfo && (
                    <div className="flex flex-row">
                        <div>Used: {formatBytes(systemInfo.disk_used)}</div>
                        <div>, </div>
                        <div>Files: {systemInfo.file_count}</div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-4 px-6 pb-6">
                {files.map((f, i) => (
                    <div key={i} className="text-center text-white relative" style={{ width: "100px" }}>
                        <button
                            className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700 absolute -top-2 -right-2 z-10"
                            onClick={() => handleDeleteFile(f)}
                        >
                            <XIcon className="size-3" />
                        </button>
                        {isImage(f.name) ? (
                            <a href={f.url} target="_blank">
                                <img
                                    src={f.url}
                                    alt={f.name}
                                    className="rounded"
                                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                />
                            </a>
                        ) : (
                            <a href={f.url} download className="block" target="_blank">
                                <div
                                    className="rounded bg-gray-500 flex items-center justify-center hover:bg-gray-400"
                                    style={{ width: "100px", height: "100px" }}
                                >
                                    <FileIcon className="size-8" />
                                </div>
                            </a>
                        )}
                        <div className="truncate mt-1" style={{ fontSize: "11px" }}>
                            {f.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FileRoom;
