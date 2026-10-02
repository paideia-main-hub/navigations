"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The mock's corridor: glass panels stand along both walls and recede to a
 * bright centre. The floor is a mirror with light streaks.
 */
export function ResultsStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor("#f4f9ff");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f3f8ff");

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 50);
    camera.position.set(0, 0.7, 6.8);
    camera.lookAt(0, 1.25, -2);

    const dots = new THREE.CanvasTexture(dotPattern());
    dots.wrapS = THREE.RepeatWrapping;
    dots.wrapT = THREE.RepeatWrapping;
    dots.repeat.set(8, 10);
    dots.colorSpace = THREE.SRGBColorSpace;

    const panels: THREE.Mesh[] = [];
    const slabs = [
      { z: 2.2, depth: 1.8, color: "#5b92ff", opacity: 0.72, x: 2.35 },
      { z: 1.15, depth: 0.7, color: "#ffffff", opacity: 0.9, x: 2.15 },
      { z: 0.15, depth: 1.6, color: "#ff7428", opacity: 0.86, x: 2.45 },
      { z: -1.35, depth: 1.7, color: "#3a72f2", opacity: 0.66, x: 2.6, dotted: true },
      { z: -2.9, depth: 1.3, color: "#e5f0ff", opacity: 0.85, x: 2.8 },
      { z: -4.2, depth: 1.6, color: "#2458dc", opacity: 0.55, x: 3.05 },
    ];

    for (const slab of slabs) {
      addWall(scene, panels, dots, slab, -1);
      addWall(scene, panels, dots, slab, 1);
    }

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 8),
      new THREE.MeshBasicMaterial({ color: "#f7fbff", depthWrite: false }),
    );
    wash.position.set(0, 1.4, 2.2);
    scene.add(wash);

    const floorTexture = new THREE.CanvasTexture(floorStreaks());
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 16),
      new THREE.MeshBasicMaterial({ map: floorTexture, transparent: true, depthWrite: false }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -1.85, -1);
    scene.add(floor);

    const draw = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(host);

    return () => {
      observer.disconnect();
      for (const panel of panels) {
        panel.geometry.dispose();
        (panel.material as THREE.Material).dispose();
      }
      wash.geometry.dispose();
      (wash.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      dots.dispose();
      floorTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

function addWall(
  scene: THREE.Scene,
  panels: THREE.Mesh[],
  dots: THREE.Texture,
  slab: { z: number; depth: number; color: string; opacity: number; x: number; dotted?: boolean },
  side: 1 | -1,
) {
  const material = new THREE.MeshBasicMaterial({
    color: slab.color,
    transparent: true,
    opacity: slab.opacity,
    map: slab.dotted ? dots : null,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(slab.depth, 6.4), material);
  mesh.position.set(slab.x * side, 1.05, slab.z);
  mesh.rotation.y = side === -1 ? 1.02 : -1.02;
  scene.add(mesh);
  panels.push(mesh);
}

function dotPattern(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.clearRect(0, 0, 64, 64);
  context.fillStyle = "rgba(255,255,255,0.85)";
  context.beginPath();
  context.arc(8, 8, 2.2, 0, Math.PI * 2);
  context.fill();
  return canvas;
}

function floorStreaks(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const base = context.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, "#d7e8ff");
  base.addColorStop(0.45, "#eef5ff");
  base.addColorStop(1, "#f7fbff");
  context.fillStyle = base;
  context.fillRect(0, 0, 1024, 512);

  for (let index = -16; index <= 16; index += 1) {
    const orange = Math.abs(index) % 4 === 2;
    context.strokeStyle = orange ? "rgba(255, 138, 61, 0.45)" : "rgba(255,255,255,0.95)";
    context.lineWidth = orange ? 14 : index % 2 === 0 ? 10 : 4;
    context.beginPath();
    context.moveTo(512, 0);
    context.lineTo(512 + index * 70, 512);
    context.stroke();
  }
  return canvas;
}
