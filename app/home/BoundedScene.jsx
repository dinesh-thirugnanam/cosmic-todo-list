import React, { useEffect, useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Node from "@/components/node-components/Node";
import KeyboardControls from "@/utils/KeyboardControls";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function BoundedScene({ nodes = [], setNodeClicked }) {
    const controlsRef = useRef();
    const { camera, size, gl } = useThree();
    const planeRef = useRef();
    const groupRef = useRef();

    useGSAP(() => {
        if (groupRef.current) {
            gsap.set(groupRef.current.rotation, { z: 0 });
            gsap.to(groupRef.current.rotation, {
                repeat: -1,
                z: Math.PI * 2,
                duration: 360,
                ease: "none",
            });
        }
    });

    // Enable shadows in the renderer
    useEffect(() => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
    }, [gl]);

    // Generate spiral path points with minimum distance between nodes
    const pathPoints = useMemo(() => {
        const points = [];
        const numTurns = 6;
        const maxRadius = 50;
        const numPoints = nodes.length || 10;
        const minDistance = 1.5; // Minimum distance between consecutive nodes
        const angleStep = (2 * Math.PI) / (numPoints / numTurns);
        let currentRadius = 0;

        for (let i = 0; i < numPoints; i++) {
            const theta = i * angleStep;
            currentRadius +=
                minDistance /
                Math.max(1, Math.sin(angleStep) * currentRadius || 1);
            const irregularity = 0.2 * Math.sin(theta); // Reduced irregularity
            const radius = currentRadius + irregularity;
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            points.push(new THREE.Vector3(x, y, 0));
        }
        return points;
    }, [nodes]);

    // Create a curve from path points for visualization
    const pathCurve = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(pathPoints);
        curve.closed = false;
        return curve;
    }, [pathPoints]);

    // Calculate bounds based on path points
    const bounds = useMemo(() => {
        if (pathPoints.length === 0)
            return { minX: -5, maxX: 5, minY: -5, maxY: 5 };

        const xs = pathPoints.map((p) => p.x);
        const ys = pathPoints.map((p) => p.y);

        const padding = 10; // Increased padding for larger plane
        return {
            minX: Math.min(...xs) - padding,
            maxX: Math.max(...xs) + padding,
            minY: Math.min(...ys) - padding,
            maxY: Math.max(...ys) + padding,
        };
    }, [pathPoints]);

    // Create a visual boundary plane
    const planeWidth = bounds.maxX - bounds.minX;
    const planeHeight = bounds.maxY - bounds.minY;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    // Calculate adaptive min zoom to ensure entire plane is visible
    const adaptiveMinZoom = useMemo(() => {
        const aspect = size.width / size.height;
        const horizontalFit = size.width / planeWidth;
        const verticalFit = size.height / planeHeight;

        const scaleFactor = 1; // Slightly reduced to ensure visibility
        return Math.min(horizontalFit, verticalFit) * scaleFactor;
    }, [size, planeWidth, planeHeight]);

    // Set initial camera position to center of plane
    useEffect(() => {
        if (camera && pathPoints.length > 0) {
            camera.position.x = centerX;
            camera.position.y = centerY;
            camera.position.z = 10;

            camera.zoom = adaptiveMinZoom;
            camera.updateProjectionMatrix();

            if (controlsRef.current) {
                controlsRef.current.target.set(centerX, centerY, 0);
                controlsRef.current.update();
            }
        }
    }, [pathPoints, camera, centerX, centerY, adaptiveMinZoom]);

    useFrame(() => {
        if (!controlsRef.current) return;

        const controls = controlsRef.current;
        const target = controls.target;

        target.x = THREE.MathUtils.clamp(target.x, bounds.minX, bounds.maxX);
        target.y = THREE.MathUtils.clamp(target.y, bounds.minY, bounds.maxY);

        camera.position.x = target.x;
        camera.position.y = target.y;

        camera.zoom = THREE.MathUtils.clamp(
            camera.zoom,
            adaptiveMinZoom * 0.5,
            100
        );

        controls.update();
    });

    return (
        <>
            <ambientLight intensity={0} />
            <directionalLight
                position={[5, 5, 5]}
                intensity={0}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={15}
                shadow-camera-left={-7}
                shadow-camera-right={7}
                shadow-camera-top={7}
                shadow-camera-bottom={-7}
            />
            <group ref={groupRef} position={[centerX, centerY, 0]}>
                <mesh
                    position={[0, 0, -0.1]}
                    ref={planeRef}
                    receiveShadow={true}
                >
                    <planeGeometry args={[planeWidth, planeHeight]} />
                    <meshStandardMaterial
                        color="#fff"
                        side={THREE.DoubleSide}
                        roughness={0.8}
                        metalness={0.3}
                    />
                </mesh>
                {nodes.map((node, index) => (
                    <Node
                        key={node._id}
                        position={
                            pathPoints[index] || new THREE.Vector3(0, 0, 0)
                        }
                        nodeData={node}
                        setNodeClicked={setNodeClicked}
                    />
                ))}
            </group>
            <KeyboardControls
                controlsRef={controlsRef}
                speed={3}
                zoomSpeed={0.05}
            />
            <OrbitControls
                ref={controlsRef}
                enableRotate={false}
                enablePan={true}
                enableZoom={true}
                minZoom={adaptiveMinZoom * 0.5}
                maxZoom={100}
                zoomSpeed={1.5}
                mouseButtons={{
                    LEFT: THREE.MOUSE.PAN,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.ROTATE,
                }}
                touches={{
                    ONE: THREE.TOUCH.PAN,
                    TWO: THREE.TOUCH.DOLLY_ROTATE,
                }}
            />
        </>
    );
}
