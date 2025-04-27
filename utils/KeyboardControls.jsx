import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function KeyboardControls({ controlsRef, speed = 1, zoomSpeed = 0.1 }) {
  const { camera } = useThree();
  
  useEffect(() => {
    const keyDown = {};
    
    const handleKeyDown = (e) => {
      keyDown[e.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (e) => {
      keyDown[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Animation frame for smooth movement
    const moveCamera = () => {
      if (!controlsRef.current) return;
      
      // Pan with arrow keys or WASD
      const panSpeed = speed / camera.zoom; // Adjust speed based on zoom level
      let needsUpdate = false;
      
      // Right arrow or D key
      if (keyDown['arrowright'] || keyDown['d']) {
        controlsRef.current.target.x += panSpeed;
        needsUpdate = true;
      }
      
      // Left arrow or A key
      if (keyDown['arrowleft'] || keyDown['a']) {
        controlsRef.current.target.x -= panSpeed;
        needsUpdate = true;
      }
      
      // Up arrow or W key
      if (keyDown['arrowup'] || keyDown['w']) {
        controlsRef.current.target.y += panSpeed;
        needsUpdate = true;
      }
      
      // Down arrow or S key
      if (keyDown['arrowdown'] || keyDown['s']) {
        controlsRef.current.target.y -= panSpeed;
        needsUpdate = true;
      }
      
      // Zoom with + and -
      if (keyDown['+'] || keyDown['='] || keyDown['e']) { // = is usually the unshifted + key
        camera.zoom *= (1 + zoomSpeed);
        camera.updateProjectionMatrix();
        needsUpdate = true;
      }
      
      if (keyDown['-'] || keyDown['_'] || keyDown['q']) { // _ is shifted -
        camera.zoom *= (1 - zoomSpeed);
        camera.updateProjectionMatrix();
        needsUpdate = true;
      }
      
      if (needsUpdate && controlsRef.current) {
        controlsRef.current.update();
      }
      
      animationFrameId = requestAnimationFrame(moveCamera);
    };
    
    let animationFrameId = requestAnimationFrame(moveCamera);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, controlsRef, speed, zoomSpeed]);
  
  return null;
}