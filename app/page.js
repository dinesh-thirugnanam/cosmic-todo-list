"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import Header from "@/components/Header";
import Rocket from "@/components/Rocket";
import Stars from "@/components/Stars";
import { signIn } from "next-auth/react";

export default function Home() {
  const [isLaunched, setIsLaunched] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const starsRef = useRef(null);
  const launchBtnRef = useRef(null);
  const signInBtnRef = useRef(null);

  const handleLaunch = () => {
    // Fade out the launch button
    gsap.to(launchBtnRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        setIsLaunched(true);
        setShowSignIn(true); // Show sign-in button immediately after launch
      },
    });
  };

  // Use useEffect to handle the sign-in button animation when it appears
  useEffect(() => {
    // Check if the sign-in button is showing and the ref exists
    if (showSignIn && signInBtnRef.current) {
      console.log("Animating sign-in button"); // Debug log

      // First position the button at the bottom
      gsap.set(signInBtnRef.current, {
        y: window.innerHeight,
        opacity: 0,
        display: "block", // Ensure it's visible
      });

      // Then animate it
      gsap.to(signInBtnRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out",
      });
    }
  }, [showSignIn]);

  const handleMeteorClick = (e) => {
    if (e.target.id === "launchBtn" || e.target.id === "googleSignInBtn")
      return;
    const rect = starsRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createMeteor(x, y);
  };

  const createMeteor = (x, y) => {
    const meteor = document.createElement("div");
    meteor.className =
      "absolute w-4 h-1.5 rounded-full opacity-90 transform rotate-45 z-10";
    const colors = ["#ffffff", "#f9a602", "#ff4d4d", "#00c3ff", "#8aff00"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    meteor.style.background = `linear-gradient(90deg, ${color}, transparent)`;
    meteor.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
    meteor.style.left = `${x}px`;
    meteor.style.top = `${y}px`;
    starsRef.current.appendChild(meteor);

    const randomX = (Math.random() - 0.5) * 300;
    const randomY = 600 + Math.random() * 300;
    const randomRotation = 30 + Math.random() * 60;

    gsap.to(meteor, {
      x: randomX,
      y: randomY,
      rotation: randomRotation,
      opacity: 0,
      duration: 3,
      ease: "power2.out",
      onComplete: () => meteor.remove(),
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const rect = starsRef.current.getBoundingClientRect();
      const randomX = Math.random() * rect.width;
      const randomY = Math.random() * (rect.height / 2);
      createMeteor(randomX, randomY);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="min-h-screen bg-gradient-radial from-[#0d0d0d] to-black overflow-hidden font-orbitron text-white text-center relative"
        onClick={handleMeteorClick}
        ref={starsRef}
      >
        <Header isLaunched={isLaunched} />
        <Stars />
        <Rocket isLaunched={isLaunched} />
        {/* Launch button - always render but hide after launch */}
        <button
          id="launchBtn"
          ref={launchBtnRef}
          className={`absolute bottom-5 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-[#1e90ff] to-[#00bfff] rounded-full text-lg font-bold text-white cursor-pointer z-20 transition-transform duration-300 hover:bg-gradient-to-r hover:from-[#00bfff] hover:to-[#1e90ff] hover:scale-105 ${
            isLaunched ? "opacity-0 pointer-events-none" : ""
          }`}
          onClick={handleLaunch}
        >
          Launch 🚀
        </button>

        {/* Sign-in button - always render but initially hidden */}
        <div
          ref={signInBtnRef}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-6 bg-gradient-to-r from-[#1e90ff] to-[#00bfff] rounded-sm z-20 ${
            showSignIn ? "" : "opacity-0 hidden"
          }`}
        >
          <button
            id="googleSignInBtn"
            className="px-4 py-2 bg-white text-black rounded-md font-semibold hover:bg-gray-200 transition-colors"
            onClick={() => signIn("google", { callbackUrl: "/home" })}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  );
}
