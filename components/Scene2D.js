"use client";

import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import CameraControls from "./CameraControls";
import Task from "./Task";

// Spiral layout
function generateSpiralPoints(count, step = 0.5) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = i * 0.3;
    const radius = step * i;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push([x, y]);
  }
  return points;
}

function ZoomToTask({ targetRef }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!targetRef.current) return;
    const { x, y } = targetRef.current.position;
    gsap.to(camera.position, {
      duration: 1,
      x,
      y,
      ease: "power2.inOut",
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  }, [targetRef, camera]);

  return null;
}

export default function Scene2D({ tasks }) {
  const selectedTaskRef = useRef();
  const points = generateSpiralPoints(tasks.length);

  return (
    <div className="w-full h-screen">
      <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <CameraControls />
        <ZoomToTask targetRef={selectedTaskRef} />
        {Array.isArray(tasks) && tasks.map((task, i) => (
          <Task
            key={task.id}
            position={[points[i][0], points[i][1], 0]}
            label={task.title}
            onClick={() => {
              selectedTaskRef.current = { position: new THREE.Vector3(points[i][0], points[i][1], 0) };
            }}
          />
        ))}
      </Canvas>
    </div>
  );
}