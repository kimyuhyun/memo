import { useEffect, useState } from "react";

let push = null;
let seq = 0;

// window.alert 대체. 어디서든 import 해서 호출.
export const showAlert = (msg) => {
    if (push) {
        push(String(msg));
    } else {
        window.alert(msg); // AlertHost 미마운트시 폴백
    }
};

let setConfirmState = null;

// window.confirm 대체. 사용: if (await showConfirm("...")) { ... }
export const showConfirm = (msg) =>
    new Promise((resolve) => {
        if (setConfirmState) {
            setConfirmState({ msg: String(msg), resolve });
        } else {
            resolve(window.confirm(msg)); // AlertHost 미마운트시 폴백
        }
    });

// App 루트에 한 번만 마운트
export default function AlertHost() {
    const [msgs, setMsgs] = useState([]);
    const [confirm, setConfirm] = useState(null);

    useEffect(() => {
        setConfirmState = setConfirm;
        push = (msg) => {
            const id = ++seq;
            setMsgs((prev) => [...prev, { id, msg }]);
            setTimeout(() => {
                setMsgs((prev) => prev.filter((m) => m.id !== id));
            }, 2500);
        };
        return () => {
            push = null;
            setConfirmState = null;
        };
    }, []);

    const answer = (ok) => {
        confirm.resolve(ok);
        setConfirm(null);
    };

    return (
        <>
            {msgs.length > 0 && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2">
                    {msgs.map((m) => (
                        <div
                            key={m.id}
                            className="bg-gray-800 text-white text-sm border border-gray-600 rounded-lg shadow-lg px-4 py-2.5 cursor-pointer"
                            onClick={() => setMsgs((prev) => prev.filter((x) => x.id !== m.id))}
                        >
                            {m.msg}
                        </div>
                    ))}
                </div>
            )}

            {confirm && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => answer(false)}
                >
                    <div
                        className="w-[360px] rounded-2xl overflow-hidden bg-[#48484A]/95 backdrop-blur-xl shadow-2xl border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-8 text-white text-lg text-center break-keep">{confirm.msg}</div>
                        <div className="flex border-t border-white/15">
                            <button
                                className="flex-1 py-4 text-[20px] text-[#0A84FF] active:bg-white/10 border-r border-white/15"
                                onClick={() => answer(false)}
                            >
                                취소
                            </button>
                            <button
                                autoFocus
                                className="flex-1 py-4 text-[20px] text-[#0A84FF] font-semibold active:bg-white/10 focus:bg-white/10 focus:outline-none"
                                onClick={() => answer(true)}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
