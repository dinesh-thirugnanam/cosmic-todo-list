"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";

const Page = () => {
    return (
    <>
    <div className="absolute w-screen h-screen top-0 overflow-hidden">
        <Canvas>
            <mesh>
                <boxGeometry args={[2,2,2]} />
                <meshStandardMaterial color={"#132E32"} />
            </mesh>
            <ambientLight intensity={5} color={"#fff"} />
            <spotLight position={[4,-2,5]} angle={Math.PI/1} intensity={300} color={"#fff"} />
            <OrbitControls enablePan enableZoom enableRotate={true} />
        </Canvas>
    </div>
    </>
    );
}

export default Page;