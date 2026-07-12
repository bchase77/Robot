"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import type { Material, SceneObject, Tag } from "@/lib/types";

const MATERIAL_COLOR: Record<Material, string> = {
  drywall: "#d8d2c4",
  wood: "#8b5e34",
  glass: "#8ecae6",
  concrete: "#9a9a9a",
  metal: "#546e7a",
};

export interface SceneLink {
  a: Tag;
  b: Tag;
  connected: boolean;
}

export default function Scene3D({
  objects,
  tags,
  links,
}: {
  objects: SceneObject[];
  tags: Tag[];
  links: SceneLink[];
}) {
  return (
    <Canvas camera={{ position: [7, 6, 9], fov: 50 }} shadows>
      <color attach="background" args={["#111318"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1.1} castShadow />
      <Grid
        args={[20, 20]}
        cellColor="#3a3f4a"
        sectionColor="#5a6273"
        fadeDistance={30}
        position={[0, 0, 0]}
      />
      <OrbitControls makeDefault />

      {objects.map((obj) => (
        <mesh key={obj.id} position={obj.position} castShadow receiveShadow>
          <boxGeometry args={obj.size} />
          <meshStandardMaterial
            color={MATERIAL_COLOR[obj.material]}
            transparent={obj.material === "glass"}
            opacity={obj.material === "glass" ? 0.35 : 1}
            metalness={obj.material === "metal" ? 0.8 : 0.05}
            roughness={obj.material === "metal" ? 0.3 : 0.85}
          />
        </mesh>
      ))}

      {tags.map((tag) => (
        <mesh key={tag.id} position={tag.position} castShadow>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color="#fdd835" emissive="#fdd835" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {links.map((link, i) => (
        <Line
          key={i}
          points={[link.a.position, link.b.position]}
          color={link.connected ? "#43a047" : "#e53935"}
          lineWidth={2}
          dashed={!link.connected}
          dashSize={0.15}
          gapSize={0.1}
        />
      ))}
    </Canvas>
  );
}
