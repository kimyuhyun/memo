import React from "react";
import { useSearchParams } from "react-router-dom";
import List from "./List";
import Write from "./Write";

export default () => {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") ?? "";

    return mode !== "" ? <Write /> : <List />;
};
