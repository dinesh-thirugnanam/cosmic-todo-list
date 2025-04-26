import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function Node({ position, nodeData }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const lightRef = useRef();
  const pointsRef = useRef();
  const haloRefs = useRef([]); // Array to store halo refs
  const pulseTl = useRef(gsap.timeline({ paused: true }));
  const hoverTl = useRef(gsap.timeline({ paused: true }));
  const rotateTl = useRef(gsap.timeline({ paused: true }));
  const particleTl = useRef(gsap.timeline({ paused: true }));
  const haloRotateTls = useRef([]); // Array to store halo rotation timelines

  // Determine task count and visual properties
  const taskCount = Array.isArray(nodeData) ? nodeData.length : 0;
  const hasTasks = taskCount > 0;
  const baseColor = hasTasks ? 0xffff00 : 0xaaaaaa;
  const colorIntensity = hasTasks ? Math.min(1 + taskCount * 0.15, 1.75) : 1;
  const color = new THREE.Color(baseColor).multiplyScalar(colorIntensity);
  const nodeScale = 0.3 * (1 + taskCount * 0.1);

  // Particle halo for cosmic sparkle
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const count = 50;
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
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  // Setup animations
  useEffect(() => {
    if (lightRef.current && meshRef.current && pointsRef.current) {
      // Pulse timeline for light with slight randomness
      pulseTl.current = gsap.timeline({
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }).to(lightRef.current, {
        intensity: (hasTasks ? 1.0 : 0.5) * 1.3,
        duration: () => 1 + Math.random() * 0.2,
        ease: "sine.inOut"
      }).to(meshRef.current.material, {
        emissiveIntensity: (hasTasks ? 2.0 : 0.5) * 1.5,
        duration: 1,
        ease: "sine.inOut"
      }, 0);

      // Rotation timeline for continuous sphere rotation
      rotateTl.current = gsap.timeline({
        repeat: -1,
        ease: "none"
      }).to(meshRef.current.rotation, {
        z: Math.PI * 2,
        duration: 6,
        ease: "none"
      });

      // Particle twinkle animation
      particleTl.current = gsap.timeline({
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }).to(pointsRef.current.material, {
        opacity: 0.8,
        size: 0.15,
        duration: () => 0.5 + Math.random() * 0.3
      });

      // Hover timeline for scale and material
      hoverTl.current = gsap.timeline().to(meshRef.current.scale, {
        x: nodeScale * 1.2,
        y: nodeScale * 1.2,
        z: nodeScale * 1.2,
        duration: 0.3,
        ease: "power2.inOut"
      }).to(meshRef.current.material, {
        emissiveIntensity: 1.0,
        duration: 0.3,
        ease: "power2.inOut"
      }, 0).to(lightRef.current, {
        intensity: 2.0,
        duration: 0.3,
        ease: "power2.inOut"
      }, 0).to(pointsRef.current.material, {
        opacity: 1.0,
        size: 0.2,
        duration: 0.3,
        ease: "power2.inOut"
      }, 0);

      // Set initial scale
      meshRef.current.scale.set(nodeScale, nodeScale, nodeScale);

      // Start animations
      rotateTl.current.play();
      pulseTl.current.play();
      particleTl.current.play();

      // Setup halo rotation animations
      haloRefs.current.forEach((halo, index) => {
        if (halo) {
          haloRotateTls.current[index] = gsap.timeline({
            repeat: -1,
            ease: "none"
          }).to(halo.rotation, {
            x: Math.PI * 2,
            y: Math.PI * 2,
            z: Math.PI * 2,
            duration: 5 + index * 0.5, // Vary duration for each halo
            ease: "none"
          });
          haloRotateTls.current[index].play();
        }
      });

      return () => {
        pulseTl.current.kill();
        hoverTl.current.kill();
        rotateTl.current.kill();
        particleTl.current.kill();
        haloRotateTls.current.forEach(tl => tl.kill());
      };
    }
  }, [hasTasks, nodeScale]);

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
        color={hovered ? 'orange' : color}
        intensity={hasTasks ? 1.0 : 0.5}
        distance={20}
        decay={1.5}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-radius={8}
      />
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={hasTasks ? baseColor : 0xaaaaaa}
          emissive={hovered ? 'orange' : (hasTasks ? baseColor : 0xaaaaaa)}
          emissiveIntensity={0.4}
        />
      </mesh>
      {hasTasks &&
        nodeData.map((item, index) => (
          <mesh
            key={index}
            ref={el => (haloRefs.current[index] = el)} // Assign ref to haloRefs array
          >
            <torusGeometry args={[0.5 + index * 0.2, 0.01, 8]} />
            <meshBasicMaterial
              color={hovered ? 'orange' : (hasTasks ? baseColor : 0x88ccff)}
              transparent
              opacity={0.3 - index * 0.05}
            />
          </mesh>
        ))}
      <points ref={pointsRef} geometry={particles}>
        <pointsMaterial
          color={hovered ? 'orange' : (hasTasks ? 0xffffff : 0xdddddd)}
          size={0.1}
          transparent
          opacity={0.6}
        />
      </points>
    </group>
  );
}