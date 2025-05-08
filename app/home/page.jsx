"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import BoundedScene from "./BoundedScene";
import { fetchUserNodes } from "../../lib/actions";
import TodoApp from "@/components/list-view/TodoApp";
import CanvasMenu from "@/components/CanvasMenu";

export default function MapCanvas() {
    const [nodes, setNodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nodeClicked, setNodeClicked] = useState([false, null]);
    const [addedNew, setAddedNew] = useState(false);

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const response = await fetchUserNodes();
                const result = response.data;
                console.log("Fetched nodes:", result); // Debug log

                if (result.length >= 3) {
                    setNodes(result);
                } else {
                    throw new Error(result.error || "Failed to fetch nodes");
                }
            } catch (err) {
                console.error("Error fetching nodes:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNodes();
        setAddedNew(false);
    }, [addedNew]);

    useEffect(() => {
        console.log(nodeClicked);
    }, [nodeClicked]);

    return (
        <div className="w-screen h-screen overflow-hidden flex">
            {/* Main Content */}
            <div
                className={`transition-all relative duration-200 ease-out h-screen bg-black w-full`}
            >
                <CanvasMenu setAddedNew={setAddedNew} />
                {nodeClicked[0] ? (
                    <TodoApp
                        nodeClicked={nodeClicked}
                        setNodeClicked={setNodeClicked}
                    />
                ) : (
                    <></>
                )}
                {isLoading ? (
                    <div className="text-white text-center pt-12">
                        Loading...
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center pt-12">
                        Error: {error}
                    </div>
                ) : (
                    <Canvas
                        orthographic
                        camera={{
                            position: [0, 0, 10],
                            near: 0.01,
                            far: 1000,
                        }}
                    >
                        <BoundedScene
                            nodes={nodes}
                            setNodeClicked={setNodeClicked}
                        />
                    </Canvas>
                )}

                {/* Controls */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/50 text-white p-2.5 rounded pointer-events-none">
                    <strong>Controls:</strong>
                    <span className="hidden sm:block">
                        <br />
                        Pan: Arrow Keys or WASD
                        <br />
                        Zoom: + / - keys or Mouse Wheel
                    </span>
                    <span className="block sm:hidden">
                        <br />
                        Pan: Touch and drag
                        <br />
                        Zoom: Pinch zoom
                    </span>
                </div>
            </div>
        </div>
    );
}
