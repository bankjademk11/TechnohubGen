import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
  RoundedBox,
  Sparkles,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, N8AO } from "@react-three/postprocessing";
import * as THREE from "three";
import { Zap, X, Radio } from "lucide-react";

/* -----------------------------------------------------------------------
   NEW DEPENDENCY REQUIRED
   npm install @react-three/postprocessing
   (drei, fiber, three, lucide-react were already present)
----------------------------------------------------------------------- */

function useDesignFonts() {
  useEffect(() => {
    if (document.getElementById("donate-robot-fonts")) return;
    const link = document.createElement("link");
    link.id = "donate-robot-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Kanit:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

const T = {
  navy: "#0B1120",
  navySoft: "#111C34",
  porcelain: "#F4F7FA",
  cyan: "#22D3EE",
  cyanDeep: "#0891B2",
  amber: "#F5A524",
  amberDeep: "#C2790A",
  slate: "#64748B",
};

/* -----------------------------------------------------------------------
   ROBOT MODEL — same silhouette/rig as before (head, ears, visor, body,
   arms), but every material upgraded to physically-based, multi-layer
   surfaces so it reads like a rendered hero asset instead of a flat-shaded
   mascot: satin-coated shell with real clearcoat, glass-like visor with
   transmission, metal trims, and emissive cores tuned to bloom cleanly.
----------------------------------------------------------------------- */
function CuteRobotModel({
  hovered,
  setHovered,
  reducedMotion,
}: {
  hovered: boolean;
  setHovered: (h: boolean) => void;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const antennaLightRef = useRef<THREE.Mesh>(null);
  const eyeLRef = useRef<THREE.Mesh>(null);
  const eyeRRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);

  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const blinkAt = useRef(2 + Math.random() * 3);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const speed = reducedMotion ? 0.15 : 1;

    if (groupRef.current) {
      const targetY = hovered ? Math.sin(t * 5) * 0.2 : Math.sin(t * speed) * 0.1 + pointer.current.x * 0.15;
      const targetX = hovered ? -0.05 : pointer.current.y * -0.08;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.06);
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (hovered) {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, Math.sin(t * 10) * 0.2 - 0.2, 0.1);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -Math.sin(t * 10) * 0.2 + 0.2, 0.1);
      } else {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.1, 0.1);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.1, 0.1);
      }
    }

    if (antennaLightRef.current) {
      const mat = antennaLightRef.current.material as THREE.MeshStandardMaterial;
      const pulseSpeed = hovered ? 8 : 2;
      mat.emissiveIntensity = 2.2 + Math.sin(t * pulseSpeed) * (hovered ? 1.1 : 0.5);
    }

    if (chestRef.current) {
      const mat = chestRef.current.material as THREE.MeshStandardMaterial;
      const targetColor = new THREE.Color(hovered ? T.amber : T.cyan);
      mat.color.lerp(targetColor, 0.08);
      mat.emissive.lerp(targetColor, 0.08);
      mat.emissiveIntensity = 1.6 + Math.sin(t * (hovered ? 6 : 2)) * 0.4;
    }

    if (eyeLRef.current && eyeRRef.current && !reducedMotion) {
      blinkAt.current -= delta;
      const inBlink = blinkAt.current < 0.1 && blinkAt.current > -0.1;
      const scaleY = inBlink ? 0.15 : 1;
      eyeLRef.current.scale.y = THREE.MathUtils.lerp(eyeLRef.current.scale.y, scaleY, 0.6);
      eyeRRef.current.scale.y = THREE.MathUtils.lerp(eyeRRef.current.scale.y, scaleY, 0.6);
      if (blinkAt.current < -0.1) blinkAt.current = 2.5 + Math.random() * 3;
    }
  });

  const cyanGlow = T.cyan;

  // Satin-coated shell: soft plastic base with a thin glossy clearcoat,
  // the combination that reads as "premium product" rather than flat toy plastic.
  const shellMat = (
    <meshPhysicalMaterial
      color={T.porcelain}
      roughness={0.35}
      metalness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.15}
      envMapIntensity={1.1}
    />
  );

  const trimMat = <meshStandardMaterial color="#B9C4D0" roughness={0.3} metalness={0.85} envMapIntensity={1.4} />;

  return (
    <group
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      scale={hovered ? 1.05 : 1}
      position={[0, -0.1, 0]}
    >
      <Float speed={reducedMotion ? 0.5 : hovered ? 4 : 2} rotationIntensity={0.05} floatIntensity={0.3}>
        <group ref={groupRef}>
          {/* --- HEAD --- */}
          <group position={[0, 0.6, 0]}>
            <RoundedBox args={[1.2, 0.8, 0.7]} radius={0.32} smoothness={8}>
              {shellMat}
            </RoundedBox>

            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.22, 12]} />
              {trimMat}
            </mesh>
            <mesh ref={antennaLightRef} position={[0, 0.63, 0]}>
              <sphereGeometry args={[0.07, 24, 24]} />
              <meshStandardMaterial color={cyanGlow} emissive={cyanGlow} emissiveIntensity={2.2} toneMapped={false} />
            </mesh>

            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 24]} />
              {shellMat}
            </mesh>

            {/* Ears */}
            <mesh position={[-0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 24]} />
              {shellMat}
            </mesh>
            <mesh position={[-0.67, 0, 0]}>
              <sphereGeometry args={[0.15, 24, 24]} />
              {shellMat}
            </mesh>
            <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.1, 24]} />
              {shellMat}
            </mesh>
            <mesh position={[0.67, 0, 0]}>
              <sphereGeometry args={[0.15, 24, 24]} />
              {shellMat}
            </mesh>

            {/* Visor — real glass, transmissive + a hint of tint, catches the
                environment instead of sitting as a flat dark rectangle */}
            <RoundedBox args={[0.95, 0.55, 0.1]} position={[0, 0, 0.36]} radius={0.15} smoothness={8}>
              <meshPhysicalMaterial
                color={T.navy}
                roughness={0.08}
                metalness={0.2}
                transmission={0.55}
                thickness={0.4}
                ior={1.4}
                clearcoat={1}
                clearcoatRoughness={0.05}
                envMapIntensity={1.6}
              />
            </RoundedBox>

            <group position={[0, 0, 0.42]}>
              <mesh ref={eyeLRef} position={[-0.2, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
                <torusGeometry args={[0.1, 0.04, 16, 32, Math.PI]} />
                <meshStandardMaterial color={cyanGlow} emissive={cyanGlow} emissiveIntensity={hovered ? 2.6 : 1.4} toneMapped={false} />
              </mesh>
              <mesh ref={eyeRRef} position={[0.2, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
                <torusGeometry args={[0.1, 0.04, 16, 32, Math.PI]} />
                <meshStandardMaterial color={cyanGlow} emissive={cyanGlow} emissiveIntensity={hovered ? 2.6 : 1.4} toneMapped={false} />
              </mesh>
              <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]}>
                <torusGeometry args={[0.06, 0.03, 16, 32, Math.PI]} />
                <meshStandardMaterial color={cyanGlow} emissive={cyanGlow} emissiveIntensity={hovered ? 2.6 : 1.4} toneMapped={false} />
              </mesh>
            </group>
          </group>

          {/* --- BODY --- */}
          <group position={[0, -0.1, 0]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.2, 24]} />
              {trimMat}
            </mesh>

            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.45, 0.3, 16, 32]} />
              {shellMat}
            </mesh>

            <mesh position={[0, -0.3, 0]}>
              <torusGeometry args={[0.45, 0.02, 16, 64]} />
              <meshStandardMaterial color={cyanGlow} emissive={cyanGlow} emissiveIntensity={1.4} toneMapped={false} />
            </mesh>

            <mesh ref={chestRef} position={[0, -0.35, 0.43]}>
              <octahedronGeometry args={[0.11, 0]} />
              <meshStandardMaterial color={cyanGlow} emissive={cyanGlow} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
          </group>

          {/* --- ARMS --- */}
          <mesh ref={leftArmRef} position={[-0.55, 0.0, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.12, 0.4, 16, 16]} />
            {shellMat}
          </mesh>
          <mesh ref={rightArmRef} position={[0.55, 0.0, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.12, 0.4, 16, 16]} />
            {shellMat}
          </mesh>
        </group>
      </Float>

      {!reducedMotion && (
        <Sparkles
          count={hovered ? 28 : 12}
          scale={[2.2, 2.2, 2.2]}
          size={hovered ? 2.4 : 1.4}
          speed={hovered ? 0.6 : 0.25}
          color={hovered ? T.amber : T.cyan}
          opacity={0.7}
        />
      )}
    </group>
  );
}

