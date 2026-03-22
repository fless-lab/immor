// @ts-nocheck
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const M = 1; // 1 unit = 1 meter
// Lot dimensions
const LW = 15, LD = 22;
// House footprint: starts at x=2, z=5
const HX = 2, HZ = 5, HW = 11, HD = 12;
// Heights
const SS_BOT = -3.5, SS_H = 3.5;
const RDC_H = 3.2, SALON_H = 5.5;
const SLAB = 0.28;
const R1_Y = RDC_H + SLAB, R1_H = 3.2;
const R2_Y = R1_Y + R1_H + SLAB, R2_H = 3.2;

// ─── MATERIALS ────────────────────────────────────────────────────────────────
const MAT = {};
const mkMat = (color, opts = {}) =>
    new THREE.MeshLambertMaterial({ color, ...opts });

function getMat(key) {
    if (!MAT[key]) {
        const defs = {
            concrete: mkMat(0x9a8f80),
            concrete_d: mkMat(0x7a7060),
            wall_ext: mkMat(0xd8cdb0),
            wall_int: mkMat(0xede8dc),
            slab: mkMat(0x8a8070),
            floor_tile: mkMat(0xddd4b8),
            floor_ceramic: mkMat(0xe8e0cc),
            floor_wood: mkMat(0xc8a060),
            floor_epoxy: mkMat(0x606870),
            roof_tile: mkMat(0x7a3a22),
            glass: mkMat(0x88ccee, { transparent: true, opacity: 0.22 }),
            glass_op: mkMat(0x66aacc, { transparent: true, opacity: 0.18 }),
            steel: mkMat(0x909898),
            wood: mkMat(0xc09050),
            garden: mkMat(0x3a7020),
            garden2: mkMat(0x4a8028),
            paving: mkMat(0xb0a888),
            paving2: mkMat(0xc0b898),
            pool_wall: mkMat(0x227799),
            pool_water: mkMat(0x44aad8, { transparent: true, opacity: 0.82 }),
            pool_tile: mkMat(0x3399cc),
            salon_fl: mkMat(0xc8b880),
            salon_wall: mkMat(0xfff8e8),
            cuisine_fl: mkMat(0xd0ccb0),
            suite_wall: mkMat(0xfff0f0),
            ch_wall: mkMat(0xf0ecff),
            sdb_wall: mkMat(0xe0f0ff),
            garage_fl: mkMat(0x707878),
            ramp_c: mkMat(0x888070),
            vip_wall: mkMat(0xf8f0d8),
            tech_wall: mkMat(0x909898),
            fence: mkMat(0xaa9978),
            fence2: mkMat(0xbbaa88),
            gold: mkMat(0xd4a030),
            col: mkMat(0x3a3020),
            outdoor_k: mkMat(0xc8a040),
            secu: mkMat(0xb8c8a0),
            ramp_str: mkMat(0x807868),
            ghost_r1: mkMat(0x2266aa, { transparent: true, opacity: 0.18, wireframe: false }),
            ghost_r2: mkMat(0x6622aa, { transparent: true, opacity: 0.14, wireframe: false }),
            wire_r1: mkMat(0x4499cc, { transparent: true, opacity: 0.55, wireframe: true }),
            wire_r2: mkMat(0x9944cc, { transparent: true, opacity: 0.45, wireframe: true }),
            future_slab: mkMat(0x4488bb, { transparent: true, opacity: 0.3 }),
            furniture: mkMat(0xa07840),
            furniture2: mkMat(0x806030),
            white_fix: mkMat(0xf0f0f0),
            chrome: mkMat(0xc8c8c8),
            red_acc: mkMat(0xcc4422),
            terrace_t: mkMat(0xe0c860),
            terrace_f: mkMat(0xcbb850),
            neighbor: mkMat(0xc0b8a0, { transparent: true, opacity: 0.4 }),
            stair_conc: mkMat(0x9a9080),
            arrow_mat: mkMat(0xffcc00),
        };
        if (defs[key]) MAT[key] = defs[key];
        else MAT[key] = mkMat(0xff00ff);
    }
    return MAT[key];
}

// ─── GEOMETRY HELPERS ─────────────────────────────────────────────────────────
function box(w, h, d, mat, cx, cy, cz) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, getMat(mat));
    m.position.set(cx, cy, cz);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}
// box from corner (not center)
function bc(w, h, d, mat, x, y, z) {
    return box(w, h, d, mat, x + w / 2, y + h / 2, z + d / 2);
}
function cyl(r, h, mat, cx, cy, cz, segs = 8) {
    const g = new THREE.CylinderGeometry(r, r, h, segs);
    const m = new THREE.Mesh(g, getMat(mat));
    m.position.set(cx, cy, cz);
    return m;
}
function sphere(r, mat, cx, cy, cz) {
    const g = new THREE.SphereGeometry(r, 8, 8);
    const m = new THREE.Mesh(g, getMat(mat));
    m.position.set(cx, cy, cz);
    return m;
}

// Floating text label
function makeLabel(text, x, y, z, color = "#f0e0b0", size = 0.35) {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(15,12,8,0.82)";
    ctx.roundRect(4, 4, 504, 120, 12);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.roundRect(4, 4, 504, 120, 12);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = "bold 52px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(size * 4, size, 1);
    return sprite;
}

// ─── STAIRS ───────────────────────────────────────────────────────────────────
function buildStairs(group, x1, z1, x2, z2, yBot, yTop, steps, matKey, dir = "x") {
    const stepH = (yTop - yBot) / steps;
    const stepD = dir === "x" ? (x2 - x1) / steps : (z2 - z1) / steps;
    const width = dir === "x" ? (z2 - z1) : (x2 - x1);
    for (let i = 0; i < steps; i++) {
        const y = yBot + i * stepH;
        let m;
        if (dir === "x") {
            m = bc(stepD, stepH + 0.04, width, matKey, x1 + i * stepD, y, z1);
        } else {
            m = bc(width, stepH + 0.04, stepD, matKey, x1, y, z1 + i * stepD);
        }
        group.add(m);
    }
}

// ─── RAMP ─────────────────────────────────────────────────────────────────────
function buildRamp(group) {
    // Ramp from z=1.5,Y=0 down to z=5,Y=SS_BOT
    // Width 3.5m (x: 2 to 5.5)
    const segs = 12;
    const zStart = 1.8, zEnd = HZ + 0.3;
    const yStart = -0.1, yEnd = SS_BOT + 0.15;
    const rampW = 3.5;
    for (let i = 0; i < segs; i++) {
        const t0 = i / segs, t1 = (i + 1) / segs;
        const z0 = zStart + t0 * (zEnd - zStart);
        const z1 = zStart + t1 * (zEnd - zStart);
        const y0 = yStart + t0 * (yEnd - yStart);
        const slabD = z1 - z0;
        const slabH = 0.22;
        const m = bc(rampW, slabH, slabD, "ramp_str", HX, y0 - slabH, z0);
        group.add(m);
    }
    // Side walls of ramp
    group.add(bc(0.25, 1.2, zEnd - zStart, "concrete_d", HX - 0.25, yEnd, zStart));
    group.add(bc(0.25, 1.2, zEnd - zStart, "concrete_d", HX + rampW, yEnd, zStart));
    // Curb
    group.add(bc(rampW, 0.18, 0.2, "concrete", HX, 0, zStart));
}

// ─── TREE ─────────────────────────────────────────────────────────────────────
function buildTree(group, x, z, h = 3) {
    group.add(cyl(0.12, h * 0.55, "wood", x, h * 0.275, z));
    group.add(sphere(h * 0.28, "garden2", x, h * 0.72, z));
    group.add(sphere(h * 0.2, "garden", x - h * 0.18, h * 0.62, z));
    group.add(sphere(h * 0.2, "garden", x + h * 0.18, h * 0.62, z));
}

// ─── TOILET ───────────────────────────────────────────────────────────────────
function buildToilet(group, x, y, z, rotY = 0) {
    const g = new THREE.Group();
    g.add(bc(0.35, 0.42, 0.6, "white_fix", -0.175, 0, -0.3));
    const seatG = new THREE.TorusGeometry(0.16, 0.05, 6, 16);
    const seat = new THREE.Mesh(seatG, getMat("white_fix"));
    seat.rotation.x = Math.PI / 2;
    seat.position.set(0, 0.44, -0.05);
    g.add(seat);
    g.rotation.y = rotY;
    g.position.set(x, y, z);
    group.add(g);
}

