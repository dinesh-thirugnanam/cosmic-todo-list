import { Html } from "@react-three/drei";
import React from "react";

export default function Task({ position, index, onClick }) {
  return (
    <group position={position}>
      <Html center>
        <div
          onClick={() => onClick(index)}
          className="bg-white text-slate-700 border p-4 rounded-lg shadow-lg hover:scale-110 transition-transform cursor-pointer w-32 text-center"
        >
          Task {index + 1}
        </div>
      </Html>
    </group>
  );
}