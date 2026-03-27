"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

function ParticleField(props: any) {
  const ref = useRef<any>();
  
  // Generate random points in a sphere
  const sphere = useMemo(() => {
    return random.inSphere(new Float32Array(3000), { radius: 1.5 }) as Float32Array;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#4fa1f7"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function DataCubes() {
    const group = useRef<any>();
    
    useFrame((state) => {
        if(group.current) {
            const t = state.clock.getElapsedTime();
            group.current.children.forEach((child: any, i: number) => {
                child.position.y = Math.sin(t + i * 100) * 0.2;
                child.rotation.x = t * 0.1 + i;
                child.rotation.z = t * 0.05 + i;
            });
        }
    });

    return (
        <group ref={group}>
            {[...Array(5)].map((_, i) => (
                <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1}>
                    <mesh position={[Math.random() * 4 - 2, Math.random() * 2 - 1, Math.random() * 2 - 1]}>
                        <boxGeometry args={[0.2, 0.2, 0.2]} />
                        <meshStandardMaterial color={i % 2 === 0 ? "#ff4d4d" : "#4e8df5"} wireframe />
                    </mesh>
                </Float>
            ))}
        </group>
    )
}

const Hero3DScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <ParticleField />
        <DataCubes />
      </Canvas>
    </div>
  );
};

export default Hero3DScene;
