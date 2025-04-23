// components/Task2D.js
import { Html } from "@react-three/drei";

export default function Task2D({ position, index }) {
  return (
    <Html position={[...position, 0]} center>
      <div className="w-24 p-2 bg-white text-black border rounded shadow text-center cursor-pointer hover:scale-105 transition-transform">
        Task {index + 1}
      </div>
    </Html>
  );
}