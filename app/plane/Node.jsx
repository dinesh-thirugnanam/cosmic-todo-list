import React from 'react';

export default function Node({ position }) {
  return (
    <mesh position={[position.x, position.y, 0]}>  
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
}