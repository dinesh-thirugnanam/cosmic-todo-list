// app/components/TaskMap.jsx
'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import TaskPath from './TaskPath'
import { Suspense, useRef, useEffect } from 'react'
import * as THREE from 'three'

// Camera controller component that handles both keyboard and mouse/touch navigation
function CameraController() {
  const { camera, gl } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 10, 0))
  const zoom = useRef(50)
  const keys = useRef({})
  
  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true
    }
    
    const handleKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false
    }
    
    const handleWheel = (e) => {
      // Adjust zoom level based on wheel direction
      zoom.current = Math.max(20, Math.min(100, zoom.current + (e.deltaY * -0.05)))
      e.preventDefault()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      gl.domElement.removeEventListener('wheel', handleWheel)
    }
  }, [gl])
  
  // Handle pan with mouse drag
  useEffect(() => {
    let isDragging = false
    let previousX = 0
    let previousY = 0
    
    const handleMouseDown = (e) => {
      isDragging = true
      previousX = e.clientX
      previousY = e.clientY
    }
    
    const handleMouseMove = (e) => {
      if (!isDragging) return
      
      // Calculate movement delta
      const deltaX = (e.clientX - previousX) * 0.05
      const deltaY = (e.clientY - previousY) * 0.05
      
      // Update camera target position (x and z in 3D space correspond to x and y in 2D view)
      targetPosition.current.x -= deltaX
      targetPosition.current.z -= deltaY  // Z in 3D space is used for Y in our 2D top-down view
      
      previousX = e.clientX
      previousY = e.clientY
    }
    
    const handleMouseUp = () => {
      isDragging = false
    }
    
    // Touch events for mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true
        previousX = e.touches[0].clientX
        previousY = e.touches[0].clientY
      }
    }
    
    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return
      
      const deltaX = (e.touches[0].clientX - previousX) * 0.05
      const deltaY = (e.touches[0].clientY - previousY) * 0.05
      
      targetPosition.current.x -= deltaX
      targetPosition.current.z -= deltaY  // Z in 3D space is used for Y in our 2D top-down view
      
      previousX = e.touches[0].clientX
      previousY = e.touches[0].clientY
    }
    
    const handleTouchEnd = () => {
      isDragging = false
    }
    
    gl.domElement.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    gl.domElement.addEventListener('touchstart', handleTouchStart)
    gl.domElement.addEventListener('touchmove', handleTouchMove)
    gl.domElement.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      
      gl.domElement.removeEventListener('touchstart', handleTouchStart)
      gl.domElement.removeEventListener('touchmove', handleTouchMove)
      gl.domElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gl])
  
  // Update camera position and zoom based on keyboard input and other controls
  useFrame(() => {
    const moveSpeed = 0.1
    
    // WASD or Arrow keys movement (treating X and Y as 2D coordinates)
    if (keys.current['w'] || keys.current['arrowup']) {
      targetPosition.current.z -= moveSpeed  // Move up (decrease Z in 3D space)
    }
    if (keys.current['s'] || keys.current['arrowdown']) {
      targetPosition.current.z += moveSpeed  // Move down (increase Z in 3D space)
    }
    if (keys.current['a'] || keys.current['arrowleft']) {
      targetPosition.current.x -= moveSpeed  // Move left (decrease X)
    }
    if (keys.current['d'] || keys.current['arrowright']) {
      targetPosition.current.x += moveSpeed  // Move right (increase X)
    }
    
    // Zoom with keyboard
    if (keys.current['q']) {
      zoom.current = Math.max(20, zoom.current - 1)
    }
    if (keys.current['e']) {
      zoom.current = Math.min(100, zoom.current + 1)
    }
    
    // Update camera position and zoom smoothly
    camera.position.x += (targetPosition.current.x - camera.position.x) * 0.1
    camera.position.z += (targetPosition.current.z - camera.position.z) * 0.1
    camera.zoom += (zoom.current - camera.zoom) * 0.1
    camera.updateProjectionMatrix()
  })
  
  return null
}

export default function TaskMap({ tasks, onTaskComplete }) {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <Suspense fallback={null}>
          <OrthographicCamera
            makeDefault
            position={[0, 10, 0]}
            zoom={50}
            near={0.1}
            far={1000}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          <CameraController />
          <ambientLight intensity={0.8} />
          <TaskPath tasks={tasks} onTaskComplete={onTaskComplete} />
        </Suspense>
      </Canvas>
    </div>
  )
}