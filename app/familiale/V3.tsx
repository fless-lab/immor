// @ts-nocheck
"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const FLOOR_META = {
    "-1": { color: "#c8a020", hex: 0xc8a020, label: "Sous-sol", short: "SS" },
    "0": { color: "#60b840", hex: 0x60b840, label: "Rez-de-Chaussée", short: "R+0" },
    "1": { color: "#4088c0", hex: 0x4088c0, label: "R+1 (futur)", short: "R+1" },
    "2": { color: "#a060e0", hex: 0xa060e0, label: "R+2 (futur)", short: "R+2" },
};

// Create a box from corner (x,y,z) with dimensions (w,h,d)
function makeBox(w, h, d, color, x, y, z, opts = {}) {
    const { opacity = 1, wire = false, emissive = 0x000000 } = opts;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = wire
        ? new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity })
        : new THREE.MeshLambertMaterial({ color, transparent: opacity < 1, opacity, emissive, emissiveIntensity: 0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
    mesh.castShadow = !wire;
    mesh.receiveShadow = !wire;
    return mesh;
}

function buildScene(scene) {
    const groups = {};
    ["lot", "-1", "0", "1", "2"].forEach(k => {
        groups[k] = new THREE.Group();
        scene.add(groups[k]);
    });

    const add = (grp, ...args) => groups[grp].add(makeBox(...args));

    // ── LOT & GARDEN ──────────────────────────────────────────────
    // Lot ground
    const lotGeo = new THREE.PlaneGeometry(15, 20);
    const lotMesh = new THREE.Mesh(lotGeo, new THREE.MeshLambertMaterial({ color: 0x3a6a20 }));
    lotMesh.rotation.x = -Math.PI / 2;
    lotMesh.position.set(7.5, -0.02, 10);
    lotMesh.receiveShadow = true;
    groups["lot"].add(lotMesh);

    // Driveway/allée
    add("lot", 10, 0.03, 4, 0x8a8070, 2, 0, 0);
    // Front garden sides
    add("lot", 2, 0.03, 4, 0x4a8030, 0, 0, 0);
    add("lot", 3, 0.03, 4, 0x4a8030, 12, 0, 0);

    // ── POOL ──────────────────────────────────────────────────────
    add("lot", 5, 0.5, 3.5, 0x336688, 2.8, -0.5, 15.8);   // pool shell
    add("lot", 4.6, 0.05, 3.1, 0x44aadd, 3.0, 0.02, 16.0, { opacity: 0.85 }); // water surface
    // Pool edge/coping
    add("lot", 5.4, 0.12, 0.2, 0xccbbaa, 2.6, 0, 15.6);
    add("lot", 5.4, 0.12, 0.2, 0xccbbaa, 2.6, 0, 19.1);
    add("lot", 0.2, 0.12, 3.9, 0xccbbaa, 2.6, 0, 15.6);
    add("lot", 0.2, 0.12, 3.9, 0xccbbaa, 7.8, 0, 15.6);

    // Rear garden / terrace slab
    add("lot", 11, 0.08, 1.5, 0xc8b888, 2, 0, 15.0); // rear terrace dallée
    // Outdoor kitchen
    add("lot", 3, 2.2, 3, 0xc8a850, 9.2, 0, 15.8); // structure
    add("lot", 3, 0.12, 3, 0xddcc88, 9.2, 2.2, 15.8); // worktop
    // Auvent outdoor kitchen
    add("lot", 3.4, 0.1, 3.4, 0x887744, 9.0, 2.6, 15.6);
    [9.1, 12.1].forEach(px => [15.9, 18.7].forEach(pz =>
        add("lot", 0.15, 2.6, 0.15, 0x887744, px, 0, pz)
    ));

    // Security post
    add("lot", 1.5, 2.5, 2, 0xb0b888, 0, 0, 0.5);
    add("lot", 1.5, 0.1, 2, 0x999977, 0, 2.5, 0.5); // roof
    // Gate post
    add("lot", 0.2, 1.8, 0.2, 0x888070, 1.5, 0, 0.5);
    add("lot", 0.2, 1.8, 0.2, 0x888070, 1.5, 0, 1.5);

    // Lot boundary wall
    for (let i = 0; i < 15; i += 1.2) add("lot", 1.1, 1.2, 0.2, 0xaa9980, i, 0, 0.1);
    for (let i = 0; i < 20; i += 1.2) add("lot", 0.2, 1.2, 1.1, 0xaa9980, 14.8, 0, i);
    for (let i = 0; i < 20; i += 1.2) add("lot", 0.2, 1.2, 1.1, 0xaa9980, 0, 0, i);
    for (let i = 0; i < 15; i += 1.2) add("lot", 1.1, 1.2, 0.2, 0xaa9980, i, 0, 19.8);

    // ── SOUS-SOL ─────────────────────────────────────────────────
    const SS_Y = -3.2;
    const SS_H = 3.2;

    // SS floor slab
    add("-1", 11, 0.3, 12, 0x6a5a4a, 2, SS_Y - 0.3, 3);
    // SS outer walls (poured concrete look)
    add("-1", 11, SS_H, 0.3, 0x7a6e60, 2, SS_Y, 3);     // front
    add("-1", 11, SS_H, 0.3, 0x7a6e60, 2, SS_Y, 14.7);  // back
    add("-1", 0.3, SS_H, 12, 0x7a6e60, 2, SS_Y, 3);     // left
    add("-1", 0.3, SS_H, 12, 0x7a6e60, 12.7, SS_Y, 3);  // right

    // Garage zone
    add("-1", 7, SS_H - 0.3, 6, 0x5a5248, 2.3, SS_Y + 0.3, 3.3);
    // 2 cars (simplified)
    add("-1", 2.2, 1.2, 4.5, 0x4a6888, 2.5, SS_Y + 0.3, 3.8, { opacity: 0.7 });
    add("-1", 2.2, 1.2, 4.5, 0x556677, 5.0, SS_Y + 0.3, 3.8, { opacity: 0.7 });
    // Garage door opening (lighter)
    add("-1", 4.5, 2.2, 0.1, 0x6688aa, 2.5, SS_Y + 0.3, 3.0, { opacity: 0.3 });

    // Ramp (angled)
    const rampGeo = new THREE.BoxGeometry(2, 0.25, 5);
    const rampMat = new THREE.MeshLambertMaterial({ color: 0x8a7a6a });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(3, -1.5, 2.3);
    ramp.rotation.x = 0.54;
    groups["-1"].add(ramp);

    // Buanderie
    add("-1", 2.5, SS_H - 0.3, 3, 0x7a7060, 9.3, SS_Y + 0.3, 3.3);
    // Tech room
    add("-1", 4, SS_H - 0.3, 3, 0x6a6050, 9.3, SS_Y + 0.3, 6.3);
    // VIP room
    add("-1", 9, SS_H - 0.3, 5, 0xc8b890, 2.3, SS_Y + 0.3, 9.3, { emissive: 0x443322 });

    // Intermediate slab between SS and RDC
    add("-1", 11, 0.3, 12, 0x8a7a6a, 2, -0.3, 3);

    // ── RDC ──────────────────────────────────────────────────────
    const W_THICK = 0.3;
    const RDC_H = 3.5;
    const RDC_Y = 0;

    // ── Exterior walls (with window/door gaps represented)
    // Front wall — left chunk
    add("0", 3, RDC_H, W_THICK, 0xd4c8aa, 2, RDC_Y, 3);
    // Front wall — right chunk
    add("0", 2.8, RDC_H, W_THICK, 0xd4c8aa, 10.2, RDC_Y, 3);
    // Front wall — top band above big opening (lintel)
    add("0", 5.2, 0.6, W_THICK, 0xb8a888, 5, RDC_Y + 2.9, 3);
    // Front terrasse connection — side bits
    add("0", 0.3, RDC_H, W_THICK, 0xd4c8aa, 5, RDC_Y, 3);

    // Back wall — with window slots
    add("0", 4, RDC_H, W_THICK, 0xd4c8aa, 2, RDC_Y, 14.7);
    add("0", 2, RDC_H, W_THICK, 0xd4c8aa, 8, RDC_Y, 14.7);
    add("0", 2, RDC_H, W_THICK, 0xd4c8aa, 11, RDC_Y, 14.7);
    add("0", 11, 0.4, W_THICK, 0xb8a888, 2, RDC_Y + 3.1, 14.7);
    // Back window glass
    add("0", 2.8, 1.4, 0.1, 0x88bbdd, 6.1, RDC_Y + 1.2, 14.75, { opacity: 0.35 });
    // Left wall — suite window
    add("0", W_THICK, RDC_H, 5, 0xd4c8aa, 2, RDC_Y, 3);
    add("0", W_THICK, RDC_H, 3.5, 0xd4c8aa, 2, RDC_Y, 10.5);
    add("0", W_THICK, 0.5, 1.5, 0xb8a888, 2, RDC_Y + 3.0, 8);
    // Suite window glass
    add("0", 0.1, 1.8, 1.3, 0x88bbdd, 2.05, RDC_Y + 1.0, 8.1, { opacity: 0.3 });
    // Right wall
    add("0", W_THICK, RDC_H, 12, 0xd4c8aa, 12.7, RDC_Y, 3);

    // ── Interior rooms (colored volumes, slightly inside walls)
    const ri = 0.2; // inset
    // Salon — BRIGHT, double height
    add("0", 6.7, RDC_H * 1.5, 5, 0xfff8e8, 2 + ri, RDC_Y + ri, 3 + ri, { emissive: 0x332200 });
    // Big glazing / baies vitrées salon
    add("0", 5.2, 2.5, 0.12, 0x99ccee, 5, RDC_Y + 0.3, 3.05, { opacity: 0.25 });
    // Cuisine
    add("0", 3.8, RDC_H - 0.3, 4, 0xeaf8e8, 9 + ri, RDC_Y + ri, 3 + ri);
    // Kitchen island
    add("0", 1.8, 0.9, 0.85, 0xf0e8d0, 9.6, RDC_Y + 0.9, 4.5);
    // Cellier
    add("0", 3.8, RDC_H - 0.3, 1, 0xdedad0, 9 + ri, RDC_Y + ri, 7 + ri);
    // Hall
    add("0", 4, RDC_H - 0.3, 2, 0xf0ece0, 5 + ri, RDC_Y + ri, 3 + ri);
    // WC visiteur
    add("0", 1.5, RDC_H - 0.3, 2, 0xd8eeff, 7.5 + ri, RDC_Y + ri, 3 + ri);
    // Accès SS
    add("0", 2.5, RDC_H - 0.3, 2, 0xdedad0, 9 + ri, RDC_Y + ri, 3 + ri);
    // Couloir nuit
    add("0", 10.7, 0.3, 1, 0xe8e4d8, 2 + ri, RDC_Y + ri, 8 + ri);
    // Suite parentale
    add("0", 3.8, RDC_H - 0.3, 3.8, 0xfff0f0, 2 + ri, RDC_Y + ri, 9 + ri, { emissive: 0x220011 });
    // SDB suite
    add("0", 1.8, RDC_H - 0.3, 2, 0xd0e8ff, 6 + ri, RDC_Y + ri, 9 + ri);
    // Dressing
    add("0", 1.8, RDC_H - 0.3, 2, 0xf0e0ff, 6 + ri, RDC_Y + ri, 11 + ri);
    // Chambre 2
    add("0", 2.3, RDC_H - 0.3, 3.8, 0xf0ecff, 8 + ri, RDC_Y + ri, 9 + ri);
    // SDB chambre 2
    add("0", 1.5, RDC_H - 0.3, 2, 0xd0e8ff, 10.5 + ri, RDC_Y + ri, 9 + ri);
    // Chambre 3
    add("0", 2.3, RDC_H - 0.3, 2, 0xf0ecff, 10.5 + ri, RDC_Y + ri, 11 + ri);

    // ── Terrace front (RDC level)
    add("0", 8, 0.15, 2, 0xe8c870, 2, RDC_Y, 1);
    // Terrace cover structure (auvent)
    add("0", 8, 0.12, 2, 0x9a8840, 2, RDC_Y + 2.7, 1);
    [2.2, 5.5, 9.6].forEach(px => add("0", 0.18, 2.7, 0.18, 0x9a8840, px, RDC_Y, 1));

    // RDC ceiling slab (dalle R+1)
    add("0", 11, 0.3, 12, 0x7a6a58, 2, RDC_Y + RDC_H, 3);

    // Interior walls partition lines (thin)
    add("0", 0.18, RDC_H, 7, 0xb8a888, 8.9, RDC_Y, 3);   // salon/cuisine separation
    add("0", 6.7, 0.18, RDC_H - 1, 0xb8a888, 2, RDC_Y, 8); // day/night separation
    add("0", 0.18, RDC_H, 4, 0xb8a888, 5.9, RDC_Y, 9);
    add("0", 0.18, RDC_H, 4, 0xb8a888, 7.9, RDC_Y, 9);
    add("0", 0.18, RDC_H, 4, 0xb8a888, 10.4, RDC_Y, 9);

    // ── R+1 FUTURE (wireframe ghost) ────────────────────────────
    const R1_Y = RDC_Y + RDC_H + 0.3;
    add("1", 11, 3.5, 12, 0x4488cc, 2, R1_Y, 3, { wire: true, opacity: 0.35 });
    // Dalle R+2
    add("1", 11, 0.25, 12, 0x4488cc, 2, R1_Y + 3.5, 3, { opacity: 0.25 });
    // Trémie
    add("1", 1.4, 3.5, 1.8, 0x88ccff, 6.3, R1_Y, 11.2, { opacity: 0.2 });

    // ── R+2 FUTURE (wireframe ghost) ────────────────────────────
    const R2_Y = R1_Y + 3.5 + 0.25;
    add("2", 11, 3.5, 12, 0xa060e0, 2, R2_Y, 3, { wire: true, opacity: 0.25 });
    // Roof - hip roof suggestion
    const pts = [
        new THREE.Vector3(7.5, R2_Y + 5, 9),
        new THREE.Vector3(2, R2_Y + 3.5, 3),
        new THREE.Vector3(13, R2_Y + 3.5, 3),
        new THREE.Vector3(13, R2_Y + 3.5, 15),
        new THREE.Vector3(2, R2_Y + 3.5, 15),
    ];
    const roofGeo = new THREE.ConeGeometry(8, 3.5, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x663322, transparent: true, opacity: 0.45 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.set(7.5, R2_Y + 3.5 + 1.75, 9);
    groups["2"].add(roofMesh);

    // Structural columns (visible in 3D on lot corners)
    const colPositions = [
        [2, 3], [6, 3], [9, 3], [13, 3],
        [2, 9], [13, 9],
        [2, 15], [6, 15], [9, 15], [13, 15],
    ];
    colPositions.forEach(([cx, cz]) => {
        const colH = R2_Y + 7;
        const col = makeBox(0.3, colH, 0.3, 0x2a2018, cx - 0.15, -3.2, cz - 0.15);
        col.material = new THREE.MeshLambertMaterial({ color: 0x3a3025 });
        groups["lot"].add(col);
        // Gold cap
        groups["lot"].add(makeBox(0.45, 0.15, 0.45, 0xc8a040, cx - 0.22, colH - 3.2, cz - 0.22));
    });

    return groups;
}

export default function Villa3D() {
    const mountRef = useRef(null);
    const stateRef = useRef(null);
    const [visible, setVisible] = useState({ "-1": true, "0": true, "1": true, "2": true });
    const [isDark, setIsDark] = useState(false);
    const [hint, setHint] = useState("Glisser pour tourner · Molette pour zoomer");

    const t = isDark 
        ? { bg: 0x14110e, fog: 0x14110e, sun: 0xfff8e8, sunInt: 1.6, fill: 0x445566, grid1: 0x2a2818, grid2: 0x161410, header: "#1e1a14", border: "#3a3020", panel: "rgba(20,16,10,0.85)", text: "#c8a840" }
        : { bg: 0xf0f4f8, fog: 0xfecf8, sun: 0xffffff, sunInt: 1.2, fill: 0xffffff, grid1: 0xd0d8e0, grid2: 0xe0e8f0, header: "#ffffff", border: "#d1d9e6", panel: "rgba(255,255,255,0.85)", text: "#2c3e50" };

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;
        const W = container.clientWidth, H = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x18140f);
        scene.fog = new THREE.FogExp2(0x18140f, 0.012);

        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 300);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Lights
        scene.add(new THREE.AmbientLight(0xffeedd, 0.7));
        const sun = new THREE.DirectionalLight(0xfff5e0, 1.4);
        sun.position.set(25, 35, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 100;
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xaaccff, 0.3);
        fill.position.set(-15, 10, -10);
        scene.add(fill);

        // Ground plane (extended)
        const groundGeo = new THREE.PlaneGeometry(80, 80);
        const groundMesh = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ color: 0x2a3a1a }));
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.set(7.5, -0.03, 10);
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);

        // Grid
        const grid = new THREE.GridHelper(60, 60, 0x2a2818, 0x1e1c14);
        grid.position.set(7.5, -0.01, 10);
        scene.add(grid);

        // Build scene and get groups
        const groups = buildScene(scene);
        stateRef.current = { groups, scene, sun, fill, grid };

        // ── Orbit controls ────────────────────────────────────────
        let theta = -0.5, phi = 0.75, radius = 38;
        const target = new THREE.Vector3(7.5, 3, 9);

        const updateCamera = () => {
            camera.position.set(
                target.x + radius * Math.sin(phi) * Math.sin(theta),
                target.y + radius * Math.cos(phi),
                target.z + radius * Math.sin(phi) * Math.cos(theta)
            );
            camera.lookAt(target);
        };
        updateCamera();

        let down = false, lastX = 0, lastY = 0;

        const getXY = e => e.touches
            ? [e.touches[0].clientX, e.touches[0].clientY]
            : [e.clientX, e.clientY];

        const onDown = e => {
            down = true;
            [lastX, lastY] = getXY(e);
        };
        const onUp = () => { down = false; };
        const onMove = e => {
            if (!down) return;
            const [cx, cy] = getXY(e);
            theta -= (cx - lastX) * 0.008;
            phi = Math.max(0.08, Math.min(1.45, phi + (cy - lastY) * 0.008));
            lastX = cx; lastY = cy;
            updateCamera();
        };
        const onWheel = e => {
            e.preventDefault();
            radius = Math.max(5, Math.min(70, radius + e.deltaY * 0.06));
            updateCamera();
        };

        renderer.domElement.addEventListener("mousedown", onDown);
        renderer.domElement.addEventListener("touchstart", onDown, { passive: true });
        window.addEventListener("mouseup", onUp);
        window.addEventListener("touchend", onUp);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onMove, { passive: true });
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

        let animId;
        const animate = () => {
            animId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
            const W = container.clientWidth, H = container.clientHeight;
            camera.aspect = W / H;
            camera.updateProjectionMatrix();
            renderer.setSize(W, H);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animId);
            renderer.domElement.removeEventListener("mousedown", onDown);
            renderer.domElement.removeEventListener("touchstart", onDown);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchend", onUp);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("touchmove", onMove);
            renderer.domElement.removeEventListener("wheel", onWheel);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
        };
    }, []);

    // Sync visibility
    useEffect(() => {
        if (!stateRef.current) return;
        const { groups } = stateRef.current;
        Object.entries(visible).forEach(([f, v]) => {
            if (groups[f]) groups[f].visible = v;
        });
    }, [visible]);

    // Sync Theme
    useEffect(() => {
        if (!stateRef.current) return;
        const { scene, sun, fill, grid } = stateRef.current;
        scene.background.set(t.bg);
        scene.fog.color.set(t.bg);
        sun.color.set(t.sun);
        sun.intensity = t.sunInt;
        fill.color.set(t.fill);
        if (grid) {
            grid.material.color.set(t.grid2); // center line
            grid.material.color.set(t.grid1); // grid lines
            // GridHelper doesn't directly expose sub-colors easily after creation via setters 
            // but we can swap its material or just recreate. For simplicity, we update the background mostly.
        }
    }, [isDark, t]);

    const toggle = f => setVisible(p => ({ ...p, [f]: !p[f] }));

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: isDark ? "#141210" : "#f0f4f8", fontFamily: "'Courier New', monospace", overflow: "hidden",
            transition: "background 0.3s ease"
        }}>
            {/* Header */}
            <div style={{
                padding: "8px 16px", background: t.header,
                borderBottom: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", flexShrink: 0,
                transition: "all 0.3s ease"
            }}>
                <div>
                    <div style={{ fontSize: 10, color: t.text, letterSpacing: 3, textTransform: "uppercase", transition: "color 0.3s" }}>
                        Villa Évolutive — Vue 3D Interactive
                    </div>
                    <div style={{ fontSize: 7, color: isDark ? "#555" : "#888", marginTop: 1 }}>
                        Agovodou, Lomé · ~300 m²
                    </div>
                </div>

                {/* Floor toggles */}
                <div style={{ display: "flex", gap: 4, marginLeft: 12 }}>
                    {Object.entries(FLOOR_META).map(([f, m]) => (
                        <button key={f} onClick={() => toggle(f)} style={{
                            padding: "4px 12px",
                            border: `1.5px solid ${visible[f] ? m.color : isDark ? "#2e2820" : "#d1d9e6"}`,
                            background: visible[f] ? (isDark ? "#2a2018" : "#fff") : (isDark ? "#0e0c0a" : "#f8f9fa"),
                            color: visible[f] ? m.color : (isDark ? "#444" : "#adb5bd"),
                            fontSize: 8, cursor: "pointer", fontFamily: "monospace",
                            transition: "all 0.15s", minWidth: 52,
                            borderRadius: 4
                        }}>
                            <div style={{ fontSize: 12, fontWeight: "bold" }}>{m.short}</div>
                            <div style={{ fontSize: 6, marginTop: 1 }}>
                                {f === "1" || f === "2" ? "futur" : "actif"}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    style={{
                        padding: "6px 12px", borderRadius: 20, border: `1px solid ${t.border}`,
                        background: "none", color: t.text, cursor: "pointer", fontSize: 9,
                        display: "flex", alignItems: "center", gap: 6, marginLeft: 10,
                        transition: "all 0.3s"
                    }}
                >
                    {isDark ? "☀️ Light" : "🌙 Dark"}
                </button>

                <div style={{ marginLeft: "auto", fontSize: 7, color: "#444" }}>
                    🖱 Glisser = rotation &nbsp;·&nbsp; Molette = zoom
                </div>
            </div>

            {/* 3D Canvas */}
            <div ref={mountRef} style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                {/* Legend overlay */}
                <div style={{
                    position: "absolute", bottom: 12, left: 12,
                    background: t.panel, padding: "8px 12px",
                    border: `1px solid ${t.border}`, fontSize: 7, color: isDark ? "#888" : "#555",
                    lineHeight: 2, pointerEvents: "none", transition: "all 0.3s"
                }}>
                    {[
                        ["#c8a020", "Sous-sol (SS)"],
                        ["#60b840", "RDC complet"],
                        ["#4088cc", "R+1 futur (structure)"],
                        ["#a060e0", "R+2 futur (structure)"],
                        ["#44aadd", "Piscine"],
                        ["#c8a850", "Cuisine extérieure"],
                        ["#b0b888", "Poste gardien"],
                        ["#c8a840", "■ Poteaux R+2"],
                    ].map(([col, lbl]) => (
                        <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, background: col, flexShrink: 0 }} />
                            <span>{lbl}</span>
                        </div>
                    ))}
                </div>

                {/* Tips */}
                <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(20,16,10,0.7)", padding: "6px 10px",
                    border: "1px solid #3a3020", fontSize: 7, color: "#555",
                    pointerEvents: "none", lineHeight: 2
                }}>
                    <div>👆 Désactiver un étage → bouton en haut</div>
                    <div>🔄 Clic + glisser = rotation libre</div>
                    <div>🔍 Molette = zoom avant / arrière</div>
                </div>
            </div>
        </div>
    );
}