"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 1500;
const EMOJIS = ["📈", "🌍", "⚖️", "💼", "📰", "🤖", "⚡", "🌟", "📊", "📡"];

function Particles() {
    const ref = useRef<THREE.Points>(null);

    const [positions, hiddenColors] = useMemo(() => {
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const color = new THREE.Color();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 30; // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 15; // z

            // Gold gradient colors
            if (Math.random() > 0.5) {
                color.setHex(0xFFD700); // Gold
            } else {
                color.setHex(0xB8860B); // Dark Gold
            }
            color.toArray(colors, i * 3);
        }
        return [pos, colors];
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 50;
            ref.current.rotation.y -= delta / 40;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={PARTICLE_COUNT}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={PARTICLE_COUNT}
                        array={hiddenColors}
                        itemSize={3}
                        args={[hiddenColors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.05}
                    vertexColors
                    transparent
                    opacity={0.6}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
}

function FloatingEmoji({ position, emoji, delay }: { position: [number, number, number], emoji: string, delay: number }) {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            // Complex floating motion
            ref.current.position.y += Math.sin(state.clock.elapsedTime + delay) * 0.001;
            ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={ref} position={new THREE.Vector3(...position)}>
                <Text
                    font="/fonts/Inter.ttf"
                    fontSize={0.8}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0.9}
                >
                    {emoji}
                </Text>
            </group>
        </Float>
    )
}

function Scene() {
    const emojiPositions = useMemo(() => {
        return EMOJIS.map(() => [
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 5
        ] as [number, number, number]);
    }, []);

    return (
        <group>
            <Particles />
            {emojiPositions.map((pos, i) => (
                <FloatingEmoji key={i} position={pos} emoji={EMOJIS[i]} delay={i} />
            ))}
            {/* <Environment preset="city" /> replaced with static lights to avoid HDR fetch errors */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={1} color="#FFD700" />
        </group>
    )
}

export default function MediaWave() {
    return (
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60 pointer-events-none select-none">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: false,
                }}
                onCreated={({ gl }) => {
                    gl.domElement.addEventListener("webglcontextlost", (event) => {
                        event.preventDefault();
                        console.warn("⚠️ WebGL Context Lost in MediaWave. Scene will be restored by the browser if possible.");
                    }, false);
                    gl.domElement.addEventListener("webglcontextrestored", () => {
                        console.log("✅ WebGL Context Restored in MediaWave. Scene reinitialized.");
                    }, false);
                }}
            >
                <Scene />
            </Canvas>
        </div>
    );
}
