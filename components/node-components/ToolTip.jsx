import { Html } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";

const ToolTip = ({ hovered, nodeData, taskCount }) => {
  const hasTasks = taskCount > 0;
  const tooltipRef = useRef(null);
  const [expandWidth, setExpandWidth] = useState(false);
  const [expandHeight, setExpandHeight] = useState(false);

  useEffect(() => {
    if (hovered) {
      setExpandHeight(true);
      const timeout = setTimeout(() => setExpandWidth(true), 500);
      return () => clearTimeout(timeout);
    } else {
      setExpandWidth(false);
      const timeout = setTimeout(() => setExpandHeight(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [hovered]);

  return (
    <Html
      position={[0, 0.5, 0]}
      center
      distanceFactor={5}
      zIndexRange={[100, 0]}
      transform
      sprite
    >
      <div
        ref={tooltipRef}
        className={`relative -translate-y-[150%] translate-x-[80%] overflow-hidden text-white text-xs pointer-events-none border-[#00ffff] flex items-center justify-center
          transition-all ease-in-out duration-500
          ${expandWidth ? "w-64" : "w-4"} 
          ${expandHeight ? "h-32 opacity-100 " : "h-0 opacity-0"}
        `}
      >
        <div className="absolute w-0 h-full top-0 left-0 border-y-8 border-y-transparent border-r-8 border-[#00ffff]" />
        <div className="absolute w-0 h-full top-0 right-0 border-y-8 border-y-transparent border-l-8 border-[#00ffff]" />
        <div className="w-56 h-28 overflow-hidden mx-auto p-2">
              <p className="text-purple-300 w-full text-center font-bold text-3xl">
                {nodeData}
              </p>
              <hr />
              <p className="w-full text-center py-5">Tasks Left: {taskCount}</p>
        </div>
      </div>
    </Html>
  );
};

export default ToolTip;
