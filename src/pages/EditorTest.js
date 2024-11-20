import { React, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

function EditorTest() {
    return (
        <div>
            <CodeMirror
                value="console.log('hello world!');"
                height="200px"
                theme="dark" // 다크 테마 설정
                extensions={[javascript({ jsx: true })]}
                onChange={(value) => console.log("value:", value)}
            />
        </div>
    );
}

export default EditorTest;
