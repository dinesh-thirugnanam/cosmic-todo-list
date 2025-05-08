import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const NodeHitbox = ({
    setHovered,
    setNodeClicked,
    node,
    taskCount,
    position = [0, 0, 8],
    threshold = 50,
}) => {
    const hitboxRef = useRef(null);
    const { camera, gl, size } = useThree();
    const mousePos = useRef({ x: 0, y: 0 });

    // Update mouse position, accounting for canvas offset
    useEffect(() => {
        const canvas = gl.domElement;
        const rect = canvas.getBoundingClientRect();

        const handleMouseMove = (event) => {
            const canvasX = event.clientX - rect.left;
            const canvasY = event.clientY - rect.top;
            mousePos.current = {
                x: (canvasX / rect.width) * 2 - 1,
                y: -(canvasY / rect.height) * 2 + 1,
            };
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [gl, size]);

    // Check proximity on each frame
    useEffect(() => {
        const checkProximity = () => {
            if (!hitboxRef.current) return;

            // Get the world position of the hitbox
            const worldPos = new THREE.Vector3();
            hitboxRef.current.getWorldPosition(worldPos);

            // Project the world position to screen space
            const screenPos = worldPos.clone().project(camera);

            // Convert screen position to pixel coordinates
            const rect = gl.domElement.getBoundingClientRect();
            const pixelX = ((screenPos.x + 1) * rect.width) / 2;
            const pixelY = ((screenPos.y + 1) * rect.height) / 2;

            // Get mouse pixel coordinates
            const mouseX = ((mousePos.current.x + 1) * rect.width) / 2;
            const mouseY = ((mousePos.current.y + 1) * rect.height) / 2;

            // Adjust threshold based on camera distance
            const distance = camera.position.distanceTo(worldPos);
            const dynamicThreshold = threshold * (distance / 5); // Scale threshold with distance (tune the divisor)

            // Check if mouse is within the dynamic threshold
            const isHovered =
                Math.abs(mouseX - pixelX) <= dynamicThreshold &&
                Math.abs(mouseY - pixelY) <= dynamicThreshold;

            setHovered(isHovered);
        };

        let animationFrameId;
        const animate = () => {
            checkProximity();
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [camera, gl, size, setHovered, threshold]);

    return (
        <mesh
            ref={hitboxRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                setNodeClicked([true, node]);
            }}
        >
            <planeGeometry args={[1, 1]} />
            {/* <circleGeometry
                args={[0.3 + Math.min(taskCount * 0.2, 0.5), 1, 1]}
            /> */}
            <meshBasicMaterial transparent opacity={0} />
            {/* <meshBasicMaterial visible={true} /> */}
        </mesh>
    );
};

export default NodeHitbox;
