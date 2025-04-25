"use client";

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BoundedScene from './BoundedScene';

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
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.5)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        pointerEvents: 'none'
      }}>
        <strong>Controls:</strong><br/>
        Pan: Arrow Keys or WASD<br/>
        Zoom: + / - keys or Mouse Wheel
      </div>
    </div>
  );
}