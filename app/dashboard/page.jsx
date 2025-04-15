"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import Task from "../../components/Task"; // Assuming Task component is moved to its own file

// Generate a spiral path with CatmullRomCurve3
function generateSpiralPoints(count, stepAngle = Math.PI / 6, radiusStep = 2) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = i * stepAngle;
    const radius = i * radiusStep;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push(new THREE.Vector3(x, y, 0));
  }
  return points;
}

function CameraFollower({ curve, scrollRef }) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!curve) return;
    const t = scrollRef.current;
    curve.getPoint(t, targetVec.current);
    const target = targetVec.current;
    camera.position.lerp(new THREE.Vector3(target.x, target.y, 10), 0.1);
    camera.lookAt(target);
  });

  return null;
}

function SpiralLine({ curve }) {
  const points = curve.getPoints(500); // smoother line
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color="hotpink" />
    </line>
  );
}

export default function SpiralCanvas() {
  const taskCount = 30;
  const spiralPoints = generateSpiralPoints(taskCount);
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
  const scrollRef = useRef(0);
  const [scroll, setScroll] = useState(0); // Use state for scroll position to trigger re-render

  const touchStartY = useRef(0);

  // Handle scroll input (wheel)
  const handleScroll = (e) => {
    const delta = e.deltaY * 0.001;
    const next = Math.max(0, Math.min(1, scrollRef.current + delta));
    gsap.to(scrollRef, {
      duration: 1,
      current: next,
      ease: "power2.out",
      onUpdate: () => setScroll(next), // Update state when scroll changes
    });
  };

  // Handle touch input (touchstart and touchmove)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const delta = (touchStartY.current - e.touches[0].clientY) * 0.001;
    const next = Math.max(0, Math.min(1, scrollRef.current + delta));
    gsap.to(scrollRef, {
      duration: 0.3,
      current: next,
      ease: "power2.out",
      onUpdate: () => setScroll(next), // Update state when scroll changes
    });
    touchStartY.current = e.touches[0].clientY;
  };

  // Handle task click (move camera to task position)
  const handleTaskClick = (index) => {
    const t = index / (taskCount - 1);
    gsap.to(scrollRef, {
      duration: 1,
      current: t,
      ease: "power2.out",
      onUpdate: () => setScroll(t), // Update state when scroll changes
    });
  };

  // Handle slider change (move camera based on slider position)
  const handleSliderChange = (e) => {
    const t = parseFloat(e.target.value);
    gsap.to(scrollRef, {
      duration: 3,
      current: t,
      ease: "power2.out",
      onUpdate: () => setScroll(t), // Update state when slider changes
    });
  };

  useEffect(() => {
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <CameraFollower curve={spiralCurve} scrollRef={scrollRef} />
        <SpiralLine curve={spiralCurve} />
        {spiralPoints.map((pos, i) => (
          <Task key={i} position={pos} index={i} onClick={handleTaskClick} />
        ))}
      </Canvas>
      <div className="absolute z-10 bottom-4 scale-y-40 hover:scale-y-100 overflow-hidden transition-all ease-out left-1/2 -translate-x-1/2 w-3/4">
        <div className="w-full h-4 bg-gray-300 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-4 bg-amber-400 rounded-full"
            style={{ width: `${scroll * 100}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scroll}
            onChange={handleSliderChange}
            className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
