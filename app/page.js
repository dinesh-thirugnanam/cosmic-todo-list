// pages/index.js
"use client";

import React, {
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import gsap from "gsap";

// -----------------------------------------------------------------------------
// Component that renders each spiral item using <Html> for DOM content.
function SpiralComponent({ position, children }) {
    return (
        <group position={position}>
            <Html distanceFactor={10} transform={false}>
                {children}
            </Html>
        </group>
    );
}

// -----------------------------------------------------------------------------
// CameraTimelineController is now a forwardRef component so that its
// "goToIndex" function can be called externally (from the index overlay).
const CameraTimelineController = forwardRef(({ positions }, ref) => {
    const { camera } = useThree();

    // Expose goToIndex function to parent via ref.
    useImperativeHandle(ref, () => ({
        goToIndex: (index) => {
            // Clamp the index between 0 and positions.length - 1.
            index = Math.max(0, Math.min(index, positions.length - 1));
            const pos = positions[index];
            // Create a GSAP timeline: zoom out, pan, then zoom in.
            gsap.timeline()
                .to(camera.position, {
                    duration: 0.5,
                    z: 40,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        camera.lookAt(
                            new THREE.Vector3(
                                camera.position.x,
                                camera.position.y,
                                0
                            )
                        );
                    },
                })
                .to(camera.position, {
                    duration: 1,
                    x: pos.x,
                    y: pos.y,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        camera.lookAt(new THREE.Vector3(pos.x, pos.y, 0));
                    },
                })
                .to(camera.position, {
                    duration: 0.5,
                    z: 10,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        camera.lookAt(new THREE.Vector3(pos.x, pos.y, 0));
                    },
                });
        },
    }));

    // (Optional: You can still add your scroll trigger/scroll-based GSAP timeline here.)
    return null;
});
CameraTimelineController.displayName = "CameraTimelineController";

// -----------------------------------------------------------------------------
// A simple index navigation overlay to jump directly to a component.
function IndexNavigation({ count, onSelect }) {
    return (
        <div
            style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: "rgba(255,255,255,0.8)",
                padding: "10px",
                borderRadius: "8px",
            }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(i)}
                    style={{
                        margin: "5px",
                        padding: "5px 10px",
                        cursor: "pointer",
                    }}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
}

// -----------------------------------------------------------------------------
// Main Home component.
export default function Home() {
    const components = [];
    const positions = [];
    const count = 50;
    const angleStep = Math.PI / 10; // Angular step per component.
    const spiralRadiusStep = 100; // Distance increment radially.

    // Create a flat spiral on the XY plane (z = 0) and store each component's position.
    for (let i = 0; i < count; i++) {
        const theta = i * angleStep;
        const r = i * spiralRadiusStep;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = 0;
        positions.push(new THREE.Vector3(x, y, z));
        components.push(
            <SpiralComponent key={i} position={[x, y, z]}>
                <div className="bg-green-400 h-40 p-4 rounded-full shadow text-black w-40 text-center select-none flex items-center justify-center">
                    <h1 className="text-lg font-bold">Item {i + 1}</h1>
                </div>
            </SpiralComponent>
        );
    }

    // Create a ref so we can call goToIndex from the IndexNavigation overlay.
    const cameraControllerRef = useRef();

    return (
        <div className="relative w-full h-screen">
            {/* The index navigation overlay */}
            <IndexNavigation
                count={count}
                onSelect={(i) => cameraControllerRef.current?.goToIndex(i)}
            />

            <Canvas
                className="absolute top-0 left-0 w-full h-full z-0"
                camera={{
                    position: [positions[0].x, positions[0].y, 10],
                    up: [0, 1, 0],
                    near: 0.1,
                    far: 1000,
                }}
            >
                <CameraTimelineController
                    ref={cameraControllerRef}
                    positions={positions}
                />
                {components}
            </Canvas>
        </div>
    );
}
