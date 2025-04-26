import { Html } from "@react-three/drei";
import React from "react";

const ToolTip = ({hovered, nodeData, taskCount}) => {
    const hasTasks = taskCount > 0;
    return(
        <>
        {hovered && (
        <Html
        position={[0, 0.5, 0]} // Position above the node
        center
        distanceFactor={5} // Reduced for better scaling
        zIndexRange={[100, 0]}
        transform // Ensure it scales with the 3D scene
        sprite // Treat as a sprite to avoid distortion
        >
          <div
            className="bg-black/80 text-white h-fit max-h-20 overflow-clip px-2 py-1 rounded-md text-xs whitespace-nowrap pointer-events-none -translate-y-full translate-x-[200%]"
            >
            {hasTasks ? (
              <>
                <strong>Tasks ({taskCount}):</strong>
                <ul className="m-0 pl-3">
                  {nodeData.map((item, index) => (
                    <li key={index}>{item.name || `Task ${index + 1}`}</li>
                  ))}
                </ul>
              </>
            ) : (
              <span>No tasks</span>
            )}
          </div>
        </Html>
      )}
        </>
    );
};

export default ToolTip;