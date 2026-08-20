import { useState } from "react";

// name="xxx" 가 앞에 붙은 #hex 또는 그냥 #hex 를 전부 추출
const parseColors = (text) => {
    const rex = /(?:name="([^"]+)"[^#\n]*)?#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g;
    const list = [];
    let m;
    while ((m = rex.exec(text)) !== null) {
        let hex = m[2];
        let alpha = "";
        if (hex.length === 3) {
            hex = hex
                .split("")
                .map((c) => c + c)
                .join("");
        } else if (hex.length === 8) {
            // Android #AARRGGBB
            alpha = Math.round((parseInt(hex.slice(0, 2), 16) / 255) * 100) + "%";
            hex = hex.slice(2);
        }
        list.push({ name: m[1] || "", hex: "#" + hex.toUpperCase(), alpha });
    }
    return list;
};

// 배경 밝기에 따라 글자색 결정
const isLight = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 140;
};

function ColorPicker() {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState("");
    const colors = parseColors(text);

    const copy = (hex) => {
        navigator.clipboard.writeText(hex);
        setCopied(hex);
        setTimeout(() => setCopied(""), 1000);
    };

    return (
        <div className="p-6 text-white">
            <textarea
                className="w-full h-48 bg-gray-800 border border-gray-600 rounded p-3 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500"
                placeholder={'<color name="gold">#E8C878</color>\n#17111B\n... 컬러 값이 들어간 텍스트를 붙여넣으세요'}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            {colors.length > 0 && (
                <table className="mt-6 w-full max-w-4xl mx-auto text-sm border-collapse">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                            <th className="py-2 px-3">Color</th>
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Hex</th>
                            <th className="py-2 px-3">Alpha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {colors.map((c, i) => (
                            <tr
                                key={i}
                                className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                                onClick={() => copy(c.hex)}
                                title="클릭하면 복사"
                            >
                                <td className="py-2 px-3">
                                    <div
                                        className="rounded h-8 w-32 flex items-center justify-center text-xs border border-gray-600"
                                        style={{ backgroundColor: c.hex, color: isLight(c.hex) ? "#000" : "#fff" }}
                                    >
                                        {copied === c.hex ? "복사됨!" : c.hex}
                                    </div>
                                </td>
                                <td className="py-2 px-3 text-gray-300">{c.name}</td>
                                <td className="py-2 px-3 font-mono text-gray-300">{c.hex}</td>
                                <td className="py-2 px-3 text-gray-500">{c.alpha}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ColorPicker;
