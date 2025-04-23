"use client";

import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

import PathBoard from "../../components/Path";
import TaskOnPath from "../../components/Task";
import tasksData from "../../data/tasks.json";

export default function MapScene() {
  // Initialize tasks with an extra `progress` property.
  // We'll place each task initially along the path based on its index.
  const [tasks, setTasks] = useState(
    tasksData.map((task, i) => ({
      ...task,
      progress: (i + 0.5) / tasksData.length // positions between 0 and 1
    }))
  );

  // Define a custom path (feel free to adjust control points)
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-10, -10, 0),
        new THREE.Vector3(0, -8, 0),
        new THREE.Vector3(10, -10, 0),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(10, 10, 0),
        new THREE.Vector3(3, 9, 0),
        new THREE.Vector3(5, 5, 0),
        new THREE.Vector3(7, 9, 0),
        new THREE.Vector3(2, 11, 0),
        new THREE.Vector3(-3, 12, 0),
        new THREE.Vector3(-10, 7, 0),
        new THREE.Vector3(-9, 6, 0),
      ],
      false,
      "catmullrom"
    );
  }, []);

  // Called when a task in the side menu is clicked.
  // Animate the clicked task along the curve until its progress reaches 1.
  const handleTaskClick = (taskId) => {
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === taskId) {
          gsap.to(task, {
            duration: 1,
            progress: 1,
            ease: "power2.out",
            onUpdate: () => {
              // Force a rerender by updating tasks state.
              setTasks((currentTasks) =>
                currentTasks.map((t) =>
                  t.id === taskId ? { ...t, progress: task.progress } : t
                )
              );
            },
            onComplete: () => {
              // Remove the task after it reaches the end.
              setTasks((currentTasks) => currentTasks.filter((t) => t.id !== taskId));
            }
          });
        }
        return task;
      });
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Canvas area */}
      <div style={{ flex: "1 1 0%" }}>
        <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 10], near: 0.1, far: 1000 }}>
          <ambientLight intensity={0.5} />
          <OrbitControls enableRotate={false} />
          <PathBoard curve={curve} />
          {tasks.map((task) => (
            <TaskOnPath key={task.id} task={task} curve={curve} />
          ))}
        </Canvas>
      </div>
      {/* Side menu */}
      <div style={{ width: "300px", borderLeft: "1px solid #ccc", padding: "1rem", overflowY: "auto" }}>
        <h3>Task List</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ margin: "0.5rem 0", cursor: "pointer" }} onClick={() => handleTaskClick(task.id)}>
              {task.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}