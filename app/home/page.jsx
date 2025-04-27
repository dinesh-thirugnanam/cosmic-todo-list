"use client";
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BoundedScene from './BoundedScene';
import { CircleChevronRight } from 'lucide-react';
import SidePanel from '@/components/SidePanel';

export default function MapCanvas() {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuActive, setMenuActive] = useState(false);

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
    <div className='w-screen h-screen overflow-hidden flex'>
      {/* Side Panel */}
      <div
        className={`z-10 transition-all duration-200 ease-out 
          ${menuActive ? 'w-1/6' : 'min-w-4 w-[5vw]'} 
          h-screen relative left-0 bg-white/10`}
        onMouseEnter={() => setMenuActive(true)}
        onMouseLeave={() => setMenuActive(false)}
      >
        
        {/* Menu Button */}
        <button
          className={`absolute top-1/2 -right-4 transform -translate-y-1/2 cursor-pointer z-30 ${
            menuActive ? 'rotate-180' : ''
          } transition-transform duration-300 ease-out`}
          onClick={() => setMenuActive(!menuActive)}
        >
          <CircleChevronRight className="scale-150 bg-black rounded-full" />
        </button>
        <SidePanel menuActive={menuActive} />
      </div>

      {/* Main Content */}
      <div className={`transition-all relative duration-200 ease-out h-screen bg-black ${menuActive ? 'w-5/6' : 'w-[95vw]'}`}>
        {isLoading ? (
          <div className="text-white text-center pt-12">
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center pt-12">
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
        
        {/* Controls */}
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
    </div>
  );
}