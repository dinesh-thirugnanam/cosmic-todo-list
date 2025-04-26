import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useGSAP } from "@gsap/react";
import * as THREE from "three";
import gsap from "gsap";

export default function Node({ position, nodeData }) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef();
    const lightRef = useRef();
    const pointsRef = useRef();
    const hitboxRef = useRef();
    const haloRefs = useRef([]);
    const haloParentRefs = useRef([]);
    const pulseTl = useRef(gsap.timeline({ paused: true }));
    const hoverTl = useRef(gsap.timeline({ paused: true }));
    const rotateTl = useRef(gsap.timeline({ paused: true }));
    const particleTl = useRef(gsap.timeline({ paused: true }));
    const haloRotateTls = useRef([]);

    // Task count and visual properties
    const taskCount = Array.isArray(nodeData) ? nodeData.length : 0;
    const hasTasks = taskCount > 0;
    const baseColor = hasTasks ? 0xffff00 : 0xffffff;
    const colorIntensity = hasTasks ? Math.min(1 + taskCount * 0.15, 1.75) : 1;
    const color = new THREE.Color(baseColor).multiplyScalar(colorIntensity);
    const nodeScale = 0.25 * (1.18 - Math.exp(-0.1 * taskCount));

    // Particle halo
    const particles = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const count = 50 * (1 + taskCount * 0.05);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 1.5 + Math.random() * 0.5;
            vertices.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        }
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );
        return geometry;
    }, [taskCount]);

    // Setup animations
    useGSAP(
        () => {
            if (lightRef.current && meshRef.current && pointsRef.current) {
                pulseTl.current = gsap
                    .timeline({
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                    })
                    .to(lightRef.current, {
                        intensity: (hasTasks ? 1.0 : 0.5) * 1.3,
                        duration: () => 1 + Math.random() * 0.2,
                        ease: "sine.inOut",
                    });

                rotateTl.current = gsap
                    .timeline({
                        repeat: -1,
                        ease: "none",
                    })
                    .to(meshRef.current.rotation, {
                        z: Math.PI * 2,
                        duration: 6,
                        ease: "none",
                    });

                particleTl.current = gsap
                    .timeline({
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                    })
                    .to(pointsRef.current.material, {
                        opacity: 0.8,
                        size: 0.15,
                        duration: () => 0.5 + Math.random() * 0.3,
                    });

                hoverTl.current = gsap
                    .timeline({
                        yoyo: true,
                    })
                    .to(meshRef.current.scale, {
                        x: nodeScale * 1.2,
                        y: nodeScale * 1.2,
                        z: nodeScale * 1.2,
                        duration: 0.3,
                        ease: "power2.inOut",
                    })
                    .to(
                        meshRef.current.material,
                        {
                            emissiveIntensity: 4.0,
                            duration: 0.3,
                            ease: "power2.inOut",
                        },
                        0
                    )
                    .to(
                        lightRef.current,
                        {
                            intensity: 3.0,
                            duration: 0.3,
                            ease: "power2.inOut",
                        },
                        0
                    )
                    .to(
                        pointsRef.current.material,
                        {
                            opacity: 1.0,
                            size: 0.2,
                            duration: 0.3,
                            ease: "power2.inOut",
                        },
                        0
                    );

                gsap.set(meshRef.current.scale, {
                    x: nodeScale,
                    y: nodeScale,
                    z: nodeScale,
                });

                rotateTl.current.play();
                pulseTl.current.play();
                particleTl.current.play();

                haloRefs.current.forEach((halo, index) => {
                    const haloParent = haloParentRefs.current[index];
                    if (halo && haloParent) {
                        haloRotateTls.current[index] = gsap
                            .timeline({
                                repeat: -1,
                                yoyo: true,
                                ease: "none",
                            })
                            .set(halo.rotation, {
                                x: -Math.PI * 0.05,
                                y: Math.PI * 0.05,
                            })
                            .to(halo.rotation, {
                                x: Math.PI * 0.05,
                                y: -Math.PI * 0.05,
                                duration: 1 + index * 0.5,
                                ease: "none",
                            });

                        const haloParentRotateTl = gsap
                            .timeline({
                                repeat: -1,
                                ease: "none",
                            })
                            .to(haloParent.rotation, {
                                z: Math.PI * 2,
                                duration: 0.5,
                                ease: "none",
                            });

                        haloRotateTls.current[index].play();
                        haloParentRotateTl.play();
                    }
                });
            }
        },
        { dependencies: [hasTasks, nodeScale] }
    );

    // Handle hover state
    useEffect(() => {
        if (hovered) {
            pulseTl.current.pause();
            particleTl.current.pause();
            hoverTl.current.play();
        } else {
            hoverTl.current.reverse();
            pulseTl.current.resume();
            particleTl.current.resume();
        }
    }, [hovered]);

    return (
        <group position={[position.x, position.y, 0]}>
            <pointLight
                ref={lightRef}
                color={hovered ? "orange" : color}
                intensity={1.0}
                distance={20.0}
                decay={1.5}
                castShadow
                shadow-mapSize-width={512}
                shadow-mapSize-height={512}
                shadow-radius={8}
            />
            <mesh ref={meshRef} castShadow>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial
                    color={hasTasks ? baseColor : 0xaaaaaa}
                    emissive={hovered ? "orange" : baseColor}
                    emissiveIntensity={4}
                />
            </mesh>
            {/* Invisible hitbox mesh */}
            <mesh
                ref={hitboxRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <circleGeometry
                    args={[0.3 + Math.min(taskCount * 0.2, 0.5), 16, 16]}
                />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {hasTasks &&
                nodeData.map((item, index) => (
                    <group
                        key={index}
                        ref={(el) => (haloParentRefs.current[index] = el)}
                    >
                        <mesh ref={(el) => (haloRefs.current[index] = el)}>
                            <torusGeometry
                                args={[0.5 + index * 0.2, 0.01, 8]}
                            />
                            <meshBasicMaterial
                                color={
                                    hovered
                                        ? "orange"
                                        : hasTasks
                                        ? baseColor
                                        : 0x88ccff
                                }
                                transparent
                                opacity={0.3 - index * 0.05}
                            />
                        </mesh>
                    </group>
                ))}
            <points ref={pointsRef} geometry={particles}>
                <pointsMaterial
                    color={hovered ? "orange" : hasTasks ? 0xffffff : 0xdddddd}
                    size={0.1}
                    transparent
                    opacity={0.6}
                />
            </points>
        </group>
    );
}