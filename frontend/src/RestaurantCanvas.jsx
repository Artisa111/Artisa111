import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import axios from 'axios';
import { Table } from './Table';

function Scene({ data, highlightedTables }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

      {data.map((table) => (
        <Table
          key={table.table_id}
          data={table}
          isHighlighted={highlightedTables.includes(table.table_id)}
        />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={30} blur={2} far={10} />
      <Environment preset="city" />
    </>
  );
}

export function RestaurantCanvas({ data, highlightedTables, cameraRef }) {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 10, 15], fov: 45 }}>
        <Scene data={data} highlightedTables={highlightedTables} />
        {/* We use orbit controls by default, but we'll hook into camera later for gestures */}
        <OrbitControls makeDefault ref={cameraRef} />
      </Canvas>
    </div>
  );
}
