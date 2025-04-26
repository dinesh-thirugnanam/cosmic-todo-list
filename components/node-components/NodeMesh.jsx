// components/NodeMesh.tsx
import React, { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Html } from '@react-three/drei';


const NodeMesh = ({ hasTasks, nodeScale, hovered, baseColor }) => {
  const meshRef = useRef(null);
  const hoverTl = useRef(gsap.timeline({ paused: true }));

  useGSAP(() => {
    if (meshRef.current) {
      hoverTl.current = gsap
        .timeline({ yoyo: true })
        .to(meshRef.current.scale, {
          x: nodeScale * 1.2,
          y: nodeScale * 1.2,
          z: nodeScale * 1.2,
          duration: 0.3,
          ease: 'power2.inOut',
        })
        .to(
          meshRef.current.material,
          {
            emissiveIntensity: 4.0,
            duration: 0.3,
            ease: 'power2.inOut',
          },
          0
        );

      gsap.set(meshRef.current.scale, {
        x: nodeScale,
        y: nodeScale,
        z: nodeScale,
      });

      gsap
        .timeline({ repeat: -1, ease: 'none' })
        .to(meshRef.current.rotation, {
          z: Math.PI * 2,
          duration: 6,
          ease: 'none',
        });
    }
  }, [nodeScale]);

  useEffect(() => {
    if (hovered) hoverTl.current.play();
    else hoverTl.current.reverse();
  }, [hovered]);

  return (  

    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={hasTasks ? baseColor : 0xaaaaaa}
        emissive={hovered ? 'orange' : baseColor}
        emissiveIntensity={4}
        />
    </mesh>
  );
};
      

export default NodeMesh;