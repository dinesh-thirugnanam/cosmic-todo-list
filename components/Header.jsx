import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function ({ isLaunched }) {
  const headingRef = useRef(null);

  useEffect(() => {
    if (isLaunched && headingRef.current) {
      gsap.to(headingRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power2.out",
      });
    }
  }, [isLaunched]);

  return (
    <div className="font-orbitron absolute top-24 w-full z-30" ref={headingRef}>
      <h1 className="text-5xl tracking-wider m-0 text-shadow-[0_0_10px_#00f0ff]">
        Cosmic To-Do List
      </h1>
      <p className="mt-2.5 text-xl text-[#aad8ff] text-shadow-[0_0_5px_#0077ff]">
        Prepare for Launch, Explore the Stars!
      </p>
    </div>
  );
}
