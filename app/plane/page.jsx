"use client";

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BoundedScene from './BoundedScene';

export default function MapCanvas() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
      // Replace this with your fetch or DB call
      const data = [
          { id: "1", x: 10, y: -3, props: { tasks: ["task1", "task2"] } },
          { id: "2", x: -6, y: 9, props: { tasks: [] } },
          { id: "3", x: 10, y: 9, props: { tasks: ["task3"] } },
          {
              id: "4",
              x: 3,
              y: 3,
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
          { id: "5", x: 1, y: 2, props: { tasks: [] } },
          { id: "6", x: 2, y: 1, props: { tasks: ["task7"] } },
          { id: "7", x: 7, y: -9, props: { tasks: ["task8", "task9"] } },
          { id: "8", x: -1, y: 10, props: { tasks: [] } },
          { id: "9", x: -12, y: 10, props: { tasks: ["task10"] } },
          { id: "10", x: -14, y: 10, props: { tasks: [] } },
          {
              id: "11",
              x: -17,
              y: 20,
              props: {
                  tasks: [
                      "task11",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                      "task12",
                  ],
              },
          },
          { id: "12", x: -19, y: -6, props: { tasks: ["task13"] } },
      ];
      setNodes(data);
  }, []);

  return (
      <div style={{ width: "100%", height: "100vh" }} className="bg-black">
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
          <div
              style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  padding: "10px",
                  borderRadius: "5px",
                  pointerEvents: "none",
              }}
          >
              <strong>Controls:</strong>
              <br />
              Pan: Arrow Keys or WASD
              <br />
              Zoom: + / - keys or Mouse Wheel
          </div>
      </div>
  );
}