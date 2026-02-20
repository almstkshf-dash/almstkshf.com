"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GoldWave({ y, speed, depth }: { y: number; speed: number; depth: number }) {
    const ref = useRef<THREE.Line>(null);

    const geometry = useMemo(() => {
        const points = [];
        const segments = 200;

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * 30 - 15;
            points.push(new THREE.Vector3(x, y, depth));
        }

        return new THREE.BufferGeometry().setFromPoints(points);
    }, [y, depth]);

    useFrame((state) => {
        if (!ref.current) return;

        const time = state.clock.elapsedTime * speed;
        const positions = ref.current.geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const wave =
                Math.sin(x * 0.5 + time) * 0.15 +
                Math.sin(x * 0.2 + time * 0.5) * 0.1;

            positions.setY(i, y + wave);
        }

        positions.needsUpdate = true;
    });

    return (
        <primitive object={new THREE.Line(geometry)} ref={ref}>
            <lineBasicMaterial
                color="#BFA046"
                transparent
                opacity={0.08}
            />
        </primitive>
    );
}

function Scene() {
    return (
        <>
            {/* طبقات عمق مختلفة */}
            <GoldWave y={2} speed={0.6} depth={-6} />
            <GoldWave y={0.5} speed={0.4} depth={-5} />
            <GoldWave y={-1} speed={0.3} depth={-4} />
            <GoldWave y={-2.5} speed={0.2} depth={-3} />

            <ambientLight intensity={0.4} />
        </>
    );
}

export default function MediaWave() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                gl={{ alpha: true, antialias: true }}
            >
                <Scene />
            </Canvas>
        </div>
    );
}