function buildSink(group, x, y, z) {
    group.add(bc(0.5, 0.08, 0.4, "white_fix", x - 0.25, y + 0.82, z - 0.2));
    group.add(bc(0.08, 0.82, 0.08, "wall_int", x - 0.04, y, z - 0.1));
    // Tap
    group.add(cyl(0.02, 0.12, "chrome", x, y + 0.96, z - 0.1));
}

function buildShower(group, x, y, z, w = 1, d = 1) {
    group.add(bc(w, 0.06, d, "sdb_wall", x, y, z));
    group.add(bc(w, 1.8, 0.04, "glass_op", x, y + 0.06, z));
    group.add(bc(0.04, 1.8, d, "glass_op", x, y + 0.06, z));
    // Shower head
    group.add(cyl(0.03, 0.5, "chrome", x + w * 0.6, y + 1.9, z + d * 0.5));
    group.add(sphere(0.08, "chrome", x + w * 0.6, y + 2.1, z + d * 0.5));
}

function buildBathtub(group, x, y, z) {
    group.add(bc(1.7, 0.6, 0.8, "white_fix", x, y, z));
    group.add(bc(1.5, 0.44, 0.6, "sdb_wall", x + 0.1, y + 0.12, z + 0.1));
}

function buildBed(group, x, y, z, w = 2, d = 2.2, matK = "furniture") {
    group.add(bc(w, 0.28, d, matK, x, y, z));
    group.add(bc(w, 0.55, 0.22, "furniture2", x, y + 0.28, z));
    // Pillows
    group.add(bc(0.55, 0.12, 0.42, "white_fix", x + 0.15, y + 0.28, z + 0.08));
    group.add(bc(0.55, 0.12, 0.42, "white_fix", x + w - 0.7, y + 0.28, z + 0.08));
    // Bedside tables
    group.add(bc(0.42, 0.5, 0.42, "furniture2", x - 0.5, y, z + 0.3));
    group.add(bc(0.42, 0.5, 0.42, "furniture2", x + w + 0.08, y, z + 0.3));
}

function buildSofa(group, x, y, z, w = 3, d = 1.0) {
    group.add(bc(w, 0.42, d, "furniture", x, y, z));
    group.add(bc(w, 0.55, 0.25, "furniture2", x, y + 0.42, z));
    group.add(bc(0.25, 0.55, d, "furniture2", x, y + 0.42, z));
    group.add(bc(0.25, 0.55, d, "furniture2", x + w - 0.25, y + 0.42, z));
}

function buildTV(group, x, y, z, w = 1.5) {
    group.add(bc(w, 0.82, 0.06, "col", x, y, z));
    group.add(bc(w - 0.1, 0.72, 0.04, "chrome", x + 0.05, y + 0.05, z + 0.06));
    // Stand
    group.add(bc(0.12, 0.4, 0.25, "col", x + w / 2 - 0.06, y - 0.4, z + 0.1));
}

function buildCar(group, x, y, z, color = 0x4a6888) {
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 4.5), bodyMat);
    body.position.set(x + 0.95, y + 0.65, z + 2.25);
    group.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 2.5), bodyMat);
    cab.position.set(x + 0.95, y + 1.35, z + 1.6);
    group.add(cab);
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x88ccee, transparent: true, opacity: 0.5 });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 2.3), glassMat);
    glass.position.set(x + 0.95, y + 1.4, z + 1.6);
    group.add(glass);
    [[x + 0.3, z + 0.5], [x + 1.6, z + 0.5], [x + 0.3, z + 4.0], [x + 1.6, z + 4.0]].forEach(([wx, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.18, 12), getMat("col"));
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, y + 0.32, wz);
        group.add(w);
    });
}

function buildKitchenCounter(group, x, y, z, w, d, matK = "furniture") {
    group.add(bc(w, 0.88, d, matK, x, y, z));
    group.add(bc(w, 0.04, d + 0.04, "white_fix", x, y + 0.88, z - 0.02));
}

function buildIsland(group, x, y, z) {
    group.add(bc(2.0, 0.9, 0.95, "furniture2", x, y, z));
    group.add(bc(2.04, 0.04, 0.99, "white_fix", x - 0.02, y + 0.9, z - 0.02));
    // Stools
    for (let i = 0; i < 3; i++) {
        group.add(cyl(0.16, 0.72, "furniture", x + 0.3 + i * 0.65, y, z - 0.55));
        group.add(sphere(0.17, "furniture2", x + 0.3 + i * 0.65, y + 0.72, z - 0.55));
    }
}

// ─── WINDOW OPENING (glass pane) ──────────────────────────────────────────────
function glassPane(group, x, y, z, w, h, axis = "z") {
    if (axis === "z") group.add(bc(w, h, 0.06, "glass", x, y, z - 0.03));
    else group.add(bc(0.06, h, w, "glass", x - 0.03, y, z));
}

