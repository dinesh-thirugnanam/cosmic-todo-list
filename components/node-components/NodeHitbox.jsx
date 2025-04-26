// components/NodeHitbox.tsx
import React, { useRef } from 'react';


const NodeHitbox= ({ setHovered, taskCount }) => {
  const hitboxRef = useRef(null);

  return (
    <mesh
      ref={hitboxRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <circleGeometry args={[0.3 + Math.min(taskCount * 0.2, 0.5), 16, 16]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

export default NodeHitbox;