import React, { useRef, useMemo, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as THREE from 'three';


const NodeParticles= ({ hovered, hasTasks, taskCount }) => {
  const pointsRef = useRef(null);
  const particleTl = useRef(gsap.timeline({ paused: true }));

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
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [taskCount]);

  useGSAP(() => {
    if (pointsRef.current) {
      particleTl.current = gsap
        .timeline({ repeat: -1, yoyo: true, ease: 'sine.inOut' })
        .to(pointsRef.current.material, {
          opacity: 0.8,
          size: 0.15,
          duration: () => 0.5 + Math.random() * 0.3,
        });

      particleTl.current.play();
    }
  }, []);

  useEffect(() => {
    if (hovered && pointsRef.current) {
      particleTl.current.pause();
      gsap.to(pointsRef.current.material, {
        opacity: 1.0,
        size: 0.2,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    } else if (pointsRef.current) {
      particleTl.current.resume();
    }
  }, [hovered]);

  return (
    <points ref={pointsRef} geometry={particles}>
      <pointsMaterial
        color={hovered ? 'orange' : hasTasks ? 0xffffff : 0xdddddd}
        size={0.1}
        transparent
        opacity={0.6}
      />
    </points>
  );
};

export default NodeParticles;