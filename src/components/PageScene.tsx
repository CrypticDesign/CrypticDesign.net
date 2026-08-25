"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import {
  PAGE_SCENES,
  classifyPageScenePerformance,
  resolvePageSceneQuality,
  shouldDowngradePageSceneQuality,
  type PageSceneId,
  type PageSceneQuality,
} from "@/lib/page-scene";

type NavigatorWithCapabilities = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

let cachedWebGLSupport: boolean | undefined;

function supportsWebGL(): boolean {
  if (cachedWebGLSupport !== undefined) return cachedWebGLSupport;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cachedWebGLSupport = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return cachedWebGLSupport;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}

export default function PageScene({
  sceneId,
  fallbackPoster,
  quality = "auto",
  interaction = "ambient",
}: {
  sceneId: PageSceneId;
  fallbackPoster: string;
  quality?: PageSceneQuality;
  interaction?: "ambient" | "none";
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [presentation, setPresentation] = useState<"poster" | "webgl">("poster");

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navigatorWithCapabilities = navigator as NavigatorWithCapabilities;
    const resolvedQuality = resolvePageSceneQuality({
      requested: quality,
      reducedMotion: motionQuery.matches,
      webglSupported: supportsWebGL(),
      viewportWidth: window.innerWidth,
      deviceMemory: navigatorWithCapabilities.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      saveData: navigatorWithCapabilities.connection?.saveData,
    });

    host.dataset.quality = resolvedQuality;
    if (resolvedQuality === "low") {
      host.dataset.lifecycle = "static";
      host.dataset.renderer = "inactive";
      return;
    }

    const definition = PAGE_SCENES[sceneId];
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: resolvedQuality === "high",
        powerPreference: "high-performance",
      });
    } catch {
      host.dataset.state = "fallback";
      host.dataset.lifecycle = "static";
      host.dataset.renderer = "inactive";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, resolvedQuality === "high" ? 1.75 : 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(definition.background, 0);
    host.dataset.renderer = "active";
    host.dataset.performance = "measuring";
    host.dataset.assets = definition.assets.length ? "loading" : "none";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0.25, 8.5);

    const system = new THREE.Group();
    scene.add(system);
    const assetLayer = new THREE.Group();
    scene.add(assetLayer);

    const coreMaterial = new THREE.MeshStandardMaterial({
      color: definition.primary,
      emissive: definition.primary,
      emissiveIntensity: 0.24,
      metalness: 0.75,
      roughness: 0.2,
      wireframe: true,
    });
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, resolvedQuality === "high" ? 3 : 1),
      coreMaterial,
    );
    system.add(core);

    for (const [index, scale] of [2.2, 2.9, 3.65].entries()) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(scale, 0.018 + index * 0.006, 6, resolvedQuality === "high" ? 160 : 80),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? definition.secondary : definition.primary,
          transparent: true,
          opacity: index === 1 ? 0.48 : 0.7,
        }),
      );
      ring.rotation.set(Math.PI * (0.18 + index * 0.13), Math.PI * (0.08 + index * 0.19), index * 0.42);
      system.add(ring);
    }

    const count = definition.particleCount[resolvedQuality];
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 2.8 + ((index * 37) % 100) / 18;
      const angle = index * 2.399963;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle * 0.7) * radius * 0.52;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: definition.primary,
      size: resolvedQuality === "high" ? 0.028 : 0.02,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    scene.add(new THREE.HemisphereLight(0x9adfff, 0x02050a, 1.4));
    const key = new THREE.PointLight(definition.primary, resolvedQuality === "high" ? 18 : 10, 22);
    key.position.set(3, 4, 5);
    scene.add(key);

    let disposed = false;
    const loadedTextures = new Set<THREE.Texture>();
    const textureLoader = new THREE.TextureLoader();
    const assetLoads = definition.assets.map((asset) => new Promise<void>((resolve, reject) => {
      textureLoader.load(asset.src, (texture) => {
        if (disposed) {
          texture.dispose();
          resolve();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        loadedTextures.add(texture);
        const image = texture.image as { width?: number; height?: number } | undefined;
        const aspect = image?.width && image?.height ? image.width / image.height : 16 / 9;
        const backdrop = new THREE.Mesh(
          new THREE.PlaneGeometry(14, 14 / aspect),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: asset.opacity,
            depthWrite: false,
            toneMapped: false,
          }),
        );
        backdrop.name = asset.id;
        backdrop.position.set(1.8, 0, -4.5);
        assetLayer.add(backdrop);
        resolve();
      }, undefined, reject);
    }));
    void Promise.allSettled(assetLoads).then((results) => {
      if (disposed) return;
      const readyCount = results.filter((result) => result.status === "fulfilled").length;
      host.dataset.assets = readyCount === definition.assets.length ? "ready" : readyCount ? "partial" : "fallback";
    });

    let frame = 0;
    let visible = true;
    let contextAvailable = true;
    let pointerX = 0;
    let pointerY = 0;
    let activeQuality = resolvedQuality;
    let sampleStartedAt = performance.now();
    let sampledFrames = 0;
    let consecutiveConstrainedSamples = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      if (!visible || document.hidden || !contextAvailable) return;
      const elapsed = clock.getElapsedTime();
      system.rotation.y = elapsed * 0.035 + pointerX * 0.08;
      system.rotation.x = Math.sin(elapsed * 0.12) * 0.04 + pointerY * 0.05;
      particles.rotation.y = elapsed * 0.008;
      camera.position.x += (pointerX * 0.22 - camera.position.x) * 0.025;
      camera.position.y += (0.25 - pointerY * 0.12 - camera.position.y) * 0.025;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      sampledFrames += 1;
      const sampledAt = performance.now();
      const sampleDuration = sampledAt - sampleStartedAt;
      if (sampleDuration >= 2000) {
        const fps = Math.round((sampledFrames * 1000) / sampleDuration);
        const performanceState = classifyPageScenePerformance(fps);
        host.dataset.fps = String(fps);
        host.dataset.performance = performanceState;
        consecutiveConstrainedSamples = performanceState === "nominal" ? 0 : consecutiveConstrainedSamples + 1;
        if (shouldDowngradePageSceneQuality({
          requested: quality,
          quality: activeQuality,
          fps,
          consecutiveConstrainedSamples,
        })) {
          activeQuality = "mid";
          host.dataset.quality = activeQuality;
          host.dataset.adaptive = "downgraded";
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
          particles.geometry.setDrawRange(0, definition.particleCount.mid);
          resize();
          host.dispatchEvent(new CustomEvent("cryptic:page-scene-performance", {
            bubbles: true,
            detail: { sceneId, fps, quality: activeQuality, state: performanceState },
          }));
        }
        sampleStartedAt = sampledAt;
        sampledFrames = 0;
      }
      frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (frame || !visible || document.hidden || !contextAvailable) return;
      host.dataset.lifecycle = "running";
      clock.start();
      sampleStartedAt = performance.now();
      sampledFrames = 0;
      frame = requestAnimationFrame(render);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      clock.stop();
      host.dataset.lifecycle = contextAvailable ? "paused" : "context-lost";
    };
    const handleVisibility = () => document.hidden ? stop() : start();
    const handlePointer = (event: PointerEvent) => {
      if (interaction === "none") return;
      const bounds = host.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
    };
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextAvailable = false;
      stop();
      host.dataset.state = "fallback";
      setPresentation("poster");
    };
    const handleContextRestored = () => {
      contextAvailable = true;
      host.dataset.state = "ready";
      setPresentation("webgl");
      start();
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0.05;
      if (visible) start(); else stop();
    }, { threshold: [0, 0.05, 0.25] });
    const resizeObserver = new ResizeObserver(resize);
    intersectionObserver.observe(host);
    resizeObserver.observe(host);
    document.addEventListener("visibilitychange", handleVisibility);
    host.addEventListener("pointermove", handlePointer, { passive: true });
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored);

    resize();
    renderer.render(scene, camera);
    host.dataset.state = "ready";
    setPresentation("webgl");
    start();

    return () => {
      disposed = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      host.removeEventListener("pointermove", handlePointer);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", handleContextRestored);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      loadedTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      host.dataset.lifecycle = "disposed";
      host.dataset.renderer = "inactive";
    };
  }, [interaction, quality, sceneId]);

  return (
    <div ref={hostRef} className="page-scene visual-hero__image" data-scene={sceneId} data-state="poster" data-lifecycle="loading" data-renderer="inactive">
      <Image className="page-scene__poster" src={fallbackPoster} alt="" fill priority sizes="100vw" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="sr-only" aria-live="polite">{presentation === "webgl" ? "Ambient scene ready." : "Static scene displayed."}</span>
    </div>
  );
}
