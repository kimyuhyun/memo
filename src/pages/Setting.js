import React from "react";
import axios from "axios";
import { getAccessToken, setAccessToken } from "../utils/common";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { isPossibleToken } from "../utils/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import update from "immutability-helper";

export default () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        getCate();
    }, []);

    const getCate = async () => {
        if ((await isPossibleToken()) === -1) {
            navigate("/login");
            return;
        }
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/get_cate`,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
        console.log(data);
        // setData(data);
        setCards(data);
    };

    const handleSave = async () => {
        for (var i = 0; i < cards.length; i++) {
            const card = cards[i];
            console.log(card.idx, card.name1, i);

            const { data } = await axios({
                url: `${process.env.REACT_APP_HOST}/write`,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${getAccessToken()}`,
                },
                data: {
                    idx: card.idx,
                    name1: card.name1,
                    sort1: `${i + 1}`,
                    table: "MEMO_CATE_tbl",
                },
            });
            console.log(data);
        }
        alert("저장되었습니다.");
    };

    const handleAdd = async () => {
        const newName1 = prompt("", "");
        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/write`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
            data: {
                name1: newName1,
                table: "MEMO_CATE_tbl",
            },
        });
        console.log(data);
        getCate();
    };

    const handleModify = async (idx, name1) => {
        const newName1 = prompt("", name1);

        const { data } = await axios({
            url: `${process.env.REACT_APP_HOST}/write`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getAccessToken()}`,
            },
            data: {
                idx,
                name1: newName1,
                table: "MEMO_CATE_tbl",
            },
        });
        console.log(data);
        getCate();
    };

    const handleDelete = async (idx) => {
        if (window.confirm("삭제하시겠습니까?")) {
            const { data } = await axios({
                url: `${process.env.REACT_APP_HOST}/write`,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${getAccessToken()}`,
                },
                data: {
                    idx,
                    is_del: 1,
                    table: "MEMO_CATE_tbl",
                },
            });
            console.log(data);
            getCate();
        }
    };

    const moveCard = useCallback((dragIndex, hoverIndex) => {
        setCards((prevCards) =>
            update(prevCards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevCards[dragIndex]],
                ],
            })
        );
    }, []);
    const renderCard = useCallback((card, index, modifyClick, deleteClick) => {
        return <Card key={card.idx} index={index} id={card.idx} text={card.name1} moveCard={moveCard} modifyClick={modifyClick} deleteClick={handleDelete} />;
    }, []);

    return (
        <div>
            <div className="d-flex flex-row align-items-center">
                <button
                    className="btn btn-light btn-lg me-auto m-3"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(-1);
                    }}
                >
                    <i className="bi bi-arrow-left"></i>
                </button>
                <button className="btn btn-primary btn-lg m-3" onClick={handleSave}>
                    <i className="bi bi-check-lg"></i>
                </button>
            </div>
            <div className="p-3">
                <DndProvider backend={HTML5Backend}>
                    <div>{cards.map((card, i) => renderCard(card, i, handleModify, handleDelete))}</div>
                </DndProvider>
            </div>

            <button className="btn btn-primary m-3" onClick={handleAdd}>
                카테고리추가
            </button>
        </div>
    );
};

const style = {
    border: "1px dashed gray",
    padding: "0.5rem 1rem",
    marginBottom: ".5rem",
    backgroundColor: "white",
    cursor: "move",
};

const Card = ({ id, text, index, moveCard, modifyClick, deleteClick }) => {
    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
        accept: "card",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            // Time to actually perform the action
            moveCard(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: "card",
        item: () => {
            return { id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));
    return (
        <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
            {index + 1}. {text}
            <button className="btn btn-link btn-sm" onClick={() => modifyClick(id, text)}>
                <i className="bi bi-pencil"></i>
            </button>
            <button className="btn btn-link text-danger btn-sm" onClick={() => deleteClick(id)}>
                <i className="bi bi-trash"></i>
            </button>
        </div>
    );
};
