// pages/index.js
"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

function SpiralComponent({ position, children }) {
  return (
    <group position={position}>
      <Html distanceFactor={10}>{children}</Html>
    </group>
  );
}

export default function Home() {
  const components = [];
  const a = 2; // scaling factor
  const b = 0.306349; // golden ratio spiral coefficient

  for (let i = 0; i < 8; i++) {
    const theta = i * Math.PI / 4; // change angle step as needed
    const r = a * Math.exp(b * theta);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);

    components.push(
      <SpiralComponent key={i} position={[x, y, 0]}>
        <div className="bg-white p-4 rounded shadow text-black w-40 text-center">
          <h1 className="text-lg font-bold">Item {i + 1}</h1>
        </div>
      </SpiralComponent>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <Canvas className="absolute top-0 left-0 w-full h-full z-0">
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={false} />
        {components}
      </Canvas>
    </div>
  );
}
