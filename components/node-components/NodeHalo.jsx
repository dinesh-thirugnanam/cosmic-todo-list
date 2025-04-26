// components/NodeHalo.tsx
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';



const NodeHalo = ({ index, hovered, baseColor, hasTasks }) => {
  const haloRef = useRef(null);
  const haloParentRef = useRef(null);

  useGSAP(() => {
    if (haloRef.current && haloParentRef.current) {
      gsap
        .timeline({ repeat: -1, yoyo: true, ease: 'none' })
        .set(haloRef.current.rotation, {
          x: -Math.PI * 0.05,
          y: Math.PI * 0.05,
        })
        .to(haloRef.current.rotation, {
          x: Math.PI * 0.05,
          y: -Math.PI * 0.05,
          duration: 1 + index * 0.5,
          ease: 'none',
        });

      gsap
        .timeline({ repeat: -1, ease: 'none' })
        .to(haloParentRef.current.rotation, {
          z: Math.PI * 2,
          duration: 0.5,
          ease: 'none',
        });
    }
  }, []);

  return (
    <group ref={haloParentRef}>
      <mesh ref={haloRef}>
        <torusGeometry args={[0.5 + index * 0.2, 0.01, 8]} />
        <meshBasicMaterial
          color={hovered ? 'orange' : hasTasks ? baseColor : 0x88ccff}
          transparent
          opacity={0.3 - index * 0.05}
        />
      </mesh>
    </group>
  );
};

export default NodeHalo;