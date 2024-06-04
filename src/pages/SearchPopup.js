import { useEffect, useState, useRef } from "react";

function SearchPopup({ setIsSearchPopup, handleOnKeyPress }) {
    const inputSearchEl = useRef();

    useEffect(() => {
        setTimeout(() => {
            inputSearchEl.current.value = "";
            inputSearchEl.current.focus();
        }, 100);
    }, []);

    const handleDoubleClick = (e) => {
        if (e.target.id === "backdrop") {
            setIsSearchPopup(false);
        }
    };

    return (
        <div className="modal bg-white bg-opacity-25" style={{ display: "block" }} id="backdrop" onDoubleClick={(e) => handleDoubleClick(e)}>
            <div className="w-75 mx-auto mt-5 pt-5">
                <input
                    type="text"
                    className="form-control"
                    placeholder="검색어를 입력하세요"
                    ref={inputSearchEl}
                    onKeyPress={handleOnKeyPress}
                />
            </div>
        </div>
    );
}

export default SearchPopup;