/* -----------------------------------------------------------------------
   SCENE — key/fill/rim lighting + a tiny custom environment (built from
   Lightformers rather than an external HDRI) so reflections look like a
   product render without pulling extra network assets.
----------------------------------------------------------------------- */
function RobotScene({
  hovered,
  setHovered,
  reducedMotion,
}: {
  hovered: boolean;
  setHovered: (h: boolean) => void;
  reducedMotion: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.35} />
      {/* key */}
      <spotLight position={[4, 6, 5]} angle={0.35} penumbra={1} intensity={2.2} castShadow />
      {/* fill */}
      <pointLight position={[-4, 0, 3]} intensity={0.4} color={T.cyan} />
      {/* rim, from behind, separates the robot from the background */}
      <pointLight position={[0, 2, -4]} intensity={1.2} color={T.amber} />

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} color={T.cyan} position={[-3, 2, 2]} scale={[2, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color={T.amber} position={[3, -1, 2]} scale={[2, 3, 1]} />
        <Lightformer form="ring" intensity={0.6} color={T.porcelain} position={[0, 3, -3]} scale={4} />
      </Environment>

      <CuteRobotModel hovered={hovered} setHovered={setHovered} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -1.0, 0]} opacity={0.4} scale={4} blur={2.2} far={2} color={T.navy} />

      {!reducedMotion && (
        <EffectComposer enableNormalPass>
          <N8AO intensity={1.2} aoRadius={0.6} distanceFalloff={1} />
          <Bloom mipmapBlur luminanceThreshold={0.4} luminanceSmoothing={0.15} intensity={hovered ? 1.1 : 0.7} radius={0.6} />
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
      )}
    </>
  );
}

