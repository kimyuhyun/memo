import { showAlert, showConfirm } from "../components/Alert";
import { React, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../utils/common";
import { ArrowLeftIcon, FileIcon, UploadCloudIcon, XIcon } from "lucide-react";

const TOTAL_CAPACITY = 500 * 1024 * 1024; // 500 MB

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
const isImage = (name) => {
    const ext = (name || "").split(".").pop().toLowerCase();
    return IMAGE_EXTS.includes(ext);
};

function FileRoom() {
    const navigate = useNavigate();
    const [isDragEnter, setDragEnter] = useState(false);
    const [progress, setProgress] = useState(null); // [{name, pct, error}] | null
    const [files, setFiles] = useState([]);
    const [systemInfo, setSystemInfo] = useState(null);
    const fileInputRef = useRef(null);

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

    // 자식 요소 드나들 때 dragleave가 깜빡이는 것 방지용 카운터
    const dragCountRef = useRef(0);

    const dragEnter = (e) => {
        e.preventDefault();
        dragCountRef.current++;
        setDragEnter(true);
    };

    const dragLeave = (e) => {
        e.preventDefault();
        if (--dragCountRef.current <= 0) {
            dragCountRef.current = 0;
            setDragEnter(false);
        }
    };
    const dragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const uploadFiles = async (fileList) => {
        const targets = [...fileList].filter(Boolean);
        if (targets.length === 0) {
            return;
        }

        setProgress(targets.map((f) => ({ name: f.name, pct: 0, error: false })));

        for (let i = 0; i < targets.length; i++) {
            const formData = new FormData();
            formData.append("file", targets[i]);

            try {
                const { data } = await axios({
                    url: `${process.env.REACT_APP_HOST}/upload_file`,
                    method: "POST",
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                    data: formData,
                    onUploadProgress: (e) => {
                        const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
                        setProgress((prev) => prev.map((p, j) => (j === i ? { ...p, pct } : p)));
                    },
                });
                if (data.code === 0) {
                    showAlert(data.msg);
                    setProgress((prev) => prev.map((p, j) => (j === i ? { ...p, error: true } : p)));
                }
            } catch (err) {
                console.error(err);
                showAlert(`${targets[i].name} 업로드 실패`);
                setProgress((prev) => prev.map((p, j) => (j === i ? { ...p, error: true } : p)));
            }
        }

        fetchFiles();
        setProgress(null);
    };

    const drop = async (e) => {
        e.preventDefault();
        dragCountRef.current = 0;
        setDragEnter(false);

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
            await uploadFiles([file]);
        } else {
            // 로컬파일 업로드!!
            await uploadFiles(e.dataTransfer.files);
        }
    };

    const handleDownload = async (f) => {
        try {
            const res = await axios.get(f.url, { responseType: "blob" });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = f.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            // CORS 등으로 blob 다운로드가 막히면 원본 URL로 대체 이동
            window.open(f.url, "_blank");
        }
    };

    const handleFileSelect = async (e) => {
        const selected = [...e.target.files];
        e.target.value = "";
        await uploadFiles(selected);
    };

    const handleDeleteFile = async (f) => {
        if (!await showConfirm(`"${f.name}" 삭제하시겠습니까?`)) {
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
                showAlert(data.msg);
            }
            fetchFiles();
        } catch (err) {
            console.error(err);
            showAlert("삭제 실패");
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
        <div
            className="pt-8 min-h-full"
            onDragEnter={(e) => dragEnter(e)}
            onDragLeave={(e) => dragLeave(e)}
            onDragOver={(e) => dragOver(e)}
            onDrop={(e) => drop(e)}
        >
            <div
                className="bg-gray-800 border-gray-600 border-2 border-dashed rounded-lg mx-6 mb-4 p-6 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center">
                    <UploadCloudIcon className="size-8 text-gray-400 mb-2" />
                    <div className="text-gray-400 text-sm">파일을 드래그하거나 클릭하여 업로드</div>
                </div>
            </div>

            {isDragEnter && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8">
                    <div className="w-full h-full border-4 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
                        <UploadCloudIcon className="size-16 text-blue-400 mb-4" />
                        <div className="text-white text-2xl">여기에 파일을 놓으세요.</div>
                    </div>
                </div>
            )}

            {progress && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-[360px] rounded-2xl bg-[#48484A]/95 backdrop-blur-xl shadow-2xl border border-white/20 p-6">
                        <div className="text-white text-lg text-center mb-4">업로드 중...</div>
                        {progress.map((p, i) => (
                            <div key={i} className="mb-3">
                                <div className="flex justify-between text-xs text-gray-300 mb-1">
                                    <div className="truncate mr-2">{p.name}</div>
                                    <div>{p.error ? "실패" : `${p.pct}%`}</div>
                                </div>
                                <div className="w-full bg-black/30 rounded-full h-1.5">
                                    <div
                                        className={`${p.error ? "bg-red-500" : "bg-blue-500"} h-1.5 rounded-full`}
                                        style={{ width: `${p.error ? 100 : p.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mx-8 mb-8 text-gray-500 text-xs">
                {systemInfo && (
                    <>
                        <div className="flex flex-row">
                            <div>Used: {formatBytes(systemInfo.disk_used)}</div>
                            <div>, </div>
                            <div>Free: {formatBytes(TOTAL_CAPACITY - systemInfo.disk_used)}</div>
                            <div>, </div>
                            <div>Files: {systemInfo.file_count}</div>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{
                                    width: `${Math.min(100, (systemInfo.disk_used / TOTAL_CAPACITY) * 100)}%`,
                                }}
                            />
                        </div>
                    </>
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
                            <button className="block" onClick={() => handleDownload(f)}>
                                <div
                                    className="rounded bg-gray-500 flex items-center justify-center hover:bg-gray-400"
                                    style={{ width: "100px", height: "100px" }}
                                >
                                    <FileIcon className="size-8" />
                                </div>
                            </button>
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
