"use client";

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";

export default function Task({ task, curve }) {
  // Compute the 3D position on the curve based on the task's progress.
  const position = useMemo(() => {
    const pos = curve.getPoint(task.progress);
    return [pos.x, pos.y, pos.z];
  }, [curve, task.progress]);
  
  return (
    <group position={position}>
      <mesh>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="orange" />
      </mesh>
      <Html center>{task.title}</Html>
    </group>
  );
}