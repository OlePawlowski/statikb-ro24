import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";

// 🚁 Einfache Drohnensteuerung
function DroneControls() {
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const ref = useRef<THREE.PerspectiveCamera | null>(null);

  // Keyboard Input erfassen
  useEffect(() => {
    const down = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }));
    const up = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }));
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Bewegung updaten
  useFrame((_, delta) => {
    if (!ref.current) return;
    const speed = 5 * delta; // Bewegungsgeschwindigkeit
    const dir = new THREE.Vector3();

    if (keys["w"]) dir.z -= speed;
    if (keys["s"]) dir.z += speed;
    if (keys["a"]) dir.x -= speed;
    if (keys["d"]) dir.x += speed;
    if (keys["q"]) dir.y -= speed; // runter
    if (keys["e"]) dir.y += speed; // hoch

    ref.current.position.add(dir.applyQuaternion(ref.current.quaternion));
  });

  return (
    <>
      {/* Perspektivische Kamera als Drohne */}
      <perspectiveCamera ref={ref} fov={75} near={0.1} far={1000} position={[0, 2, 5]} />
      <OrbitControls enableDamping enablePan enableRotate enableZoom />
    </>
  );
}

// Dummy-Gebäude (ein Würfel)
function Building() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 1, 2]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>
  );
}

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <DroneControls />
        <Building />
        <gridHelper args={[20, 20]} />
      </Canvas>
    </div>
  );
}
