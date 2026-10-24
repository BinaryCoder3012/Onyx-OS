"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { bandTexture, naturalBands } from "./bands";
import { LAYERS, stoneRig, useBands } from "./rig";

const W = 2.3;
const D = 1.5;
const H = 0.34;
const TOTAL = H * LAYERS;

/** Shared uniform so swapping the band texture updates every slab at once. There is one stone per page. */
const bandUniform: { value: THREE.Texture | null } = { value: null };

function useBandUniform() {
  const bands = useBands((s) => s.bands);
  useEffect(() => {
    const old = bandUniform.value;
    bandUniform.value = bandTexture(bands ?? naturalBands());
    old?.dispose();
  }, [bands]);
  useEffect(
    () => () => {
      bandUniform.value?.dispose();
      bandUniform.value = null;
    },
    [],
  );
  return bandUniform;
}

/**
 * Polished physical material whose colour comes from the band texture sampled in stone space,
 * so bands run continuously through every face of every slab, as in a real cut block.
 */
function useSlabMaterial(bandUniform: { value: THREE.Texture | null }, offsetY: number) {
  return useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.22,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uBands = bandUniform;
      shader.uniforms.uOffset = { value: offsetY };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uOffset;\nvarying vec3 vStone;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvStone = position + vec3(0.0, uOffset, 0.0);");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform sampler2D uBands;\nvarying vec3 vStone;")
        .replace(
          "#include <map_fragment>",
          `vec2 bandUv = vec2(vStone.x * 0.17 + vStone.z * 0.11, vStone.y / ${TOTAL.toFixed(3)} + 0.5);
           diffuseColor.rgb *= texture2D(uBands, bandUv).rgb;`,
        );
    };
    mat.customProgramCacheKey = () => "onyx-slab";
    return mat;
  }, [bandUniform, offsetY]);
}

function Slab({ index, bandUniform }: { index: number; bandUniform: { value: THREE.Texture | null } }) {
  const mid = (LAYERS - 1) / 2;
  const restY = (index - mid) * H;
  const material = useSlabMaterial(bandUniform, restY);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const { split, active } = stoneRig;
    const pull = active < 0 ? 0 : Math.max(0, 1 - Math.abs(index - active));
    const k = 1 - Math.exp(-dt * 7);
    m.position.y += ((index - mid) * (H + split * 0.3) - m.position.y) * k;
    m.position.z += (pull * 0.55 * split - m.position.z) * k;
    m.position.x += (pull * 0.35 * split - m.position.x) * k;
    m.rotation.y += ((index - mid) * 0.09 * split + pull * 0.18 * split - m.rotation.y) * k;
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <RoundedBox ref={ref} args={[W, H * 0.985, D]} radius={0.035} smoothness={4} position={[0, restY, 0]}>
      <primitive object={material} attach="material" />
    </RoundedBox>
  );
}

function Block() {
  const group = useRef<THREE.Group>(null);
  const bandUniform = useBandUniform();
  const pointer = useThree((s) => s.pointer);
  const viewportWidth = useThree((s) => s.viewport.width);
  const viewportHeight = useThree((s) => s.viewport.height);
  const wide = viewportWidth > 7;
  // Keep the whole stone (and its fanned-out layers) inside short viewports.
  const fit = Math.min(1, viewportHeight / 5.2);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 3);
    const t = state.clock.elapsedTime;
    const targetY = t * 0.11 + stoneRig.spin + pointer.x * 0.35;
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (0.32 + pointer.y * -0.12 - g.rotation.x) * k;
    g.position.x += ((wide ? 1.75 : 0) + stoneRig.offsetX - g.position.x) * k;
    g.position.y = (wide ? 0 : -0.9) + Math.sin(t * 0.6) * 0.04;
    const s = (wide ? 1 : 0.78) * fit * stoneRig.scale;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k);
  });

  return (
    <group ref={group} rotation={[0.32, 0.6, 0]}>
      {Array.from({ length: LAYERS }, (_, i) => (
        <Slab key={i} index={i} bandUniform={bandUniform} />
      ))}
    </group>
  );
}

export default function Stone({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 7], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff3e6" />
      <Block />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#f4ede2" position={[0, 5, -2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#f4ede2" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 0.6, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#e0703f" position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[5, 1.2, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#86a9bd" position={[0, -3, 4]} scale={2} />
      </Environment>
    </Canvas>
  );
}
