// pages/index.js
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

function SpiralComponent({ position, children }) {
    return (
        <group position={position}>
            <Html distanceFactor={10}>{children}</Html>
        </group>
    );
}

function CameraScrollController({ positions }) {
    const { camera } = useThree();
    const currentScroll = useRef(0);
    const targetScroll = useRef(0);
    const snapTimeout = useRef();

    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            // Adjust the target scroll value based on wheel delta.
            targetScroll.current += e.deltaY * 0.005;
            // Clamp the target to valid indices.
            targetScroll.current = Math.max(
                0,
                Math.min(targetScroll.current, positions.length - 1)
            );

            // Clear and restart the snap timeout.
            clearTimeout(snapTimeout.current);
            snapTimeout.current = setTimeout(() => {
                // Snap to nearest integer after a pause.
                targetScroll.current = Math.round(targetScroll.current);
            }, 150);
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            window.removeEventListener("wheel", handleWheel);
            clearTimeout(snapTimeout.current);
        };
    }, [positions]);

    useFrame(() => {
        // Gradually interpolate currentScroll towards targetScroll.
        currentScroll.current +=
            (targetScroll.current - currentScroll.current) * 0.1;

        // Determine index and interpolation fraction between spiral positions.
        const index = Math.floor(currentScroll.current);
        const frac = currentScroll.current - index;

        if (index >= positions.length - 1) {
            camera.position.copy(positions[positions.length - 1]);
        } else {
            camera.position.lerpVectors(
                positions[index],
                positions[index + 1],
                frac
            );
        }
    });

    return null;
}

export default function Home() {
    const components = [];
    const positions = [];
    const count = 50;
    const angleStep = Math.PI / 6; // Angular step per component.
    const spiralRadiusStep = 0.5; // Radial distance increment per component.
    const zStep = 0.3; // Z-axis step per component.

    // Build spiral components along a 3D spiral path.
    for (let i = 0; i < count; i++) {
        const theta = i * angleStep;
        const r = i * spiralRadiusStep;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = i * zStep;
        positions.push(new THREE.Vector3(x, y, z));
        components.push(
            <SpiralComponent key={i} position={[x, y, z]}>
                <div className="bg-green-400 h-40 p-4 rounded-full shadow text-black w-40 text-center select-none flex items-center justify-center">
                    <h1 className="text-lg font-bold">Item {i + 1}</h1>
                </div>
            </SpiralComponent>
        );
    }

    return (
        <div className="relative w-full h-screen">
            <Canvas
                className="absolute top-0 left-0 w-full h-full z-0"
                camera={{
                    position: [0, 0, 20],
                    up: [0, 1, 0],
                    near: 0.1,
                    far: 1000,
                }}
            >
                <CameraScrollController positions={positions} />
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    screenSpacePanning
                />
                {components}
            </Canvas>
        </div>
    );
}
