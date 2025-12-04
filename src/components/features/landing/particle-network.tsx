
'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/context/theme-context';
import { useIsMobile } from '@/hooks/use-mobile';

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

interface ParticleNetworkProps {
  className?: string;
  restrictedAreas?: Rect[];
}

export function ParticleNetwork({ className, restrictedAreas = [] }: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[];
    let animationFrameId: number;

    const isDarkTheme = ['dark', 'midnight', 'infrared', 'forest'].includes(theme);

    const options = {
        particleColor: 'rgba(255, 255, 255, 0.5)',
        lineColor: 'rgba(255, 255, 255, 0.1)',
        particleAmount: isMobile ? 25 : 50,
        defaultSpeed: 0.3,
        variantSpeed: 0.5,
        defaultRadius: 2,
        variantRadius: 1,
        linkRadius: 200,
    };

    const mousePosition = {
        x: -9999,
        y: -9999,
    };
    
    const handleMouseMove = (event: MouseEvent) => {
        mousePosition.x = event.pageX;
        mousePosition.y = event.pageY;
    };
    
    document.addEventListener('mousemove', handleMouseMove);

    document.addEventListener('mouseleave', () => {
        mousePosition.x = -9999;
        mousePosition.y = -9999;
    });

    class Particle {
      x: number;
      y: number;
      speed: number;
      directionAngle: number;
      color: string;
      radius: number;
      vector: { x: number; y: number };

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.speed = options.defaultSpeed + Math.random() * options.variantSpeed;
        this.directionAngle = Math.floor(Math.random() * 360);
        this.color = options.particleColor;
        this.radius = options.defaultRadius + Math.random() * options.variantRadius;
        this.vector = {
          x: Math.cos(this.directionAngle) * this.speed,
          y: Math.sin(this.directionAngle) * this.speed,
        };
      }

      update() {
        this.border();
        this.avoidRestrictedAreas();
        this.x += this.vector.x;
        this.y += this.vector.y;
      }

      border() {
        if (this.x >= canvas!.width || this.x <= 0) {
          this.vector.x *= -1;
        }
        if (this.y >= canvas!.height || this.y <= 0) {
          this.vector.y *= -1;
        }
        if (this.x > canvas!.width) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = canvas!.height;
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
      }

      avoidRestrictedAreas() {
        restrictedAreas.forEach(area => {
            const isInsideX = this.x > area.left && this.x < area.right;
            const isInsideY = this.y > area.top && this.y < area.bottom;

            if (isInsideX && isInsideY) {
                // Determine which edge is closer to bounce off
                const fromLeft = this.x - area.left;
                const fromRight = area.right - this.x;
                const fromTop = this.y - area.top;
                const fromBottom = area.bottom - this.y;

                const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);

                if (min === fromLeft || min === fromRight) {
                    this.vector.x *= -1;
                }
                if (min === fromTop || min === fromBottom) {
                    this.vector.y *= -1;
                }
            }
        });
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.closePath();
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }
    }

    function linkParticles() {
      let allPoints = [...particles, {x: mousePosition.x, y: mousePosition.y}];

      for (let i = 0; i < allPoints.length; i++) {
        for (let j = i + 1; j < allPoints.length; j++) {
            const distance = getDistance(allPoints[i], allPoints[j]);
            const opacity = 1 - distance / options.linkRadius;
            if (opacity > 0) {
                ctx!.lineWidth = 0.5;
                ctx!.strokeStyle = options.lineColor.replace(/,\s*\d+\.\d+\)/, `, ${opacity})`);
                ctx!.beginPath();
                ctx!.moveTo(allPoints[i].x, allPoints[i].y);
                ctx!.lineTo(allPoints[j].x, allPoints[j].y);
                ctx!.closePath();
                ctx!.stroke();
            }
        }
      }
    }
    
    function getDistance(point1: {x: number, y: number}, point2: {x: number, y: number}) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }


    function setup() {
        particles = [];
        resizeCanvas();
        for (let i = 0; i < options.particleAmount; i++) {
            particles.push(new Particle());
        }
        loop();
    }
    
    function loop() {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        linkParticles();
        
        animationFrameId = requestAnimationFrame(loop);
    }
    
    function resizeCanvas() {
        canvas!.width = window.innerWidth;
        canvas!.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    setup();

    return () => {
        window.removeEventListener('resize', resizeCanvas);
        document.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
    };

  }, [theme, restrictedAreas, isMobile]); // Rerun effect if theme or restrictedAreas change

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
