"use client";

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BoundedScene from './BoundedScene';

export default function MapCanvas() {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch('/api/nodes');
        const result = await response.json();
        
        if (result.success) {
          setNodes(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch nodes');
        }
      } catch (err) {
        console.error('Error fetching nodes:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNodes();
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }} className="bg-black">
      {isLoading ? (
        <div
          style={{
            color: "white",
            textAlign: "center",
            paddingTop: "50px",
          }}
        >
          Loading...
        </div>
      ) : error ? (
        <div
          style={{
            color: "red",
            textAlign: "center",
            paddingTop: "50px",
          }}
        >
          Error: {error}
        </div>
      ) : (
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 10],
            near: 0.01,
            far: 1000,
          }}
        >
          <BoundedScene nodes={nodes} />
        </Canvas>
      )}
      <div className="absolute bottom-2.5 left-2.5 bg-black/50 text-white p-2.5 rounded pointer-events-none">
        <strong>Controls:</strong>
        <span className="hidden sm:block">
          <br />
          Pan: Arrow Keys or WASD
          <br />
          Zoom: + / - keys or Mouse Wheel
        </span>
        <span className="block sm:hidden">
          <br />
          Pan: Touch and drag
          <br />
          Zoom: Pinch zoom
        </span>
      </div>
    </div>
  );
}