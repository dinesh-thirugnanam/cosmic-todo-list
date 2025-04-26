"use client";

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BoundedScene from './BoundedScene';

export default function MapCanvas() {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      // Simulate async data fetch
      const data = [
          // { id: "1", props: { tasks: ["task1", "task2"] } },
          // { id: "2", props: { tasks: [] } },
          // { id: "3", props: { tasks: ["task3"] } },
          {
              id: "4",
              props: {
                  tasks: [
                      "task4",
                      "task5",
                      "task6",
                      "task6",
                      "task6",
                      "task6",
                      "task6",
                  ],
              },
          },
          // { id: "5", props: { tasks: [] } },
          // { id: "6", props: { tasks: ["task7"] } },
          // { id: "7", props: { tasks: ["task8", "task9"] } },
          // { id: "8", props: { tasks: [] } },
          // { id: "9", props: { tasks: ["task10"] } },
          // { id: "10", props: { tasks: [] } },
          // {
          //     id: "11",
          //     props: {
          //         tasks: [
          //             "task11",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //             "task12",
          //         ],
          //     },
          // },
          // { id: "12", props: { tasks: ["task13"] } },
          // { id: "13", props: { tasks: ["task13"] } },
          // { id: "14", props: { tasks: [] } },
          // { id: "15", props: { tasks: ["task13"] } },
          // { id: "16", props: { tasks: [] } },
          // { id: "17", props: { tasks: ["task13"] } },
          // { id: "18", props: { tasks: ["task13"] } },
          // { id: "19", props: { tasks: ["task13", "task13"] } },
          // { id: "20", props: { tasks: ["task13", "task13", "task13"] } },
          // { id: "21", props: { tasks: ["task13"] } },
          // { id: "22", props: { tasks: ["task13"] } },
          // { id: "23", props: { tasks: ["task13"] } },
          // {
          //     id: "24",
          //     props: { tasks: ["task13", "task13", "task13", "task13"] },
          // },
          // { id: "25", props: { tasks: ["task13"] } },
          // { id: "26", props: { tasks: ["task13"] } },
          // { id: "27", props: { tasks: ["task13"] } },
          // { id: "28", props: { tasks: ["task13"] } },
          // {
          //     id: "29",
          //     props: {
          //         tasks: [
          //             "task13",
          //             "task13",
          //             "task13",
          //             "task13",
          //             "task13",
          //             "task13",
          //             "task13",
          //         ],
          //     },
          // },
          // { id: "30", props: { tasks: ["task13"] } },
          // { id: "31", props: { tasks: ["task13"] } },
      ];
      setNodes(data);
      setIsLoading(false);
  }, []);

  return (
      <div style={{ width: "100%", height: "100vh" }} className="bg-black">
          {isLoading ? (
              <div
                  style={{
                      color: "white",
                      textAlign: "center",
                      paddingTop: "50px",
                  }}
              >
                  Loading...
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
                  <BoundedScene nodes={nodes} />
              </Canvas>
          )}
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
  );
}