"use client";

import * as THREE from "three";
import { useMemo } from "react";

export default function Path({ curve }) {
  // Generate a smooth line along the curve using 200 sample points.
  const points = useMemo(() => curve.getPoints(300), [curve]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  
  return (
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color="cyan" linewidth={10} />
    </line>
  );
}