"use client";

import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <Canvas className="absolute top-0 left-0 w-full h-full z-0">
        {/* 3D content goes here */}
      </Canvas>
      <div
        className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow"
      >
        <h1 className="text-white text-lg font-bold">Center React Component</h1>
      </div>
    </div>
  );
}