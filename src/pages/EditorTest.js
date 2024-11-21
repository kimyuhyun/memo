import { React, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";

const customEditorStyle = EditorView.theme({
    ".cm-scroller": {
        // overflow: "hidden !important", // 스크롤 완전 제거
        backgroundColor: "#000",
    },
    ".cm-content": {
        minHeight: "500px",
        fontFamily: "monospace",
        fontSize: "12px",
    },

    // 포커스된 상태
    // "&.cm-focused .cm-selectionBackground": {
    //     backgroundColor: "#FFF !important",
    // },
    
});

function EditorTest() {
    return (
        <div>
            <CodeMirror
                value="google.com, pub-2936413424853495, DIRECT, f08c47fec0942fa0
google.com, pub-3940256099942544, DIRECT, f08c47fec0942fa0
facebook.com, 2479224068765598, RESELLER, c3e20eee3f780d68
pangleglobal.com, 66140, DIRECT"
                basicSetup={{
                    lineNumbers: false, // 줄 번호 표시 제거
                    foldGutter: false,
                    highlightActiveLine: false,
                    indentOnInput: false,
                    scrollPastEnd: false, // 문서 끝을 넘어서는 스크롤 방지
                    scrollbarStyle: null, // 스크롤바 완전 제거
                    autocompletion: false, // 자동완성 비활성화
                }}
                theme="dark" // 다크 테마 설정
                extensions={[customEditorStyle, javascript({ jsx: true })]}
            />
        </div>
    );
}

export default EditorTest;
