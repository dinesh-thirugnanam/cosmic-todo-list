import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Rocket({ isLaunched }) {
  const rocketRef = useRef(null);
  const fireRef = useRef(null);

  useEffect(() => {
    if (isLaunched) {
      gsap.to(fireRef.current, {
        scaleY: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(rocketRef.current, {
        y: -1200,
        rotate: -10,
        scale: 1.1,
        duration: 1.5,
        ease: "power2.in",
      });
    }
  }, [isLaunched]);

  return (
    <div
      ref={rocketRef}
      className="rocket absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 w-24 cursor-pointer"
    >
      <img src="/rock.png" alt="Rocket" className="w-full" />
      <div
        ref={fireRef}
        className="fire absolute w-5 h-12 bg-gradient-radial from-orange-500 to-red-600 top-full left-1/2 transform -translate-x-1/2 scale-y-0 rounded-full animate-flicker"
      ></div>
    </div>
  );
}