// ─── MAIN SCENE BUILDER ───────────────────────────────────────────────────────
export function buildAllGroups(scene) {
    const G = {};
    const keys = ["lot", "fence", "ss_struct", "ss_rooms", "ss_furniture", "ss_labels",
        "rdc_struct", "rdc_rooms", "rdc_furniture", "rdc_labels",
        "r1", "r2", "columns", "exterior", "ext_furniture", "labels_global"];
    keys.forEach(k => { G[k] = new THREE.Group(); scene.add(G[k]); });

    const a = (grp, m) => G[grp].add(m);

    // ═══════════════════════════════════════════════════════════════
    // LOT — ground & garden
    // ═══════════════════════════════════════════════════════════════
    // Main ground
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(LW, LD), getMat("garden"));
    gnd.rotation.x = -Math.PI / 2; gnd.position.set(LW / 2, -0.02, LD / 2);
    gnd.receiveShadow = true; a("lot", gnd);

    // Street / sidewalk in front
    a("lot", bc(LW, 0.04, 2, "paving2", 0, -0.02, -2));

    // Allée dallée (x: 1.5 to 10, z: 0 to HZ)
    a("lot", bc(8.5, 0.06, HZ, "paving", 1.5, 0, 0));
    // Garden strip right of allee
    a("lot", bc(3, 0.06, HZ, "garden2", 10, 0, 0));
    // Left garden strip
    a("lot", bc(HX, 0.06, HZ, "garden2", 0, 0, 0));

    // Front garden trees
    buildTree(G["lot"], 0.9, 1.5, 3.5);
    buildTree(G["lot"], 0.9, 4.5, 3.2);
    buildTree(G["lot"], 11.5, 2, 3.8);
    buildTree(G["lot"], 13.5, 3.5, 3.2);

    // Left side garden strip (all the way back)
    a("lot", bc(HX, 0.06, HD + 5, "garden", 0, 0, HZ));
    buildTree(G["lot"], 0.9, 8, 3.5);
    buildTree(G["lot"], 0.9, 12, 3.0);
    buildTree(G["lot"], 0.9, 16, 3.8);

    // Rear garden
    a("lot", bc(HW, 0.08, LD - (HZ + HD), "garden", HX, 0, HZ + HD));
    // Rear terrace dallée
    a("lot", bc(HW, 0.1, 1.2, "paving", HX, 0, HZ + HD));
    // Rear garden plants
    buildTree(G["lot"], 8.5, HZ + HD + 2.5, 4.0);
    buildTree(G["lot"], 11.5, HZ + HD + 1.8, 3.5);

    // ═══════════════════════════════════════════════════════════════
    // POOL
    // ═══════════════════════════════════════════════════════════════
    const PX = HX + 0.8, PZ = HZ + HD + 1.5, PW = 5, PD = 3.2, PD_DEEP = 1.5;
    // Shell
    a("exterior", bc(PW, PD_DEEP + 0.25, PD, "pool_wall", PX, -PD_DEEP, PZ));
    // Water
    a("exterior", bc(PW - 0.24, 0.08, PD - 0.24, "pool_water", PX + 0.12, -0.12, PZ + 0.12));
    // Pool edge
    [[PX - 0.12, PZ - 0.12, PW + 0.24, 0.22, 0.18],
    [PX - 0.12, PZ + PD - 0.06, PW + 0.24, 0.22, 0.18],
    [PX - 0.12, PZ - 0.06, 0.18, 0.22, PD + 0.12],
    [PX + PW - 0.06, PZ - 0.06, 0.18, 0.22, PD + 0.12]].forEach(([ex, ez, ew, eh, ed]) => {
        a("exterior", bc(ew, eh, ed, "paving2", ex, 0, ez));
    });
    a("exterior", makeLabel("PISCINE 5×3.2m", PX + PW / 2, 0.9, PZ + PD / 2, "#44aadd", 0.28));

    // ═══════════════════════════════════════════════════════════════
    // OUTDOOR KITCHEN
    // ═══════════════════════════════════════════════════════════════
    const OKX = HX + 7, OKZ = HZ + HD + 1.2, OKW = 3.5, OKD = 2.8;
    a("exterior", bc(OKW, 2.2, OKD, "outdoor_k", OKX, 0, OKZ));
    a("exterior", bc(OKW + 0.1, 0.06, OKD + 0.1, "concrete", OKX - 0.05, 2.2, OKZ - 0.05));
    // Auvent posts
    [[OKX + 0.1, OKZ + 0.1], [OKX + OKW - 0.1, OKZ + 0.1], [OKX + 0.1, OKZ + OKD], [OKX + OKW - 0.1, OKZ + OKD]].forEach(([px, pz]) => {
        a("exterior", bc(0.12, 3.2, 0.12, "wood", px, 0, pz));
    });
    a("exterior", bc(OKW + 0.4, 0.1, OKD + 0.4, "roof_tile", OKX - 0.2, 3.2, OKZ - 0.2));
    // Wood/charcoal stove
    a("ext_furniture", bc(0.7, 0.65, 0.7, "col", OKX + 0.2, 2.2, OKZ + 0.4));
    a("ext_furniture", makeLabel("Cuisine Ext. Bois", OKX + OKW / 2, 3.8, OKZ + OKD / 2, "#d4a840", 0.25));

    // ═══════════════════════════════════════════════════════════════
    // SECURITY POST (x:0 to 1.5, z:0.5 to 2.5)
    // ═══════════════════════════════════════════════════════════════
    a("exterior", bc(1.5, 2.5, 2.0, "secu", 0, 0, 0.5));
    a("exterior", bc(1.7, 0.12, 2.2, "concrete", -0.1, 2.5, 0.4));  // roof
    // Window
    glassPane(G["exterior"], 0.3, 1.0, 0.5, 0.8, 1.0, "z");
    // Gate post
    a("exterior", bc(0.22, 2, 0.22, "concrete", 1.5, 0, 0.5));
    a("exterior", bc(0.22, 2, 0.22, "concrete", 1.5, 0, 2.0));
    // Gate (simple bar fence)
    for (let i = 0; i < 5; i++) a("exterior", bc(0.06, 1.9, 0.06, "steel", 1.74 + i * 0.55, 0, 0.5));
    a("exterior", bc(3, 0.06, 0.06, "steel", 1.5, 1.85, 0.5));
    a("exterior", makeLabel("Gardien", 0.75, 3.2, 1.5, "#b8c890", 0.22));

    // ═══════════════════════════════════════════════════════════════
    // FENCE / CLÔTURE
    // ═══════════════════════════════════════════════════════════════
    // Front fence (with gate opening)
    for (let x = 0; x < LW; x += 0.6) {
        if (x >= 1.6 && x <= 4.8) continue; // gate opening
        a("fence", bc(0.52, 1.5, 0.18, "fence", x, 0, -0.09));
    }
    // Back fence
    for (let x = 0; x < LW; x += 0.6) a("fence", bc(0.52, 1.5, 0.18, "fence", x, 0, LD - 0.09));
    // Left fence
    for (let z = 0; z < LD; z += 0.6) a("fence", bc(0.18, 1.5, 0.52, "fence", -0.09, 0, z));
    // Right fence (voisin side)
    for (let z = 0; z < LD; z += 0.6) a("fence", bc(0.18, 1.2, 0.52, "fence2", LW - 0.09, 0, z));
    // Pillar at corners
    [[0, 0], [LW, 0], [0, LD], [LW, LD]].forEach(([fx, fz]) => {
        a("fence", bc(0.28, 1.8, 0.28, "concrete", fx - 0.14, 0, fz - 0.14));
    });

    // ═══════════════════════════════════════════════════════════════
    // STRUCTURAL COLUMNS R+2 (visible on exterior)
    // ═══════════════════════════════════════════════════════════════
    const colPos = [
        [HX, HZ], [HX + 4, HZ], [HX + 7, HZ], [HX + HW, HZ],
        [HX, HZ + 5], [HX + HW, HZ + 5],
        [HX, HZ + 8], [HX + HW, HZ + 8],
        [HX, HZ + HD], [HX + 4, HZ + HD], [HX + 7, HZ + HD], [HX + HW, HZ + HD],
    ];
    const totalH = R2_Y + R2_H + 0.5;
    colPos.forEach(([cx, cz]) => {
        a("columns", bc(0.28, totalH + SS_H, 0.28, "col", cx - 0.14, SS_BOT, cz - 0.14));
        a("columns", bc(0.38, 0.18, 0.38, "gold", cx - 0.19, 0, cz - 0.19));
        a("columns", bc(0.38, 0.18, 0.38, "gold", cx - 0.19, RDC_H + SLAB - 0.1, cz - 0.19));
    });

    // ═══════════════════════════════════════════════════════════════
    // RAMP
    // ═══════════════════════════════════════════════════════════════
    buildRamp(G["ss_struct"]);

    // ═══════════════════════════════════════════════════════════════
    // SOUS-SOL STRUCTURE
    // ═══════════════════════════════════════════════════════════════
    const SS_Y = SS_BOT;

    // Floor slab
    a("ss_struct", bc(HW, 0.25, HD, "slab", HX, SS_Y - 0.25, HZ));
    // Outer foundation walls (thick)
    [[HX - 0.3, SS_Y, HZ - 0.3, 0.3, SS_H, HD + 0.6],  // left
    [HX + HW, SS_Y, HZ - 0.3, 0.3, SS_H, HD + 0.6],   // right
    [HX - 0.3, SS_Y, HZ - 0.3, HW + 0.6, SS_H, 0.3],  // front
    [HX - 0.3, SS_Y, HZ + HD, HW + 0.6, SS_H, 0.3],   // back
    ].forEach(([x, y, z, w, h, d]) => a("ss_struct", bc(w, h, d, "concrete", x, y, z)));

    // Interior partition walls SS
    // Garage / buanderie divide (x=9)
    a("ss_struct", bc(0.2, SS_H, 6.5, "concrete_d", HX + 7 - 0.1, SS_Y, HZ));
    // Buanderie / WC (x=11)
    a("ss_struct", bc(0.2, SS_H, 3.2, "concrete_d", HX + 9.3 - 0.1, SS_Y, HZ));
    // Tech / buanderie horiz (z=8)
    a("ss_struct", bc(4.2, SS_H, 0.2, "concrete_d", HX + 6.8, SS_Y, HZ + 3 - 0.1));
    // VIP / service divide (z=11 inside)
    a("ss_struct", bc(HW - 0.3, SS_H, 0.2, "concrete_d", HX + 0.15, SS_Y, HZ + 6 - 0.1));
    // VIP / couloir divide
    a("ss_struct", bc(0.2, SS_H, 6.2, "concrete_d", HX + 9 - 0.1, SS_Y, HZ + 5.8));

    // Intermediate ceiling slab (also RDC floor)
    a("ss_struct", bc(HW, SLAB, HD, "slab", HX, -SLAB, HZ));

    // ═══════════════════════════════════════════════════════════════
    // SOUS-SOL ROOMS (floor surfaces + ceiling)
    // ═══════════════════════════════════════════════════════════════

    // GARAGE floor + walls
    a("ss_rooms", bc(7, 0.06, 6, "garage_fl", HX, SS_Y, HZ));
    a("ss_rooms", bc(7, SS_H - 0.3, 6, "concrete_d", HX + 0.2, SS_Y, HZ + 0.2));
    // Buanderie
    a("ss_rooms", bc(2.4, SS_H - 0.3, 3, "wall_int", HX + 7.2, SS_Y, HZ + 0.2));
    // WC SS
    a("ss_rooms", bc(1.4, SS_H - 0.3, 3, "sdb_wall", HX + 9.5, SS_Y, HZ + 0.2));
    // Local technique
    a("ss_rooms", bc(3.9, SS_H - 0.3, 3, "tech_wall", HX + 7.1, SS_Y, HZ + 3.1));
    // Pièce VIP (main space)
    a("ss_rooms", bc(8.8, SS_H - 0.3, 5.8, "vip_wall", HX + 0.2, SS_Y, HZ + 6.2));
    // Couloir SS
    a("ss_rooms", bc(1.8, SS_H - 0.3, 5.8, "wall_int", HX + 9.2, SS_Y, HZ + 6.2));

    // ═══════════════════════════════════════════════════════════════
    // SOUS-SOL FURNITURE & FIXTURES
    // ═══════════════════════════════════════════════════════════════

    // 2 Cars in garage
    buildCar(G["ss_furniture"], HX + 0.3, SS_Y + 0.06, HZ + 0.3, 0x3a5870);
    buildCar(G["ss_furniture"], HX + 3.8, SS_Y + 0.06, HZ + 0.3, 0x4a6040);

    // Garage sectional door frame
    a("ss_struct", bc(4.5, 2.5, 0.08, "steel", HX + 1.25, SS_Y, HZ - 0.04));

    // Buanderie — washer + dryer
    a("ss_furniture", bc(0.65, 0.88, 0.6, "chrome", HX + 7.3, SS_Y, HZ + 0.3));
    a("ss_furniture", bc(0.65, 0.88, 0.6, "concrete_d", HX + 8.0, SS_Y, HZ + 0.3));
    a("ss_furniture", bc(2.2, 0.04, 0.62, "white_fix", HX + 7.2, SS_Y + 0.88, HZ + 0.28));
    // Sink
    buildSink(G["ss_furniture"], HX + 7.5, SS_Y, HZ + 2.0);
    // Toilet
    buildToilet(G["ss_furniture"], HX + 9.8, SS_Y, HZ + 2.2);
    // Shower
    buildShower(G["ss_furniture"], HX + 9.6, SS_Y, HZ + 0.3, 0.9, 0.9);

    // Technical room equipment
    a("ss_furniture", bc(1.5, 1.8, 0.4, "col", HX + 7.3, SS_Y, HZ + 3.3)); // electrical board
    a("ss_furniture", bc(0.6, 0.8, 0.6, "tech_wall", HX + 9.0, SS_Y, HZ + 3.3)); // water heater
    a("ss_furniture", bc(1.0, 1.2, 0.8, "concrete_d", HX + 7.3, SS_Y, HZ + 4.5)); // generator

    // VIP ROOM — cinema setup
    a("ss_furniture", bc(6.5, 3.5, 0.18, "col", HX + 1.3, SS_Y, HZ + 6.4)); // big screen
    a("ss_furniture", bc(6.3, 3.2, 0.08, "chrome", HX + 1.4, SS_Y + 0.15, HZ + 6.42)); // screen surface
    // Cinema seats (3 rows)
    for (let row = 0; row < 3; row++) {
        for (let seat = 0; seat < 4; seat++) {
            a("ss_furniture", bc(0.55, 0.9, 0.7, "furniture", HX + 1.2 + seat * 1.6, SS_Y, HZ + 7.5 + row * 1.4));
            a("ss_furniture", bc(0.55, 0.55, 0.2, "furniture2", HX + 1.2 + seat * 1.6, SS_Y + 0.9, HZ + 7.5 + row * 1.4));
        }
    }

    // Stairs SS → RDC (main)
    buildStairs(G["ss_struct"], HX + 9.3, HZ + 6.5, HX + 11, HZ + 6.5, SS_Y, 0, 11, "stair_conc", "x");
    // Stairs dérobé (SS → Dressing)
    buildStairs(G["ss_struct"], HX + 6.2, HZ + HD - 2.0, HX + 6.2, HZ + HD - 0.5, SS_Y, 0, 11, "stair_conc", "z");

    // SS Labels
    a("ss_labels", makeLabel("GARAGE 42m²", HX + 3.5, SS_Y + SS_H - 0.3, HZ + 3, "#c8a820", 0.3));
    a("ss_labels", makeLabel("PIÈCE VIP 45m²", HX + 5, SS_Y + SS_H - 0.3, HZ + 9, "#d4b840", 0.35));
    a("ss_labels", makeLabel("Buanderie", HX + 8.3, SS_Y + SS_H - 0.3, HZ + 1.5, "#aaa080", 0.2));
    a("ss_labels", makeLabel("Technique", HX + 8.8, SS_Y + SS_H - 0.3, HZ + 4.5, "#9090a0", 0.2));
    a("ss_labels", makeLabel("WC/SDB", HX + 10.2, SS_Y + SS_H - 0.3, HZ + 1.5, "#88aabb", 0.2));

    // ═══════════════════════════════════════════════════════════════
    // RDC STRUCTURE (walls)
    // ═══════════════════════════════════════════════════════════════

    // ── Exterior walls (with window/door openings)
    const WH = RDC_H, WT = 0.28;

    // FRONT WALL (z = HZ) — left of entrance
    a("rdc_struct", bc(3, WH, WT, "wall_ext", HX, 0, HZ));
    // right of entrance + above
    a("rdc_struct", bc(2.8, WH, WT, "wall_ext", HX + 8.2, 0, HZ));
    // lintel over big salon opening
    a("rdc_struct", bc(5.2, 0.65, WT, "wall_ext", HX + 3, WH - 0.65, HZ));

    // BACK WALL (z = HZ+HD)
    a("rdc_struct", bc(3.8, WH, WT, "wall_ext", HX, 0, HZ + HD));
    // above suite door
    a("rdc_struct", bc(0.65, WH, WT, "wall_ext", HX + 3.8, 0, HZ + HD));
    a("rdc_struct", bc(2.5, WH, WT, "wall_ext", HX + 6.3, 0, HZ + HD));
    a("rdc_struct", bc(2.2, WH, WT, "wall_ext", HX + 9.5, 0, HZ + HD));
    // lintel sections
    a("rdc_struct", bc(HW, 0.5, WT, "wall_ext", HX, WH - 0.5, HZ + HD));

    // LEFT WALL (x = HX)
    a("rdc_struct", bc(WT, WH, 5, "wall_ext", HX, 0, HZ));          // day zone
    a("rdc_struct", bc(WT, WH, 3.5, "wall_ext", HX, 0, HZ + 10.5));    // night zone
    a("rdc_struct", bc(WT, 0.6, 1.5, "wall_ext", HX, WH - 0.6, HZ + 5)); // above suite window

    // RIGHT WALL (x = HX+HW)
    a("rdc_struct", bc(WT, WH, HD, "wall_ext", HX + HW, 0, HZ));

    // ── Interior partition walls
    // Hall / salon / cuisine vertical (x = HX+7)
    a("rdc_struct", bc(0.2, WH, 5, "wall_int", HX + 7 - 0.1, 0, HZ));    // hall area separator
    // Hall / WC / accès (x = HX+9)
    a("rdc_struct", bc(0.2, WH, 2, "wall_int", HX + 8.8 - 0.1, 0, HZ));
    a("rdc_struct", bc(0.2, WH, 2, "wall_int", HX + 10.5 - 0.1, 0, HZ));
    // Day/night separator corridor wall (z = HZ+5)
    a("rdc_struct", bc(HW, 0.2, 0.2, "wall_int", HX, WH - 0.2, HZ + 5)); // full-width top
    a("rdc_struct", bc(3, WH, 0.2, "wall_int", HX, 0, HZ + 5));         // left salon wall cont
    a("rdc_struct", bc(0.65, WH, 0.2, "wall_int", HX + 3, 0, HZ + 5));
    a("rdc_struct", bc(4, WH, 0.2, "wall_int", HX + 4, 0, HZ + 5));       // right
    // Couloir nuit (z = HZ+7 inner)
    a("rdc_struct", bc(HW, 0.2, 0.2, "wall_int", HX, 0, HZ + 7));
    a("rdc_struct", bc(HW, 0.2, 0.2, "wall_int", HX, 0, HZ + 8));
    // Night room dividers
    // Suite / SDB (x = HX+4)
    a("rdc_struct", bc(0.2, WH, 4, "wall_int", HX + 4 - 0.1, 0, HZ + 8));
    // SDB / ch2 (x = HX+6)
    a("rdc_struct", bc(0.2, WH, 4, "wall_int", HX + 6 - 0.1, 0, HZ + 8));
    // Ch2 / SDB2 (x = HX+8.5)
    a("rdc_struct", bc(0.2, WH, 4, "wall_int", HX + 8.5 - 0.1, 0, HZ + 8));
    // Ch3 / SDB2 internal
    a("rdc_struct", bc(0.2, WH, 2, "wall_int", HX + 10.5 - 0.1, 0, HZ + 8));
    // SDB suite / dressing horizontal
    a("rdc_struct", bc(2.2, WH, 0.2, "wall_int", HX + 4, 0, HZ + 10));
    // Cuisine / cellier
    a("rdc_struct", bc(4.2, 0.2, 0.2, "wall_int", HX + 6.8, 0, HZ + 6));
    // Kitchen back wall segment
    a("rdc_struct", bc(0.2, WH, 2.0, "wall_int", HX + 6.8 - 0.1, 0, HZ + 5));

    // ── Salon double-height continuation (extra height above WH)
    const DH_extra = SALON_H - WH;
    a("rdc_struct", bc(7, DH_extra, WT, "wall_ext", HX, WH, HZ));      // salon front extra
    a("rdc_struct", bc(WT, DH_extra, 5, "wall_ext", HX, WH, HZ));      // salon left extra
    a("rdc_struct", bc(0.2, DH_extra, 5, "wall_int", HX + 7 - 0.1, WH, HZ)); // salon right extra
    // Loft slab above hall/wc/acc_ss
    a("rdc_struct", bc(HW - 7, SLAB, 2, "slab", HX + 7, WH, HZ));
    // Ceiling slab RDC (excluding salon DH zone)
    a("rdc_struct", bc(HW, SLAB, HD - 2, "slab", HX, WH, HZ + 2));
    a("rdc_struct", bc(HW - 7, SLAB, 2, "slab", HX + 7, WH, HZ));

    // FRONT TERRACE structure
    a("rdc_struct", bc(8, 0.14, 2.0, "terrace_f", HX, -0.01, HZ - 2.0)); // terrace slab
    // Terrace cover (auvent) — posts + beam
    [[HX + 0.3, HZ - 1.9], [HX + 3.8, HZ - 1.9], [HX + 7.5, HZ - 1.9]].forEach(([px, pz]) => {
        a("rdc_struct", bc(0.18, WH + 0.3, 0.18, "wood", px, 0, pz));
    });
    a("rdc_struct", bc(8, 0.14, 0.2, "wood", HX, WH + 0.14, HZ - 1.9)); // beam front
    a("rdc_struct", bc(8, 0.1, 2.1, "roof_tile", HX, WH + 0.18, HZ - 2.0,)); // auvent panel
    a("rdc_struct", makeLabel("Terrasse Couverte 16m²", HX + 4, WH + 0.6, HZ - 0.8, "#e8c860", 0.28));

    // BACK TERRACE
    a("rdc_struct", bc(HW, 0.12, 1.2, "terrace_t", HX, -0.01, HZ + HD));

    // ═══════════════════════════════════════════════════════════════
    // GLASS PANES — big openings
    // ═══════════════════════════════════════════════════════════════
    // Salon front baies vitrées (3 panels)
    glassPane(G["rdc_struct"], HX + 3.1, 0.1, HZ, 1.5, SALON_H - 0.3, "z");
    glassPane(G["rdc_struct"], HX + 4.7, 0.1, HZ, 1.5, SALON_H - 0.3, "z");
    glassPane(G["rdc_struct"], HX + 6.3, 0.1, HZ, 0.6, SALON_H - 0.3, "z");
    // Salon back sliding
    glassPane(G["rdc_struct"], HX + 0.3, 0.2, HZ + HD - 0.1, 1.5, WH - 0.6, "z");
    glassPane(G["rdc_struct"], HX + 1.9, 0.2, HZ + HD - 0.1, 1.5, WH - 0.6, "z");
    // Suite left window
    glassPane(G["rdc_struct"], HX - 0.05, 0.9, HZ + 8.3, 1.8, 1.5, "x");
    // Kitchen windows
    glassPane(G["rdc_struct"], HX + 7.1, WH - 1.2, HZ + 5.1, 1.6, 1.0, "z");
    glassPane(G["rdc_struct"], HX + 9.3, WH - 1.2, HZ + 5.1, 1.4, 1.0, "z");
    // Chambre 2 back window
    glassPane(G["rdc_struct"], HX + 8.2, 0.9, HZ + HD - 0.05, 1.4, 1.3, "z");
    // Ch3 back
    glassPane(G["rdc_struct"], HX + 10.3, 0.9, HZ + HD - 0.05, 0.9, 1.3, "z");
    // SDB suite window
    glassPane(G["rdc_struct"], HX + 4.1, WH - 0.9, HZ + 8.1, 0.8, 0.7, "z");

    // ═══════════════════════════════════════════════════════════════
    // RDC ROOMS (colored floor zones)
    // ═══════════════════════════════════════════════════════════════

    // GRAND SALON (double height zone)
    a("rdc_rooms", bc(7 - 0.4, 0.06, 5 - 0.4, "salon_fl", HX + 0.2, 0, HZ + 0.2));
    // Hall
    a("rdc_rooms", bc(4 - 0.4, 0.06, 2 - 0.3, "floor_tile", HX + 3 + 0.2, 0, HZ + 0.15));
    // WC visiteur
    a("rdc_rooms", bc(1.5 - 0.3, 0.06, 2 - 0.3, "sdb_wall", HX + 7 + 0.15, 0, HZ + 0.15));
    // Accès SS
    a("rdc_rooms", bc(2.5 - 0.3, 0.06, 2 - 0.3, "floor_tile", HX + 8.8 + 0.15, 0, HZ + 0.15));
    // Cuisine
    a("rdc_rooms", bc(4 - 0.4, 0.06, 4 - 0.4, "cuisine_fl", HX + 7 + 0.2, 0, HZ + 0.2));
    // Cellier
    a("rdc_rooms", bc(4 - 0.4, 0.06, 1 - 0.2, "floor_tile", HX + 7 + 0.2, 0, HZ + 6 + 0.1));
    // Couloir nuit
    a("rdc_rooms", bc(HW - 0.4, 0.06, 1 - 0.2, "floor_ceramic", HX + 0.2, 0, HZ + 7 + 0.1));
    // Suite parentale
    a("rdc_rooms", bc(4 - 0.4, 0.06, 4 - 0.4, "floor_wood", HX + 0.2, 0, HZ + 8 + 0.2));
    // SDB suite
    a("rdc_rooms", bc(2 - 0.3, 0.06, 2 - 0.3, "sdb_wall", HX + 4 + 0.15, 0, HZ + 8 + 0.15));
    // Dressing
    a("rdc_rooms", bc(2 - 0.3, 0.06, 2 - 0.3, "floor_tile", HX + 4 + 0.15, 0, HZ + 10 + 0.15));
    // Chambre 2
    a("rdc_rooms", bc(2.5 - 0.4, 0.06, 4 - 0.4, "floor_wood", HX + 6 + 0.2, 0, HZ + 8 + 0.2));
    // SDB 2
    a("rdc_rooms", bc(2 - 0.3, 0.06, 2 - 0.3, "sdb_wall", HX + 8.5 + 0.15, 0, HZ + 8 + 0.15));
    // Chambre 3
    a("rdc_rooms", bc(2.5 - 0.4, 0.06, 2 - 0.3, "floor_wood", HX + 8.5 + 0.2, 0, HZ + 10 + 0.15));

    // ═══════════════════════════════════════════════════════════════
    // RDC FURNITURE & FIXTURES
    // ═══════════════════════════════════════════════════════════════

    // SALON
    buildSofa(G["rdc_furniture"], HX + 0.4, 0.06, HZ + 1.5, 3.2, 1.0);
    buildSofa(G["rdc_furniture"], HX + 0.4, 0.06, HZ + 3.8, 1.5, 0.9);  // side sofa
    buildTV(G["rdc_furniture"], HX + 5.0, 0.65, HZ + 0.4, 1.8);
    // Coffee table
    a("rdc_furniture", bc(1.2, 0.42, 0.65, "furniture2", HX + 1.8, 0.06, HZ + 2.6));
    // Rug (colored floor)
    a("rdc_furniture", bc(3.5, 0.02, 2.5, "red_acc", HX + 0.5, 0.07, HZ + 1.4));
    // Floor lamp
    a("rdc_furniture", cyl(0.04, 1.8, "chrome", HX + 6.4, 0.06, HZ + 4.2));

    // CUISINE
    buildKitchenCounter(G["rdc_furniture"], HX + 7.1, 0, HZ + 0.2, 0.7, 0.7, "furniture2"); // hob
    buildKitchenCounter(G["rdc_furniture"], HX + 7.1, 0, HZ + 1.0, 0.7, 3.2, "furniture");  // back counter
    buildKitchenCounter(G["rdc_furniture"], HX + 9.5, 0, HZ + 0.2, 3.0, 0.7, "furniture");  // side counter
    buildIsland(G["rdc_furniture"], HX + 7.3, 0, HZ + 2.5);
    // Hotte
    a("rdc_furniture", bc(0.65, 0.4, 0.6, "chrome", HX + 7.15, 1.4, HZ + 0.25));

    // HALL - entry
    a("rdc_furniture", bc(0.55, 1.0, 0.28, "furniture", HX + 3.2, 0, HZ + 0.15)); // shoe cabinet
    a("rdc_furniture", bc(0.5, 0.8, 0.5, "furniture2", HX + 7.0, 0, HZ + 0.2));   // entry closet

    // WC VISITEUR
    buildToilet(G["rdc_furniture"], HX + 7.3, 0, HZ + 1.2, Math.PI);
    buildSink(G["rdc_furniture"], HX + 7.3, 0, HZ + 0.2);

    // SUITE PARENTALE
    buildBed(G["rdc_furniture"], HX + 0.3, 0.06, HZ + 9.0, 2.0, 2.2, "furniture");
    a("rdc_furniture", bc(1.8, 1.8, 0.25, "furniture", HX + 0.3, 0, HZ + 8.3)); // wardrobe
    a("rdc_furniture", bc(1.8, 1.8, 0.25, "furniture2", HX + 0.3, 0, HZ + 11.5)); // wardrobe 2

    // SDB SUITE
    buildShower(G["rdc_furniture"], HX + 4.1, 0, HZ + 8.2, 0.95, 0.95);
    buildBathtub(G["rdc_furniture"], HX + 4.1, 0, HZ + 9.4);
    buildToilet(G["rdc_furniture"], HX + 5.4, 0, HZ + 8.2, Math.PI / 2);
    buildSink(G["rdc_furniture"], HX + 5.6, 0, HZ + 9.6);

    // DRESSING — shelving
    for (let i = 0; i < 3; i++) {
        a("rdc_furniture", bc(1.8, 1.6, 0.45, "furniture", HX + 4.1, 0, HZ + 10.2 + i * 0.0));
    }
    // Dérobé stair opening (floor hatch visual)
    a("rdc_furniture", bc(1.2, 0.06, 1.2, "col", HX + 4.5, 0.01, HZ + 11.0));

    // CHAMBRE 2
    buildBed(G["rdc_furniture"], HX + 6.2, 0.06, HZ + 9.0, 1.8, 2.0, "furniture");
    a("rdc_furniture", bc(1.8, 1.6, 0.25, "furniture2", HX + 6.2, 0, HZ + 8.3));

    // SDB 2
    buildShower(G["rdc_furniture"], HX + 8.6, 0, HZ + 8.2, 0.9, 0.9);
    buildToilet(G["rdc_furniture"], HX + 9.5, 0, HZ + 8.2, Math.PI / 2);
    buildSink(G["rdc_furniture"], HX + 9.8, 0, HZ + 9.6);

    // CHAMBRE 3
    buildBed(G["rdc_furniture"], HX + 8.8, 0.06, HZ + 10.3, 1.6, 1.9, "furniture");

    // Stairs RDC → SS (main)
    buildStairs(G["rdc_struct"], HX + 9.3, HZ + 0.3, HX + 11, HZ + 0.3, 0, -SS_BOT, 11, "stair_conc", "x");
    // Stairs RDC → R+1 (future trémie)
    a("rdc_struct", bc(1.4, 0.1, 1.8, "gold", HX + 4.3, WH - 0.05, HZ + 10.2));
    a("rdc_struct", makeLabel("▲ Trémie R+1", HX + 5, WH + 0.3, HZ + 11.0, "#4488cc", 0.22));

    // ═══════════════════════════════════════════════════════════════
    // RDC LABELS
    // ═══════════════════════════════════════════════════════════════
    a("rdc_labels", makeLabel("GRAND SALON ★ 35m²", HX + 3.5, SALON_H + 0.3, HZ + 2.5, "#ffe880", 0.38));
    a("rdc_labels", makeLabel("Cuisine + Îlot 16m²", HX + 9, RDC_H + 0.3, HZ + 2.5, "#88dd88", 0.28));
    a("rdc_labels", makeLabel("Suite Parentale", HX + 2, RDC_H + 0.3, HZ + 10, "#ffaaaa", 0.28));
    a("rdc_labels", makeLabel("SDB Suite", HX + 5, RDC_H + 0.3, HZ + 9, "#88bbdd", 0.22));
    a("rdc_labels", makeLabel("Dressing", HX + 5, RDC_H + 0.3, HZ + 11, "#cc99ee", 0.22));
    a("rdc_labels", makeLabel("Chambre 2", HX + 7, RDC_H + 0.3, HZ + 10, "#aaaaee", 0.25));
    a("rdc_labels", makeLabel("Chambre 3", HX + 9.8, RDC_H + 0.3, HZ + 11, "#aaaaee", 0.22));
    a("rdc_labels", makeLabel("Hall Entrée", HX + 5, RDC_H + 0.3, HZ + 0.8, "#e8d890", 0.22));
    a("rdc_labels", makeLabel("Couloir Nuit", HX + 6.5, RDC_H + 0.3, HZ + 7.5, "#d0c8a0", 0.22));
    a("rdc_labels", makeLabel("Cellier", HX + 9, RDC_H + 0.3, HZ + 6.4, "#b0a880", 0.2));

    // ═══════════════════════════════════════════════════════════════
    // R+1 FUTURE
    // ═══════════════════════════════════════════════════════════════
    const R1Y = RDC_H + SLAB;
    // Ghost volume
    a("r1", bc(HW, R1_H, HD, "ghost_r1", HX, R1Y, HZ));
    a("r1", bc(HW, R1_H, HD, "wire_r1", HX, R1Y, HZ));
    a("r1", bc(HW, SLAB, HD, "future_slab", HX, R1Y + R1_H, HZ));
    a("r1", makeLabel("R+1 — Structure prévue", HX + HW / 2, R1Y + R1_H / 2 + 0.5, HZ + HD / 2, "#4499cc", 0.35));
    // Trémie visual
    a("r1", bc(1.4, R1_H + 0.2, 1.8, "col", HX + 4.3, R1Y - 0.1, HZ + 10.2));

    // ═══════════════════════════════════════════════════════════════
    // R+2 FUTURE
    // ═══════════════════════════════════════════════════════════════
    const R2Y = R1Y + R1_H + SLAB;
    a("r2", bc(HW, R2_H, HD, "ghost_r2", HX, R2Y, HZ));
    a("r2", bc(HW, R2_H, HD, "wire_r2", HX, R2Y, HZ));
    // Hip roof
    const roofPeak = R2Y + R2_H + 2.2;
    const roofGeo = new THREE.ConeGeometry(7.8, 2.8, 4);
    const roofMesh = new THREE.Mesh(roofGeo, getMat("roof_tile"));
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.set(HX + HW / 2, roofPeak - 1.4, HZ + HD / 2);
    G["r2"].add(roofMesh);
    a("r2", makeLabel("R+2 — Toiture Finale", HX + HW / 2, roofPeak + 0.6, HZ + HD / 2, "#aa66ee", 0.32));

    return G;
}

