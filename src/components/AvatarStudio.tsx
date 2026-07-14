"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { AvatarRecipe } from "@/lib/avatar";

const colors = { cyan: 0x00e5ff, gold: 0xffd400, magenta: 0xed00a8, green: 0x00f0a8 };
const skins = { umber: 0x5b3427, copper: 0x9a5f45, sand: 0xc58f68, moon: 0xc8d1d7 };
const outfits = { signal: 0x101f2f, archive: 0x292339, drift: 0x26332f };

export default function AvatarStudio({ recipe, label, compact = false }: { recipe: AvatarRecipe; label: string; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current; if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { element.dataset.fallback = "true"; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.set(0, .2, 6.2);
    const group = new THREE.Group(); scene.add(group);
    const skin = new THREE.MeshStandardMaterial({ color: skins[recipe.skinTone], roughness: .72 });
    const cloth = new THREE.MeshStandardMaterial({ color: outfits[recipe.outfit], roughness: .52, metalness: .08 });
    const signal = new THREE.MeshStandardMaterial({ color: colors[recipe.accent], emissive: colors[recipe.accent], emissiveIntensity: .35, metalness: .45, roughness: .25 });
    const add = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number], scale?: [number, number, number]) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); if (scale) mesh.scale.set(...scale); mesh.castShadow = true; group.add(mesh); return mesh; };
    add(new THREE.CapsuleGeometry(.78, 1.5, 8, 20), cloth, [0, -.35, 0]);
    add(new THREE.SphereGeometry(.58, 32, 24), skin, [0, 1.25, 0], [1, 1.08, .94]);
    add(new THREE.CylinderGeometry(.18, .22, 1.65, 16), cloth, [-.93, -.25, 0], undefined).rotation.z = -.18;
    add(new THREE.CylinderGeometry(.18, .22, 1.65, 16), cloth, [.93, -.25, 0], undefined).rotation.z = .18;
    add(new THREE.TorusGeometry(.83, .055, 10, 48), signal, [0, .32, .68], [1, .45, 1]);
    add(new THREE.SphereGeometry(.07, 16, 12), signal, [-.2, 1.34, .53]); add(new THREE.SphereGeometry(.07, 16, 12), signal, [.2, 1.34, .53]);
    if (recipe.trait === "crest") add(new THREE.ConeGeometry(.28, .8, 5), signal, [0, 2.03, 0]);
    if (recipe.trait === "antennae") { const left = add(new THREE.CylinderGeometry(.025, .04, .8, 8), signal, [-.28, 1.92, 0]); left.rotation.z = -.35; const right = add(new THREE.CylinderGeometry(.025, .04, .8, 8), signal, [.28, 1.92, 0]); right.rotation.z = .35; }
    scene.add(new THREE.HemisphereLight(0x8bdfff, 0x03080f, 2.1)); const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 5); scene.add(key); const rim = new THREE.PointLight(colors[recipe.accent], 20, 8); rim.position.set(-3, 1, 2); scene.add(rim);
    renderer.domElement.setAttribute("aria-hidden", "true"); element.prepend(renderer.domElement);
    let dragging = false, last = 0, frame = 0; const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => { const { width, height } = element.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); renderer.render(scene, camera); };
    const animate = () => { if (!dragging && !reduce) group.rotation.y += .0022; renderer.render(scene, camera); frame = requestAnimationFrame(animate); }; resize(); animate();
    const down = (event: PointerEvent) => { dragging = true; last = event.clientX; renderer.domElement.setPointerCapture(event.pointerId); };
    const move = (event: PointerEvent) => { if (dragging) { group.rotation.y += (event.clientX - last) * .012; last = event.clientX; } };
    const up = () => { dragging = false; }; renderer.domElement.addEventListener("pointerdown", down); renderer.domElement.addEventListener("pointermove", move); renderer.domElement.addEventListener("pointerup", up);
    const observer = new ResizeObserver(resize); observer.observe(element);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose(); renderer.domElement.remove(); scene.traverse((object) => { if (object instanceof THREE.Mesh) object.geometry.dispose(); }); };
  }, [recipe]);
  return <div className={`avatar-stage ${compact ? "avatar-stage--compact" : ""}`} ref={host} role="img" aria-label={`${label}, a customizable three-dimensional Cryptic persona`}><div className="avatar-fallback"><span className="kicker">Static persona fallback</span><strong>{label.slice(0, 1).toUpperCase() || "C"}</strong></div><p className="avatar-stage__hint">Drag to rotate · reduced-motion aware</p></div>;
}