/* -----------------------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------------------- */
export function DonateRobot() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useDesignFonts();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) {
      setScanned(false);
      return;
    }
    const timer = setTimeout(() => setScanned(true), 900);
    return () => clearTimeout(timer);
  }, [open]);

  const fontVars = useMemo(
    () =>
      ({
        "--font-display": "'Fredoka', system-ui, sans-serif",
        "--font-body": "'Kanit', 'Noto Sans Thai', system-ui, sans-serif",
        "--font-mono": "'JetBrains Mono', ui-monospace, monospace",
      }) as React.CSSProperties,
    []
  );

  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  };

  return (
    <div style={fontVars}>
      {/* Floating robot */}
      <div
        className="fixed bottom-4 right-4 z-40 w-40 h-40 md:w-48 md:h-48 cursor-pointer drop-shadow-2xl transition-transform duration-300 hover:scale-110"
        onClick={() => setOpen(true)}
      >
        <div
          className="absolute -top-5 -left-10 backdrop-blur-md text-xs px-4 py-2.5 rounded-2xl shadow-xl pointer-events-none transition-all duration-300"
          style={{
            background: "rgba(11,17,32,0.9)",
            border: `1px solid ${T.cyan}55`,
            color: T.porcelain,
            fontFamily: "var(--font-body)",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(-6px) scale(1)" : "translateY(0) scale(0.95)",
          }}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <Zap size={14} style={{ color: T.amber }} className={reducedMotion ? "" : "animate-pulse"} />
            <span style={{ fontSize: "13px" }}>Buy me a coffee! ☕</span>
          </div>
          <div
            className="absolute -bottom-1.5 right-10 w-3 h-3 rotate-45"
            style={{ background: "rgba(11,17,32,0.9)", borderBottom: `1px solid ${T.cyan}55`, borderRight: `1px solid ${T.cyan}55` }}
          />
        </div>

        <Canvas
          camera={{ position: [0, 0.5, 4.5], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
          dpr={[1, 2]}
          shadows
        >
          <RobotScene hovered={hovered} setHovered={setHovered} reducedMotion={reducedMotion} />
        </Canvas>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ background: "rgba(11,17,32,0.6)", backdropFilter: "blur(6px)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Donate a coffee"
        >
          <div
            onMouseMove={onCardMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="relative rounded-[28px] shadow-2xl p-7 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300"
            style={{
              background: `linear-gradient(165deg, ${T.navy} 0%, ${T.navySoft} 100%)`,
              border: `1px solid ${T.cyan}33`,
              fontFamily: "var(--font-body)",
              transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 0.15s ease-out",
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${T.cyan}11`,
            }}
          >
            {/* subtle noise grain for a manufactured, non-flat surface */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            {[
              { top: 14, left: 14, borderTop: true, borderLeft: true },
              { top: 14, right: 14, borderTop: true, borderRight: true },
              { bottom: 14, left: 14, borderBottom: true, borderLeft: true },
              { bottom: 14, right: 14, borderBottom: true, borderRight: true },
            ].map((pos, i) => (
              <span
                key={i}
                className="absolute w-4 h-4"
                style={{
                  top: pos.top,
                  bottom: pos.bottom,
                  left: pos.left,
                  right: pos.right,
                  borderColor: `${T.cyan}88`,
                  borderTopWidth: pos.borderTop ? 2 : 0,
                  borderBottomWidth: pos.borderBottom ? 2 : 0,
                  borderLeftWidth: pos.borderLeft ? 2 : 0,
                  borderRightWidth: pos.borderRight ? 2 : 0,
                  borderStyle: "solid",
                }}
              />
            ))}

            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors z-10"
              style={{ background: "rgba(255,255,255,0.06)", color: T.slate }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div
              className="flex items-center gap-1.5 mb-5 mt-1 relative z-10"
              style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", color: T.cyan }}
            >
              <Radio size={12} className={reducedMotion ? "" : "animate-pulse"} />
              <span>SYSTEM · COFFEE-CORE UPLINK</span>
            </div>

            <div className="text-left mb-6 relative z-10">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "26px",
                  color: T.porcelain,
                  marginBottom: "6px",
                }}
              >
                Support the Creator <span style={{ color: T.amber }}>☕</span>
              </h2>
              <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: 1.6 }}>
                If you like my work, scan the QR code to buy me a coffee! (´▽`ʃ♡ƪ)
              </p>
            </div>

            <div
              className="relative rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-6 z-10"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.cyan}44` }}
            >
              <div className="relative">
                <img
                  src="/QRDonate.jpg"
                  alt="Donation QR Code"
                  className="w-full max-w-[220px] rounded-xl"
                  style={{ filter: scanned ? "none" : "brightness(0.5) saturate(0.3)", transition: "filter 0.6s ease" }}
                />
                {!reducedMotion && !scanned && (
                  <div
                    className="absolute left-0 right-0 h-8 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, transparent, ${T.cyan}aa, transparent)`,
                      animation: "donate-scan 0.9s ease-in-out",
                    }}
                  />
                )}
                {!reducedMotion && (
                  <div
                    className="absolute -inset-1 rounded-xl pointer-events-none"
                    style={{ boxShadow: `0 0 24px ${scanned ? T.amber : T.cyan}55` }}
                  />
                )}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="relative w-full py-3.5 px-4 rounded-2xl font-semibold text-base transition-all transform active:scale-95 z-10"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${T.amber}, ${T.amberDeep})`,
                color: T.navy,
                boxShadow: `0 4px 20px ${T.amber}44`,
              }}
            >
              Thank you! ✨
            </button>
          </div>

          <style>{`
            @keyframes donate-scan {
              0% { top: 0%; opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}