import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const WireframeSphere = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
            meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.07) * 0.15;
        }
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.8, 2]} />
            <meshBasicMaterial color="#6b5ce7" wireframe transparent opacity={0.15} />
        </mesh>
    );
};

export default WireframeSphere;