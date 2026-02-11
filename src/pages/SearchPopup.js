import { XIcon } from "lucide-react";
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
        console.log(e.target.id);

        if (e.target.id === "backdrop") {
            setIsSearchPopup(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center bg-white/25"
            id="backdrop"
            onDoubleClick={(e) => handleDoubleClick(e)}
        >
            <div className="w-full max-w-4xl px-4 mt-[220px] h-fit">
                <div className="flex items-center bg-black rounded">
                    <input
                        type="text"
                        className="flex-1 bg-transparent text-white px-4 text-xl outline-none border-0"
                        placeholder="검색어를 입력하세요"
                        ref={inputSearchEl}
                        onKeyPress={handleOnKeyPress}
                    />
                    <button
                        className="text-gray-400 hover:text-white cursor-pointer p-4"
                        onClick={() => setIsSearchPopup(false)}
                    >
                        <XIcon className="size-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SearchPopup;
