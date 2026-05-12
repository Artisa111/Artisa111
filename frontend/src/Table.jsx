import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function Table({ data, isHighlighted }) {
  const meshRef = useRef();

  // Base properties based on data
  const height = data.revenue_today_ils / 100 + 0.5; // Scale height by revenue
  const isOccupied = data.is_occupied;

  // Colors
  const baseColor = isOccupied ? '#ff4d4d' : '#4dff4d'; // Red if occupied, Green if free
  const highlightColor = '#ffff00'; // Yellow when highlighted by AI

  const finalColor = isHighlighted ? highlightColor : baseColor;

  useFrame((state) => {
      if (isHighlighted && meshRef.current) {
          // Add a subtle pulsing effect to highlighted tables
          const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
          meshRef.current.scale.set(scale, 1, scale);
      } else if (meshRef.current) {
          meshRef.current.scale.set(1, 1, 1);
      }
  });

  return (
    <group position={[data.pos_x, height / 2, data.pos_z]}>
      {/* Table Body */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[1, 1, height, 32]} />
        <meshStandardMaterial color={finalColor} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Table Label */}
      <Text
        position={[0, height / 2 + 0.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.table_id}
      </Text>

      {/* Revenue Label */}
      <Text
        position={[0, height / 2 + 0.1, 0]}
        fontSize={0.25}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
      >
        {`${data.revenue_today_ils} ILS`}
      </Text>
    </group>
  );
}
