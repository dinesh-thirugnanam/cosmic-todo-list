"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Node({ position }) {
  return (
    <mesh position={[position.x, position.y, 0]}>  
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
}

function BoundedScene({ nodes }) {
  const controlsRef = useRef();
  const { camera, size } = useThree();
  
  // Calculate bounds based on nodes
  const bounds = React.useMemo(() => {
    if (nodes.length === 0) return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
    
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    
    // Add padding around nodes
    const padding = 2;
    return {
      minX: Math.min(...xs) - padding,
      maxX: Math.max(...xs) + padding,
      minY: Math.min(...ys) - padding,
      maxY: Math.max(...ys) + padding
    };
  }, [nodes]);
  
  // Create a visual boundary plane
  const planeWidth = bounds.maxX - bounds.minX;
  const planeHeight = bounds.maxY - bounds.minY;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  // Calculate adaptive min zoom to ensure entire plane is visible
  const adaptiveMinZoom = React.useMemo(() => {
    const aspect = size.width / size.height;
    const horizontalFit = size.width / planeWidth;
    const verticalFit = size.height / planeHeight;
    
    // Apply a scale factor to ensure the entire area is comfortably visible
    // Lower values = more zoomed out (can see more)
    const scaleFactor = 0.9;
    
    // Choose the smaller fit to ensure both dimensions are visible
    return Math.min(horizontalFit, verticalFit) * scaleFactor;
  }, [size, planeWidth, planeHeight]);

  // Set initial camera position to center of plane
  useEffect(() => {
    if (camera && nodes.length > 0) {
      camera.position.x = centerX;
      camera.position.y = centerY;
      camera.position.z = 10;
      
      // Set initial zoom to show entire plane
      camera.zoom = adaptiveMinZoom;
      camera.updateProjectionMatrix();
      
      // Update controls if they exist
      if (controlsRef.current) {
        controlsRef.current.target.set(centerX, centerY, 0);
        controlsRef.current.update();
      }
    }
  }, [nodes, camera, centerX, centerY, adaptiveMinZoom]);

  useFrame(() => {
    if (!controlsRef.current) return;
    
    // Constrain camera movement to bounds
    const controls = controlsRef.current;
    const target = controls.target;
    
    // Clamp the target position within bounds
    target.x = THREE.MathUtils.clamp(target.x, bounds.minX, bounds.maxX);
    target.y = THREE.MathUtils.clamp(target.y, bounds.minY, bounds.maxY);
    
    // Update camera position to match target
    camera.position.x = target.x;
    camera.position.y = target.y;
    
    controls.update();
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      
      {/* Boundary plane */}
      <mesh position={[centerX, centerY, -0.1]} rotation={[0, 0, 0]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial color="#202030" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Grid for visual reference */}
      <gridHelper 
        args={[Math.max(planeWidth, planeHeight), 20, "#444444", "#333333"]}
        position={[centerX, centerY, -0.05]}
        rotation={[Math.PI/2, 0, 0]} 
      />
      
      {/* Nodes */}
      {nodes.map(node => <Node key={node.id} position={node} />)}
      
      {/* Camera control with adaptive zoom */}
      <OrbitControls
        ref={controlsRef}
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minZoom={adaptiveMinZoom * 0.5} // Allow slightly more zoom out than needed
        maxZoom={100} // High max zoom for close inspection
        zoomSpeed={1.5}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE
        }}
        touches={{
          ONE: THREE.TOUCH.PAN,
          TWO: THREE.TOUCH.DOLLY_ROTATE
        }}
      />
    </>
  );
}

export default function MapCanvas() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Replace this with your fetch or DB call
    const data = [
      { id: '1', x: 10, y: -3 },
      { id: '2', x: -6, y: 9 },
      { id: '3', x: 10, y: 9 },
      { id: '4', x: 3, y: 3 },
      { id: '5', x: 1, y: 2 },
      { id: '6', x: 2, y: 1 },
      { id: '7', x: 7, y: -9 },
      { id: '8', x: -1, y: 10 },
      { id: '9', x: -12, y: 10 },
      { id: '10', x: -14, y: 10 },
      { id: '11', x: -17, y: 20 },
      { id: '12', x: -19, y: -6 }
    ];
    setNodes(data);
  }, []);

  useEffect(() => {
    // Disable browser zoom shortcuts
    const handleKeyDown = e => {
      if (e.ctrlKey && ['+', '-', '='].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas 
        orthographic
        camera={{
          position: [0, 0, 10],
          near: 0.01,
          far: 1000
        }}
      >
        <BoundedScene nodes={nodes} />
      </Canvas>
    </div>
  );
}