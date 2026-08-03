"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SingularisSessionState } from "@/lib/singularis-gamespace";

export default function SingularisUniverseViewport({ session, onCheckpoint }: { session: SingularisSessionState; onCheckpoint: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const checkpoint = useRef(onCheckpoint);
  checkpoint.current = onCheckpoint;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { element.dataset.fallback = "true"; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030810, 0.035);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 4.4, 14);
    camera.lookAt(0, 0, 0);
    const stars = new THREE.BufferGeometry();
    const points = new Float32Array(600);
    for (let i = 0; i < points.length; i += 3) { points[i] = (Math.random() - .5) * 24; points[i + 1] = (Math.random() - .5) * 28; points[i + 2] = (Math.random() - .5) * 12; }
    stars.setAttribute("position", new THREE.BufferAttribute(points, 3));
    scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0x8bc8ff, size: .045 })));

    const planet = new THREE.Mesh(new THREE.SphereGeometry(5.2, 64, 32), new THREE.MeshStandardMaterial({ color: 0x07172b, emissive: 0x071326, roughness: .82 }));
    planet.position.set(-5.8, -5.2, -4); scene.add(planet);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(5.28, 64, 32), new THREE.MeshBasicMaterial({ color: 0x2b87d3, transparent: true, opacity: .13, side: THREE.BackSide }));
    atmosphere.position.copy(planet.position); scene.add(atmosphere);
    const craft = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.ConeGeometry(.34, 1.35, 5), new THREE.MeshStandardMaterial({ color: 0xddeeff, metalness: .8, roughness: .25 }));
    hull.rotation.x = Math.PI / 2;
    craft.add(hull);
    const drive = new THREE.PointLight(0xa050f0, 12, 5); drive.position.z = .72; craft.add(drive);
    scene.add(craft);
    const gate = new THREE.Mesh(new THREE.TorusGeometry(1.45, .045, 12, 96), new THREE.MeshBasicMaterial({ color: 0xa050f0 }));
    gate.position.set(3.2, 1.55, -5); scene.add(gate);
    for (const [x, y, z] of [[-1.8, 1.1, -3], [1.2, -.7, -5], [4.8, -.25, -6]]) {
      const traffic = new THREE.Mesh(new THREE.ConeGeometry(.09, .38, 3), new THREE.MeshBasicMaterial({ color: 0x84d7ff }));
      traffic.rotation.x = Math.PI / 2; traffic.position.set(x, y, z); scene.add(traffic);
    }
    scene.add(new THREE.HemisphereLight(0x6db7ff, 0x02050a, 2.2));

    const keys = new Set<string>();
    const keyDown = (event: KeyboardEvent) => {
      if (session.inputState !== "active") return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
      keys.add(event.key);
      if (event.key === " ") checkpoint.current();
    };
    const keyUp = (event: KeyboardEvent) => keys.delete(event.key);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    const observer = new ResizeObserver(([entry]) => { const { width, height } = entry.contentRect; renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); });
    observer.observe(element);
    let frame = 0;
    const clock = new THREE.Clock();
    const render = () => {
      const delta = Math.min(clock.getDelta(), .04);
      if (session.inputState === "active") {
        craft.position.x = THREE.MathUtils.clamp(craft.position.x + ((keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0)) * delta * 5, -4.5, 4.5);
        craft.position.y = THREE.MathUtils.clamp(craft.position.y + ((keys.has("ArrowUp") ? 1 : 0) - (keys.has("ArrowDown") ? 1 : 0)) * delta * 5, -3.5, 3.5);
      }
      stars.rotateZ(delta * .015); gate.rotateZ(delta * .18); renderer.render(scene, camera); frame = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); renderer.dispose(); renderer.domElement.remove(); scene.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.Points) { object.geometry.dispose(); if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose()); else object.material.dispose(); } }); };
  }, [session.inputState]);

  return <div ref={host} className="singularis-viewport" role="img" aria-label={session.runtimeMode === "observational" ? "Live observational window into the persistent Singularis universe" : `${session.simulationId} flight space`}><div className="singularis-viewport__fallback"><span>Live universe telemetry</span><strong>Singularis sector online</strong></div></div>;
}
