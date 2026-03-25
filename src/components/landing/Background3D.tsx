"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

function AbstractShape() {
    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[2, 64, 64]} />
                <MeshDistortMaterial
                    color="#0d3d23"
                    attach="material"
                    distort={0.4}
                    speed={1.5}
                    roughness={0.2}
                    metalness={0.9}
                />
            </mesh>
            <mesh position={[2.5, -1, -2]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#17cf79" wireframe />
            </mesh>
        </Float>
    );
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 z-0 bg-black pointer-events-none">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <Suspense fallback={null}>
                    <AbstractShape />
                    <Environment preset="city" />
                    <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                </Suspense>
            </Canvas>
        </div>
    );
}
