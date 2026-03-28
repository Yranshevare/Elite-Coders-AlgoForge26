import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const ParticleSphere = () => {
    const meshRef = useRef<THREE.Points>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    const particles = useMemo(() => {
        const count = 800;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2 + (Math.random() - 0.5) * 0.3;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }, []);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.08;
            meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;

            // Mouse parallax
            const handleMouseMove = (e: MouseEvent) => {
                mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 0.3;
                mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
            };
            window.addEventListener("mousemove", handleMouseMove, { once: true });

            meshRef.current.rotation.y += mouseRef.current.x * 0.02;
            meshRef.current.rotation.x += mouseRef.current.y * 0.02;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particles, 3]} count={particles.length / 3} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.025}
                color="#4f7cff"
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default ParticleSphere;