// app/components/TaskPath.jsx
'use client'

import { useRef, useMemo, useState } from 'react'
import { Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function TaskPath({ tasks: initialTasks, onTaskComplete }) {
  const pathRef = useRef()
  const [tasks, setTasks] = useState(initialTasks)
  const [animatingTasks, setAnimatingTasks] = useState([])
  const [hoveredTask, setHoveredTask] = useState(null)
  
  // Define path points for Zathura-like board
  const pathPoints = useMemo(() => [
    new THREE.Vector3(-4, 0, 5),    // Starting point (bottom left)
    new THREE.Vector3(-5, 0, 3),
    new THREE.Vector3(-3, 0, 1),
    new THREE.Vector3(-5, 0, 0),    // First loop
    new THREE.Vector3(-4, 0, -2),
    new THREE.Vector3(-2, 0, -3),
    new THREE.Vector3(0, 0, -2),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 2),     // Middle section
    new THREE.Vector3(2, 0, 3),
    new THREE.Vector3(4, 0, 2),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(4, 0, -2),    // Right loop
    new THREE.Vector3(2, 0, -4),    
    new THREE.Vector3(0, 0, -5),
    new THREE.Vector3(-2, 0, -4),
    new THREE.Vector3(-1, 0, -2),   // Central spiral
    new THREE.Vector3(0, 0, 0),     // Center point (final destination)
  ], [])

  // Create a smooth curve from the points
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(pathPoints, false, 'centripetal')
  }, [pathPoints])

  // Create path geometry
  const pathGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(200)
    )
  }, [curve])

  // Define fixed positions for each task
  // These are points along the curve (values from 0 to 1)
  const taskPositions = useMemo(() => {
    return {
      1: 0.05,  // Near the start
      2: 0.25,  // First quarter
      3: 0.45,  // Near middle
      4: 0.65,  // Past middle
      5: 0.85,  // Near end
    }
  }, [])

  // Handle task completion
  const completeTask = (taskId) => {
    // Find the task
    const taskToAnimate = tasks.find(task => task.id === taskId)
    if (!taskToAnimate) return
    
    // Get the task's current position on the path
    const startProgress = taskPositions[taskId] || 0
    
    // Add to animating tasks
    setAnimatingTasks(prev => [...prev, {
      ...taskToAnimate,
      progress: startProgress,  // Starting from its current position
      targetProgress: 1,        // Target is end of path
    }])
    
    // Remove from regular tasks
    setTasks(prev => prev.filter(task => task.id !== taskId))
    
    // Reset hover state
    setHoveredTask(null)
  }

  // Animation loop
  useFrame(() => {
    if (animatingTasks.length === 0) return
    
    setAnimatingTasks(prev => 
      prev.map(task => {
        // Increase progress
        const newProgress = task.progress + 0.005
        
        // If task reached the end, remove it
        if (newProgress >= task.targetProgress) {
          // Notify parent component about completed task
          if (onTaskComplete) onTaskComplete(task.id)
          return null
        }
        
        return {
          ...task,
          progress: newProgress
        }
      }).filter(Boolean) // Remove completed tasks
    )
  })

  return (
    <group rotation={[0, 0, 0]}>
      {/* Render the path */}
      <line ref={pathRef}>
        <bufferGeometry attach="geometry" {...pathGeometry} />
        <lineBasicMaterial 
          attach="material" 
          color="#4ECDC4" 
          linewidth={2} 
        />
      </line>

      {/* Render static task nodes at their fixed positions */}
      {tasks.map((task) => {
        // Get the task's position from the taskPositions map
        const progress = taskPositions[task.id] || 0
        const position = curve.getPoint(progress)
        
        return (
          <group 
            key={task.id} 
            position={position}
            onPointerOver={() => setHoveredTask(task.id)}
            onPointerOut={() => setHoveredTask(null)}
          >
            <mesh userData={{ taskId: task.id }}>
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
            
            {/* Task popup on hover */}
            {hoveredTask === task.id && (
              <Html position={[0, 0.5, 0]} center>
                <div className="bg-black bg-opacity-80 text-white p-2 rounded-md shadow-md" style={{ width: '150px' }}>
                  <h3 className="text-sm font-bold mb-1">{task.title}</h3>
                  <button 
                    className="bg-green-500 text-xs text-white px-2 py-1 rounded hover:bg-green-600"
                    onClick={() => completeTask(task.id)}
                  >
                    Finish Task
                  </button>
                </div>
              </Html>
            )}
          </group>
        )
      })}
      
      {/* Render animating tasks */}
      {animatingTasks.map(task => {
        // Calculate position along the curve based on progress
        const position = curve.getPoint(task.progress)
        
        return (
          <group key={`animating-${task.id}`} position={position}>
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
          </group>
        )
      })}
    </group>
  )
}