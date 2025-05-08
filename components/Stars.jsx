import { useEffect, useRef, useState, useMemo } from "react";

export default function EnhancedStars() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  // Configuration options
  const config = useMemo(
    () => ({
      numStars: 200,
      baseSizes: [0.5, 1, 1.5, 2],
      baseColors: ["#ffffff", "#ffffdd", "#aaaaff", "#ffdddd"],
      speedFactor: 0.5,
      interactionRadius: 100,
      maxSizeIncrease: 1.5, // Max size multiplier when mouse is very close
    }),
    []
  );

  // Generate stars with varied properties
  const generateStars = (width, height) => {
    return Array.from({ length: config.numStars }, () => {
      const sizeIndex = Math.floor(Math.random() * config.baseSizes.length);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: config.baseSizes[sizeIndex],
        originalSize: config.baseSizes[sizeIndex],
        color: config.baseColors[sizeIndex],
        speed: (0.2 + Math.random() * 0.6) * config.speedFactor,
      };
    });
  };

  // Stars data
  const stars = useRef([]);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.current.forEach((star) => {
      // Update position
      star.y -= star.speed;
      if (star.y < 0) {
        star.y = canvas.height;
        star.x = Math.random() * canvas.width;
      }

      // Calculate distance from mouse if active
      let size = star.originalSize;
      if (mouseRef.current.active) {
        const dx = star.x - mouseRef.current.x;
        const dy = star.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < config.interactionRadius) {
          const distFactor = 1 - distance / config.interactionRadius;
          size =
            star.originalSize *
            (1.2 + distFactor * (config.maxSizeIncrease - 1));
        }
      }

      // Draw star
      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Continue the animation
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });

      stars.current = generateStars(width, height);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };

      // Reset active flag after 2 seconds of no movement
      clearTimeout(mouseRef.current.timeout);
      mouseRef.current.timeout = setTimeout(() => {
        mouseRef.current.active = false;
      }, 2000);
    };

    // Initial setup
    handleResize();

    // Start animation after loading delay
    const timer = setTimeout(() => {
      setLoading(false);
      animationRef.current = requestAnimationFrame(animate);
    }, 1000);

    // Event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-2xl transition-opacity duration-500">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">✨</div>
            <div>Preparing Starfield...</div>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-0 bg-black ${
          loading ? "opacity-0" : "opacity-100 transition-opacity duration-1000"
        }`}
      />
    </div>
  );
}
