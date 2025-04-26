// components/NodeLight.tsx
import React, { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as THREE from 'three';


const NodeLight= ({ hasTasks, hovered, color }) => {
  const lightRef = useRef(null);
  const pulseTl = useRef(gsap.timeline({ paused: true }));
  const hoverTl = useRef(gsap.timeline({ paused: true }));

  useGSAP(() => {
    if (lightRef.current) {
      pulseTl.current = gsap
        .timeline({ repeat: -1, yoyo: true, ease: 'sine.inOut' })
        .to(lightRef.current, {
          intensity: (hasTasks ? 1.0 : 0.5) * 1.3,
          duration: () => 1 + Math.random() * 0.2,
          ease: 'sine.inOut',
        });

      hoverTl.current = gsap
        .timeline({ yoyo: true })
        .to(
          lightRef.current,
          {
            intensity: 3.0,
            duration: 0.3,
            ease: 'power2.inOut',
          },
          0
        );

      pulseTl.current.play();
    }
  }, [hasTasks]);

  useEffect(() => {
    if (hovered) {
      pulseTl.current.pause();
      hoverTl.current.play();
    } else {
      hoverTl.current.reverse();
      pulseTl.current.resume();
    }
  }, [hovered]);

  return (
    <pointLight
      ref={lightRef}
      color={hovered ? 'orange' : color}
      intensity={1.0}
      distance={20.0}
      decay={1.5}
      castShadow
      shadow-mapSize-width={512}
      shadow-mapSize-height={512}
      shadow-radius={8}
    />
  );
};

export default NodeLight;