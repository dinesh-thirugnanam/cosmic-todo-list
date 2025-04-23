// components/CameraControls.js
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

export default function CameraControls() {
  const { camera, gl } = useThree();
  const state = useRef({ dragging: false, last: [0, 0] });

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (e) => {
      state.current.dragging = true;
      state.current.last = [e.clientX, e.clientY];
    };

    const onMouseMove = (e) => {
        if (!state.current.dragging) return;
        const [lx, ly] = state.current.last;
        const dx = (e.clientX - lx) / camera.zoom;
        const dy = (e.clientY - ly) / camera.zoom;
        camera.position.x -= dy;
        camera.position.y -= dx;
        state.current.last = [e.clientX, e.clientY];
      };
      

    const onMouseUp = () => {
      state.current.dragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 1 + e.deltaY * 0.001;
      camera.zoom = Math.max(10, Math.min(200, camera.zoom / zoomFactor));
      camera.updateProjectionMatrix();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [gl, camera]);

  return null;
}