// ─── CAMERA PRESETS ───────────────────────────────────────────────────────────
const CAM_PRESETS = [
    { name: "Perspective", theta: -0.5, phi: 0.75, r: 42, tx: 7.5, ty: 3, tz: 10 },
    { name: "Façade Avant", theta: 0, phi: 1.1, r: 30, tx: 7.5, ty: 2, tz: 11 },
    { name: "Jardin Arrière", theta: Math.PI, phi: 1.0, r: 28, tx: 7.5, ty: 2, tz: 11 },
    { name: "Vue Aérienne", theta: -0.4, phi: 0.25, r: 38, tx: 7.5, ty: 0, tz: 11 },
    { name: "Sous-sol", theta: -0.5, phi: 0.85, r: 30, tx: 7.5, ty: -2, tz: 11 },
    { name: "Intérieur", theta: 0.3, phi: 1.2, r: 16, tx: 5, ty: 1, tz: 10 },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const TOGGLES = [
    { key: "lot", label: "Terrain / Jardin", color: "#3a8020" },
    { key: "fence", label: "Clôtures", color: "#9a8040" },
    { key: "exterior", label: "Piscine + Ext.", color: "#2299aa" },
    { key: "ext_furniture", label: "Mobilier ext.", color: "#c8a040" },
    { key: "ss_struct", label: "SS Structure", color: "#c8a020" },
    { key: "ss_rooms", label: "SS Pièces", color: "#d4b030" },
    { key: "ss_furniture", label: "SS Mobilier", color: "#e0c050" },
    { key: "ss_labels", label: "SS Labels", color: "#e8d070" },
    { key: "rdc_struct", label: "RDC Structure", color: "#60b840" },
    { key: "rdc_rooms", label: "RDC Pièces", color: "#70c850" },
    { key: "rdc_furniture", label: "RDC Mobilier", color: "#88d868" },
    { key: "rdc_labels", label: "RDC Labels", color: "#a0e880" },
    { key: "columns", label: "Poteaux R+2", color: "#d4a030" },
    { key: "r1", label: "R+1 Futur", color: "#4488cc" },
    { key: "r2", label: "R+2 + Toiture", color: "#9944cc" },
    { key: "labels_global", label: "Labels globaux", color: "#d0d0d0" },
];

export default function Villa3DFull() {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const groupsRef = useRef(null);
    const camRef = useRef({ theta: -0.5, phi: 0.75, r: 42, tx: 7.5, ty: 3, tz: 11 });
    const rendRef = useRef(null);
    const animRef = useRef(null);

    const [isDark, setIsDark] = useState(false);
    const [isTransparent, setIsTransparent] = useState(false);
    const [vis, setVis] = useState(() => {
        const v = {};
        TOGGLES.forEach(t => { v[t.key] = true; });
        return v;
    });

    const t = isDark 
        ? { bg: 0x14110e, fog: 0x14110e, sun: 0xfff8e8, sunInt: 1.6, fill: 0x445566, header: "#1a1610", border: "#2e2818", panel: "#0e0c08", text: "#c8a840", subText: "#5a4a20" }
        : { bg: 0xf0f4f8, fog: 0xf0f4f8, sun: 0xffffff, sunInt: 1.2, fill: 0xffffff, header: "#ffffff", border: "#d1d9e6", panel: "rgba(255,255,255,0.9)", text: "#2c3e50", subText: "#7a6840" };
    const [activePreset, setActivePreset] = useState(0);
    const [showPanel, setShowPanel] = useState(true);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;
        const W = container.clientWidth, H = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x14110e);
        scene.fog = new THREE.FogExp2(0x14110e, 0.009);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        rendRef.current = renderer;

        // Lights
        scene.add(new THREE.AmbientLight(0xfff0e0, 0.65));
        const sun = new THREE.DirectionalLight(0xfff8e8, 1.5);
        sun.position.set(30, 45, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        Object.assign(sun.shadow.camera, { near: 1, far: 150, left: -25, right: 25, top: 30, bottom: -30 });
        scene.add(sun);
        
        const fill = new THREE.DirectionalLight(0xaaccff, 0.35);
        fill.position.set(-20, 15, -15);
        scene.add(fill);

        // Build
        const groups = buildAllGroups(scene);
        
        // Extended ground (part of lot group)
        const eg = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshLambertMaterial({ color: 0x1e2e0e, transparent: true }));
        eg.rotation.x = -Math.PI / 2; eg.position.set(7.5, -0.05, 10); eg.receiveShadow = true;
        groups["lot"].add(eg);
        const grid = new THREE.GridHelper(120, 120, 0x1c1a10, 0x161410);
        grid.position.set(7.5, -0.01, 10); groups["lot"].add(grid);

        groupsRef.current = { ...groups, scene, sun, fill, grid };

        // Camera control
        let down = false, lx = 0, ly = 0;
        const getXY = e => e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
        const updateCam = () => {
            const { theta, phi, r, tx, ty, tz } = camRef.current;
            camera.position.set(
                tx + r * Math.sin(phi) * Math.sin(theta),
                ty + r * Math.cos(phi),
                tz + r * Math.sin(phi) * Math.cos(theta)
            );
            camera.lookAt(tx, ty, tz);
        };
        updateCam();

        const onDown = e => { down = true;[lx, ly] = getXY(e); };
        const onUp = () => { down = false; };
        const onMove = e => {
            if (!down) return;
            const [cx, cy] = getXY(e);
            camRef.current.theta -= (cx - lx) * 0.007;
            camRef.current.phi = Math.max(0.06, Math.min(1.5, camRef.current.phi + (cy - ly) * 0.007));
            lx = cx; ly = cy; updateCam();
        };
        const onWheel = e => {
            e.preventDefault();
            camRef.current.r = Math.max(4, Math.min(80, camRef.current.r + e.deltaY * 0.05));
            updateCam();
        };

        renderer.domElement.addEventListener("mousedown", onDown);
        renderer.domElement.addEventListener("touchstart", onDown, { passive: true });
        window.addEventListener("mouseup", onUp);
        window.addEventListener("touchend", onUp);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onMove, { passive: true });
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

        animRef.current = requestAnimationFrame(function loop() {
            animRef.current = requestAnimationFrame(loop);
            renderer.render(scene, camera);
        });

        const onResize = () => {
            const W = container.clientWidth, H = container.clientHeight;
            camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animRef.current);
            renderer.domElement.removeEventListener("mousedown", onDown);
            renderer.domElement.removeEventListener("touchstart", onDown);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchend", onUp);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("touchmove", onMove);
            renderer.domElement.removeEventListener("wheel", onWheel);
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(animRef.current);
            renderer.dispose();
            if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
        };
    }, []);

    // Visibility sync
    useEffect(() => {
        if (!groupsRef.current) return;
        TOGGLES.forEach(t => {
            if (groupsRef.current[t.key]) groupsRef.current[t.key].visible = vis[t.key];
        });
    }, [vis]);

    // Sync Theme
    useEffect(() => {
        if (!groupsRef.current) return;
        const { scene, sun, fill, grid } = groupsRef.current;
        scene.background.set(t.bg);
        scene.fog.color.set(t.bg);
        sun.color.set(t.sun);
        sun.intensity = t.sunInt;
        fill.color.set(t.fill);
        if (grid) {
            grid.material.color.set(isDark ? 0x1c1a10 : 0xd0d8e0);
        }
    }, [isDark, t]);

    // Transparency sync
    useEffect(() => {
        if (!groupsRef.current || !groupsRef.current.lot) return;
        groupsRef.current.lot.traverse(obj => {
            if (obj.isMesh && obj.material) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach(m => {
                    m.transparent = true;
                    m.opacity = isTransparent ? 0.25 : 1.0;
                    m.needsUpdate = true;
                });
            }
            if (obj.isLine || obj.isGridHelper) {
                obj.visible = !isTransparent;
            }
        });
    }, [isTransparent]);

    // Camera preset
    const applyPreset = useCallback((idx) => {
        const p = CAM_PRESETS[idx];
        camRef.current = { theta: p.theta, phi: p.phi, r: p.r, tx: p.tx, ty: p.ty, tz: p.tz };
        setActivePreset(idx);
    }, []);

    const toggleAll = (val) => {
        const v = {};
        TOGGLES.forEach(t => { v[t.key] = val; });
        setVis(v);
    };

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: "#10100e", fontFamily: "'Courier New',monospace", overflow: "hidden"
        }}>

            {/* TOP BAR */}
            <div style={{
                padding: "6px 14px", background: t.header, borderBottom: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flexShrink: 0,
                transition: "all 0.3s"
            }}>
                <div>
                    <div style={{ fontSize: 10, color: t.text, letterSpacing: 3, textTransform: "uppercase", transition: "color 0.3s" }}>
                        Villa Évolutive R+2 · Vue 3D Complète
                    </div>
                    <div style={{ fontSize: 7, color: isDark ? "#4a4030" : "#888", transition: "color 0.3s" }}>
                        Agovodou, Lomé · 300m² · SS + R+0 + structure R+1/R+2
                    </div>
                </div>

                {/* Camera presets */}
                <div style={{ display: "flex", gap: 2, marginLeft: 10, flexWrap: "wrap" }}>
                    {CAM_PRESETS.map((p, i) => (
                        <button key={i} onClick={() => applyPreset(i)} style={{
                            padding: "3px 8px", border: `1px solid ${i === activePreset ? t.text : isDark ? "#2a2418" : "#d1d9e6"}`,
                            background: i === activePreset ? (isDark ? "#2a2010" : "#fff") : (isDark ? "#0e0c08" : "#f8f9fa"),
                            color: i === activePreset ? t.text : (isDark ? "#666" : "#adb5bd"), fontSize: 7,
                            cursor: "pointer", fontFamily: "monospace", borderRadius: 4, transition: "all 0.2s"
                        }}>{p.name}</button>
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

                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    <button onClick={() => setShowPanel(p => !p)} style={{
                        padding: "3px 10px", border: `1px solid ${t.border}`, background: "none",
                        color: t.text, fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 4
                    }}>{showPanel ? "◀ Panel" : "▶ Panel"}</button>
                    <button onClick={() => setIsTransparent(!isTransparent)} style={{
                        padding: "3px 10px", border: `1px solid ${isTransparent ? t.text : t.border}`, 
                        background: isTransparent ? t.text : "none",
                        color: isTransparent ? t.header : t.text, fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 4
                    }}>{isTransparent ? "Mode Opaque" : "Mode Fantôme 👻"}</button>
                    <button onClick={() => toggleAll(true)} style={{ padding: "3px 8px", border: `1px solid ${t.border}`, background: "none", color: t.text, fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 4 }}>Tout ✓</button>
                    <button onClick={() => toggleAll(false)} style={{ padding: "3px 8px", border: `1px solid ${t.border}`, background: "none", color: t.text, fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 4 }}>Tout ✗</button>
                </div>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                {/* 3D CANVAS */}
                <div ref={mountRef} style={{
                    flex: 1, overflow: "hidden", position: "relative",
                    cursor: "grab"
                }}>
                    <div style={{
                        position: "absolute", bottom: 10, left: 10, fontSize: 7, color: "#3a3020",
                        fontFamily: "monospace", lineHeight: 2, pointerEvents: "none"
                    }}>
                        🖱 Glisser = rotation &nbsp;·&nbsp; Molette = zoom &nbsp;·&nbsp; Boutons haut = point de vue
                    </div>
                </div>

                {/* SIDE PANEL */}
                {showPanel && (
                    <div style={{
                        width: 210, background: t.panel, borderLeft: `1px solid ${t.border}`,
                        overflow: "auto", flexShrink: 0, padding: "8px 0", transition: "all 0.3s"
                    }}>
                        <div style={{
                            padding: "4px 12px 8px", fontSize: 8, color: t.subText,
                            letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${isDark ? "#1e1c10" : "#e9ecef"}`
                        }}>
                            Calques
                        </div>

                        {/* Group by category */}
                        {[
                            { title: "Extérieur & Terrain", keys: ["lot", "fence", "exterior", "ext_furniture"] },
                            { title: "Sous-sol (-1)", keys: ["ss_struct", "ss_rooms", "ss_furniture", "ss_labels"] },
                            { title: "RDC (0)", keys: ["rdc_struct", "rdc_rooms", "rdc_furniture", "rdc_labels"] },
                            { title: "Structure", keys: ["columns"] },
                            { title: "Futurs étages", keys: ["r1", "r2"] },
                        ].map(grp => (
                            <div key={grp.title} style={{ marginBottom: 4 }}>
                                <div style={{
                                    padding: "5px 12px", fontSize: 7, color: isDark ? "#4a4030" : "#888",
                                    background: isDark ? "#131208" : "#f8f9fa", letterSpacing: 1
                                }}>{grp.title}</div>
                                {grp.keys.map(key => {
                                    const t_toggle = TOGGLES.find(item => item.key === key);
                                    if (!t_toggle) return null;
                                    return (
                                        <div key={key}
                                            onClick={() => setVis(p => ({ ...p, [key]: !p[key] }))}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 8,
                                                padding: "5px 14px", cursor: "pointer",
                                                background: vis[key] ? "transparent" : (isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"),
                                                borderBottom: `1px solid ${isDark ? "#141210" : "#f1f3f5"}`,
                                                transition: "background 0.1s"
                                            }}>
                                            <div style={{
                                                width: 9, height: 9, flexShrink: 0,
                                                background: vis[key] ? t_toggle.color : (isDark ? "#222" : "#e9ecef"),
                                                border: `1px solid ${vis[key] ? t_toggle.color : (isDark ? "#333" : "#dee2e6")}`,
                                                transition: "all 0.15s"
                                            }} />
                                            <span style={{ fontSize: 8, color: vis[key] ? t.text : (isDark ? "#333" : "#adb5bd") }}>
                                                {t_toggle.label}
                                            </span>
                                            <span style={{
                                                marginLeft: "auto", fontSize: 7,
                                                color: vis[key] ? "#4a8" : "#422"
                                            }}>
                                                {vis[key] ? "✓" : "✗"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Quick combos */}
                        <div style={{ padding: "8px 10px", borderTop: `1px solid ${t.border}`, marginTop: 6 }}>
                            <div style={{ fontSize: 7, color: t.subText, letterSpacing: 1, marginBottom: 5 }}>VUES RAPIDES</div>
                            {[
                                {
                                    label: "SS Seul", fn: () => {
                                        const v = {}; TOGGLES.forEach(t => { v[t.key] = t.key.startsWith("ss"); });
                                        v["lot"] = true; v["fence"] = true; v["columns"] = true; setVis(v);
                                    }
                                },
                                {
                                    label: "RDC Seul", fn: () => {
                                        const v = {}; TOGGLES.forEach(t => { v[t.key] = t.key.startsWith("rdc"); });
                                        v["lot"] = true; v["fence"] = true; v["exterior"] = true; v["ext_furniture"] = true; v["columns"] = true; setVis(v);
                                    }
                                },
                                {
                                    label: "Structure uniquement", fn: () => {
                                        const v = {}; TOGGLES.forEach(t => { v[t.key] = false; });
                                        v["ss_struct"] = true; v["rdc_struct"] = true; v["columns"] = true; v["r1"] = true; v["r2"] = true;
                                        v["lot"] = true; v["fence"] = true; setVis(v);
                                    }
                                },
                                {
                                    label: "Sans mobilier", fn: () => {
                                        const v = { ...vis };
                                        v["ss_furniture"] = false; v["rdc_furniture"] = false; v["ext_furniture"] = false; setVis(v);
                                    }
                                },
                                { label: "Tout visible", fn: () => toggleAll(true) },
                            ].map(({ label, fn }) => (
                                <button key={label} onClick={fn} style={{
                                    display: "block", width: "100%", padding: "5px 8px", marginBottom: 3,
                                    border: `1px solid ${t.border}`, background: "none",
                                    color: isDark ? "#7a6840" : "#495057", fontSize: 7.5, cursor: "pointer", fontFamily: "monospace",
                                    textAlign: "left", borderRadius: 4, transition: "all 0.2s"
                                }}>{label}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
