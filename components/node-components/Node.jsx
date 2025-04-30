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

const interpolateColor = (color1, color2, factor) => {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;
  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return (r << 16) | (g << 8) | b;
}

const Node = ({ position, nodeData }) => {
  const [hovered, setHovered] = useState(false);
  const taskCount = Array.isArray(nodeData.tasks) ? nodeData.tasks.length : 0;
  const hasTasks = taskCount > 0;
  // const factor = taskCount === 0 ? 0 : Math.min(1 - Math.exp(-taskCount / 5), 1);
  // const baseColor = interpolateColor(0xffffff, 0xff00ff, factor);
  const baseColor = hasTasks ? 0xffff00: 0xffffff;
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
        nodeData.tasks.slice(0, 5).map((item, index) => (
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