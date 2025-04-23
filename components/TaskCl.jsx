// app/components/Task.jsx
'use client'

import { useState, useRef } from 'react'
import { Text, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function TaskCl({ task, position, onComplete, curve, isStatic = true }) {
  const [showPopup, setShowPopup] = useState(false)
  const progressRef = useRef(isStatic ? null : task.startProgress)
  
  // Handle animation for tasks that are being completed
  useFrame(() => {
    if (isStatic || !progressRef.current) return
    
    // Animate the task along the path
    progressRef.current += 0.005
    
    // Task reached the end
    if (progressRef.current >= 1) {
      onComplete(task.id)
    }
  })
  
  // For animated tasks, position is calculated from the progress
  const taskPosition = isStatic ? position : curve.getPoint(progressRef.current)
  
  return (
    <group 
      position={taskPosition}
      onPointerEnter={() => isStatic && setShowPopup(true)}
      onPointerLeave={() => isStatic && setShowPopup(false)}
    >
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {`Task ${task.id}`}
      </Text>
      
      {/* Simple popup on hover */}
      {showPopup && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black bg-opacity-80 text-white p-2 rounded-md shadow-md" style={{ width: '150px' }}>
            <h3 className="text-sm font-bold mb-1">{task.title}</h3>
            <button 
              className="bg-green-500 text-xs text-white px-2 py-1 rounded hover:bg-green-600"
              onClick={() => onComplete(task.id)}
            >
              Finish Task
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}