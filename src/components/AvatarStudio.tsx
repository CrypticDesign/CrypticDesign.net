"use client";

import { useEffect, useId, useRef } from "react";
import * as THREE from "three";
import type { AvatarRecipe } from "@/lib/avatar";
import {
  AVATAR_CAMERA_DEFAULT_DISTANCE,
  AVATAR_VIEW_PRESETS,
  avatarViewCommandForKey,
  clampAvatarCameraDistance,
  describeAvatarRecipe,
  type AvatarViewCommand,
} from "@/lib/avatar-studio-controls";

const colors = { cyan: 0x00dfff, violet: 0x9400d3, magenta: 0xff33cc, indigo: 0x6f7bff };
const skins = { umber: 0x5b3427, copper: 0x9a5f45, sand: 0xc58f68, moon: 0xc8d1d7 };
const outfits = { signal: 0x101f2f, archive: 0x292339, drift: 0x26332f };

export default function AvatarStudio({ recipe, label, compact = false }: { recipe: AvatarRecipe; label: string; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  const controlsId = useId();
  const summaryId = useId();
  const executeCommand = useRef<(command: AvatarViewCommand) => void>(() => undefined);
  useEffect(() => {
    const root = host.current; const element = viewport.current; if (!root || !element) return;
    delete element.dataset.fallback;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { element.dataset.fallback = "true"; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.set(0, .2, AVATAR_CAMERA_DEFAULT_DISTANCE);
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
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    let dragging = false, last = 0, frame = 0, contextAvailable = true, inViewport = true, reduce = motionQuery.matches;
    const render = () => renderer.render(scene, camera);
    const resize = () => { const { width, height } = element.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); render(); };
    const shouldAnimate = () => contextAvailable && !reduce && !document.hidden && inViewport;
    const stopAnimation = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
    const animate = () => { if (!shouldAnimate()) { frame = 0; return; } if (!dragging) group.rotation.y += .0022; render(); frame = requestAnimationFrame(animate); };
    const startAnimation = () => { if (!frame && shouldAnimate()) frame = requestAnimationFrame(animate); };
    const announce = (message: string) => { if (status.current) status.current.textContent = message; };
    resize(); startAnimation();
    const down = (event: PointerEvent) => { root.focus({ preventScroll: true }); dragging = true; last = event.clientX; renderer.domElement.setPointerCapture(event.pointerId); };
    const move = (event: PointerEvent) => { if (dragging) { group.rotation.y += (event.clientX - last) * .012; last = event.clientX; render(); } };
    const up = () => { dragging = false; };
    renderer.domElement.addEventListener("pointerdown", down); renderer.domElement.addEventListener("pointermove", move); renderer.domElement.addEventListener("pointerup", up); renderer.domElement.addEventListener("pointercancel", up);
    const runCommand = (command: AvatarViewCommand) => {
      if (command.type === "rotate") { group.rotation.y += command.radians; announce(command.radians < 0 ? "View rotated left." : "View rotated right."); }
      if (command.type === "zoom") { camera.position.z = clampAvatarCameraDistance(camera.position.z + command.amount); announce(command.amount < 0 ? "View zoomed in." : "View zoomed out."); }
      if (command.type === "view") { const preset = AVATAR_VIEW_PRESETS[command.mode]; camera.position.set(0, preset.height, preset.distance); announce(`${command.mode} view selected.`); }
      if (command.type === "reset") { const preset = AVATAR_VIEW_PRESETS["full-body"]; group.rotation.y = 0; camera.position.set(0, preset.height, AVATAR_CAMERA_DEFAULT_DISTANCE); announce("Full-body view reset."); }
      render();
    };
    executeCommand.current = runCommand;
    const keydown = (event: KeyboardEvent) => {
      const command = avatarViewCommandForKey(event.key); if (!command) return;
      event.preventDefault();
      runCommand(command);
    };
    const wheel = (event: WheelEvent) => { if (document.activeElement !== root) return; event.preventDefault(); camera.position.z = clampAvatarCameraDistance(camera.position.z + Math.sign(event.deltaY) * .25); render(); };
    const contextLost = (event: Event) => { event.preventDefault(); contextAvailable = false; stopAnimation(); element.dataset.fallback = "true"; announce("WebGL became unavailable. Static and text presentations are active."); };
    const contextRestored = () => { contextAvailable = true; delete element.dataset.fallback; resize(); startAnimation(); announce("Interactive character view restored."); };
    const visibilityChanged = () => { if (document.hidden) stopAnimation(); else startAnimation(); };
    const motionChanged = (event: MediaQueryListEvent) => { reduce = event.matches; if (reduce) stopAnimation(); else startAnimation(); render(); };
    const intersectionObserver = new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; if (inViewport) startAnimation(); else stopAnimation(); });
    root.addEventListener("keydown", keydown); renderer.domElement.addEventListener("wheel", wheel, { passive: false }); renderer.domElement.addEventListener("webglcontextlost", contextLost); renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
    document.addEventListener("visibilitychange", visibilityChanged); motionQuery.addEventListener("change", motionChanged); intersectionObserver.observe(element);
    const observer = new ResizeObserver(resize); observer.observe(element);
    return () => { executeCommand.current = () => undefined; contextAvailable = false; stopAnimation(); observer.disconnect(); intersectionObserver.disconnect(); document.removeEventListener("visibilitychange", visibilityChanged); motionQuery.removeEventListener("change", motionChanged); root.removeEventListener("keydown", keydown); renderer.domElement.removeEventListener("pointerdown", down); renderer.domElement.removeEventListener("pointermove", move); renderer.domElement.removeEventListener("pointerup", up); renderer.domElement.removeEventListener("pointercancel", up); renderer.domElement.removeEventListener("wheel", wheel); renderer.domElement.removeEventListener("webglcontextlost", contextLost); renderer.domElement.removeEventListener("webglcontextrestored", contextRestored); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((material) => material.dispose()); } }); };
  }, [recipe]);
  const summary = describeAvatarRecipe(recipe);
  return <div className={`avatar-stage ${compact ? "avatar-stage--compact" : ""}`} ref={host} role="group" tabIndex={0} aria-label={`${label}, an interactive three-dimensional Cryptic persona`} aria-describedby={`${controlsId} ${summaryId}`} aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home 1 2 3">
    <div className="avatar-stage__viewport" ref={viewport}>
      <div className="avatar-fallback"><span className="kicker">Static persona fallback</span><strong aria-hidden="true">{label.slice(0, 1).toUpperCase() || "C"}</strong><span>{label}</span><p className="avatar-fallback__summary">{summary}</p></div>
      <p id={controlsId} className="avatar-stage__hint">Drag or use the controls below to inspect</p>
    </div>
    <div className="avatar-stage__toolbar" role="toolbar" aria-label="Character preview controls">
      <div className="avatar-stage__toolbar-group"><span>View</span>
        <button type="button" onClick={() => executeCommand.current({ type: "view", mode: "full-body" })}>Full</button>
        <button type="button" onClick={() => executeCommand.current({ type: "view", mode: "portrait" })}>Portrait</button>
        <button type="button" onClick={() => executeCommand.current({ type: "view", mode: "detail" })}>Detail</button>
      </div>
      <div className="avatar-stage__toolbar-group"><span>Inspect</span>
        <button type="button" data-icon="true" aria-label="Rotate character left" title="Rotate left" onClick={() => executeCommand.current({ type: "rotate", radians: -0.18 })}>↶</button>
        <button type="button" data-icon="true" aria-label="Rotate character right" title="Rotate right" onClick={() => executeCommand.current({ type: "rotate", radians: 0.18 })}>↷</button>
        <button type="button" data-icon="true" aria-label="Zoom out" title="Zoom out" onClick={() => executeCommand.current({ type: "zoom", amount: 0.35 })}>−</button>
        <button type="button" data-icon="true" aria-label="Zoom in" title="Zoom in" onClick={() => executeCommand.current({ type: "zoom", amount: -0.35 })}>＋</button>
        <button type="button" onClick={() => executeCommand.current({ type: "reset" })}>Reset</button>
      </div>
    </div>
    <p id={summaryId} className="avatar-stage__summary">{summary}</p><span ref={status} className="sr-only" aria-live="polite" />
  </div>;
}
