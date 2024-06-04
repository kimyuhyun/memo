import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function FileRoom() {
    const navigate = useNavigate();
    const [isDragEnter, setDragEnter] = useState(false);
    const [isUploading, setUploading] = useState(false);

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
        console.log(file);

        // const uploadedUrl = await uploadFile(file);
        // console.log("Uploaded Image URL:", uploadedUrl);
    };


    return (
        <div className="d-flex flex-column vh-100">
            <div className="d-flex flex-row align-items-center p-2">
                <button className="btn btn-lg me-auto" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left"></i>
                </button>
            </div>

            <div
                className={`${isDragEnter ? "bg-dark-subtle" : "bg-dark"} d-flex flex-fill p-4`}
                onDragEnter={(e) => dragEnter(e)}
                onDragLeave={(e) => dragLeave(e)}
                onDragOver={(e) => dragOver(e)}
                onDrop={(e) => drop(e)}
            >아직 미구현!</div>
        </div>
    );
}

export default FileRoom;
