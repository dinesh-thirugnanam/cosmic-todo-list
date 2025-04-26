import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Node from './Node';
import KeyboardControls from './KeyboardControls';

export default function BoundedScene({ nodes }) {
  const controlsRef = useRef();
  const { camera, size, gl } = useThree();
  
  // Enable shadows in the renderer
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);
  
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
    
    // Ensure zoom stays within limits
    camera.zoom = THREE.MathUtils.clamp(
      camera.zoom, 
      adaptiveMinZoom * 0.5, 
      100
    );
    
    controls.update();
  });

  return (
    <>
      {/* Reduced the ambient light intensity to make node lights more visible */}
      <ambientLight intensity={0} />
      
      {/* Added shadow casting to directional light */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={15}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      
      {/* Boundary plane - changed to StandardMaterial to receive light */}
      <mesh position={[centerX, centerY, -0.1]} rotation={[0, 0, 0]} receiveShadow={true}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshStandardMaterial 
          color="#fff"
          side={THREE.DoubleSide}
          roughness={0.8}
          metalness={0.3}
        />
      </mesh>
      
      {/* Grid for visual reference */}
      <gridHelper 
        args={[Math.max(planeWidth, planeHeight), 20, "#444444", "#333333"]}
        position={[centerX, centerY, -0.05]}
        rotation={[Math.PI/2, 0, 0]} 
      />
      
      {/* Nodes */}
      {nodes.map(node => (
        <Node 
          key={node.id} 
          position={node} 
          nodeData={node.props.tasks} 
        />
      ))}
      
      {/* Custom keyboard controls */}
      <KeyboardControls 
        controlsRef={controlsRef}
        speed={2} // Pan speed multiplier
        zoomSpeed={0.05} // Zoom speed multiplier
      />
      
      {/* Mouse/touch controls */}
      <OrbitControls
        ref={controlsRef}
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minZoom={adaptiveMinZoom * 0.5}
        maxZoom={100}
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