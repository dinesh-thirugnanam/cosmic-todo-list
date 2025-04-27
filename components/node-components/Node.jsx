import React, { useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import NodeMesh from './NodeMesh';
import NodeLight from './NodeLight';
import NodeHitbox from './NodeHitbox';
import NodeHalo from './NodeHalo';
import NodeParticles from './NodeParticles';
import ToolTip from './ToolTip';

// In Node.jsx
import { isMobile } from 'react-device-detect';

const Node = ({ position, nodeData }) => {
  const [hovered, setHovered] = useState(false);
  const taskCount = Array.isArray(nodeData.tasks) ? nodeData.tasks.length : 0;
  const hasTasks = taskCount > 0;
  const baseColor = hasTasks ? 0xffff00 : 0xffffff;
  const colorIntensity = hasTasks ? Math.min(1 + taskCount * 0.15, 1.75) : 1;
  const color = new THREE.Color(baseColor).multiplyScalar(colorIntensity);
  const nodeScale = 0.25 * (1.18 - Math.exp(-0.1 * taskCount));

  return (
    <group position={[position.x, position.y, position.z]}>
      <NodeLight
        hasTasks={hasTasks}
        hovered={hovered}
        color={color}
        taskCount={taskCount}
        castShadow={!isMobile}
      />
      <NodeMesh
        hasTasks={hasTasks}
        nodeScale={nodeScale}
        hovered={hovered}
        baseColor={baseColor}
        taskCount={taskCount}
        nodeData={nodeData.tasks}
      />
      {!isMobile && <NodeHitbox setHovered={setHovered} taskCount={taskCount} />}
      {hasTasks &&
        nodeData.tasks.slice(0, 3).map((item, index) => (
          <NodeHalo
            key={index}
            index={index}
            hovered={hovered}
            baseColor={baseColor}
            hasTasks={hasTasks}
          />
        ))}
      {!isMobile && (
        <NodeParticles hovered={hovered} hasTasks={hasTasks} taskCount={taskCount} />
      )}
      <ToolTip hovered={hovered} nodeData={nodeData.name} taskCount={taskCount} />
    </group>
  );
};

export default Node;