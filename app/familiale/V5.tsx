// @ts-nocheck
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ─── DIMENSIONS ───────────────────────────────────────────────
const LW = 15, LD = 22;
const HX = 2, HZ = 5, HW = 11, HD = 12;
const SS_BOT = -3.5, SS_H = 3.5;
const RDC_H = 3.2, SALON_H = 5.5;
const SLAB = 0.28;
const R1_H = 3.2, R2_H = 3.2;

// ─── MATERIALS ────────────────────────────────────────────────
const _MAT = {};
const mkM = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const M = new Proxy(_MAT, {
    get(t, k) {
        if (!t[k]) {
            const D = {
                concrete: mkM(0x9a8f80), concrete_d: mkM(0x7a7060),
                wall_ext: mkM(0xd8cdb0), wall_int: mkM(0xede8dc),
                slab: mkM(0x8a8070), floor_tile: mkM(0xddd4b8),
                floor_ceramic: mkM(0xe8e0cc), floor_wood: mkM(0xc8a060),
                floor_epoxy: mkM(0x607080), roof_tile: mkM(0x7a3a22),
                glass: mkM(0x88ccee, { transparent: true, opacity: 0.22 }),
                glass_op: mkM(0x66aacc, { transparent: true, opacity: 0.2 }),
                steel: mkM(0x909898), wood: mkM(0xc09050),
                garden: mkM(0x3a7020), garden2: mkM(0x4a8028),
                paving: mkM(0xb0a888), paving2: mkM(0xc0b898),
                pool_wall: mkM(0x227799),
                pool_water: mkM(0x44aad8, { transparent: true, opacity: 0.82 }),
                salon_fl: mkM(0xc8b880), cuisine_fl: mkM(0xd0ccb0),
                floor_wood2: mkM(0xb89050),
                garage_fl: mkM(0x607078), ramp_str: mkM(0x807868),
                vip_wall: mkM(0xf8f0d8), tech_wall: mkM(0x808898),
                fence: mkM(0xaa9978), fence2: mkM(0xbbaa88),
                gold: mkM(0xd4a030), col: mkM(0x2a2018),
                outdoor_k: mkM(0xc8a040), secu: mkM(0xb8c8a0),
                ghost_r1: mkM(0x2266aa, { transparent: true, opacity: 0.15 }),
                ghost_r2: mkM(0x6622aa, { transparent: true, opacity: 0.12 }),
                wire_r1: mkM(0x44aaff, { transparent: true, opacity: 0.6, wireframe: true }),
                wire_r2: mkM(0xaa44ff, { transparent: true, opacity: 0.5, wireframe: true }),
                future_slab: mkM(0x4488bb, { transparent: true, opacity: 0.3 }),
                furniture: mkM(0xa07840), furniture2: mkM(0x806030),
                white_fix: mkM(0xf0f0f0), chrome: mkM(0xc8d0d0),
                red_acc: mkM(0xcc4422), stair_conc: mkM(0x9a9080),
                terrace_t: mkM(0xe0c860), terrace_f: mkM(0xcbb850),
                screen: mkM(0x1a1a2e), screen_surf: mkM(0x2a2a4e),
                sdb_tile: mkM(0xd0e8f0), sdb_floor: mkM(0xb8d4e8),
                seat: mkM(0x4a3a2a), seat2: mkM(0x3a2a1a),
            };
            t[k] = D[k] || mkM(0xff00ff);
        }
        return t[k];
    }
});

// ─── HELPERS ──────────────────────────────────────────────────
function bc(w, h, d, mat, x, y, z, cast = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M[mat]);
    m.position.set(x + w / 2, y + h / 2, z + d / 2);
    m.castShadow = cast; m.receiveShadow = true; return m;
}
function cy(r, h, mat, cx, cy_, cz, s = 8) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), M[mat]);
    m.position.set(cx, cy_, cz); m.castShadow = true; return m;
}
function sp(r, mat, cx, cy_, cz) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), M[mat]);
    m.position.set(cx, cy_, cz); return m;
}

function label3D(text, x, y, z, col = "#f0e0b0", sz = 0.35) {
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 128;
    const c = cv.getContext("2d");
    c.fillStyle = "rgba(10,8,4,0.88)";
    c.beginPath(); c.roundRect(3, 3, 506, 122, 10); c.fill();
    c.strokeStyle = col; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(3, 3, 506, 122, 10); c.stroke();
    c.fillStyle = col;
    c.font = "bold 48px 'Courier New',monospace";
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(text, 256, 64);
    const sp_ = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false
    }));
    sp_.position.set(x, y, z); sp_.scale.set(sz * 4, sz, 1); return sp_;
}

// ─── ARCHITECTURAL FIXTURES ───────────────────────────────────
function stairs(g, x1, z1, x2, z2, yB, yT, n, mat, dir = "x") {
    const sh = (yT - yB) / n;
    const sd = dir === "x" ? (x2 - x1) / n : (z2 - z1) / n;
    const sw = dir === "x" ? Math.abs(z2 - z1) : Math.abs(x2 - x1);
    for (let i = 0; i < n; i++) {
        const y_ = yB + i * sh;
        const m = dir === "x"
            ? bc(sd, sh + 0.05, sw, mat, x1 + i * sd, y_, Math.min(z1, z2))
            : bc(sw, sh + 0.05, sd, mat, Math.min(x1, x2), y_, z1 + i * sd);
        g.add(m);
    }
    // Handrail
    const rl = new THREE.Mesh(new THREE.BoxGeometry(dir === "x" ? x2 - x1 : sw + 0.1, 0.06, 0.06), M.steel);
    rl.position.set(
        dir === "x" ? (x1 + x2) / 2 : (Math.min(x1, x2)) + (x2 - x1) / 2,
        (yB + yT) / 2 + 0.85,
        dir === "x" ? (z1 + z2) / 2 + sw / 2 : (z1 + z2) / 2
    );
    g.add(rl);
}

function ramp(g) {
    const segs = 14, rW = 3.5, zS = 1.6, zE = HZ + 0.2, yS = -0.05, yE = SS_BOT + 0.1;
    for (let i = 0; i < segs; i++) {
        const t0 = i / segs, t1 = (i + 1) / segs;
        const z0 = zS + t0 * (zE - zS), z1 = zS + t1 * (zE - zS);
        const y0 = yS + t0 * (yE - yS);
        g.add(bc(rW, 0.2, z1 - z0, "ramp_str", HX, y0 - 0.2, z0));
    }
    g.add(bc(0.22, 1.5, zE - zS, "concrete_d", HX - 0.22, yE, zS));
    g.add(bc(0.22, 1.5, zE - zS, "concrete_d", HX + rW, yE, zS));
    g.add(bc(rW, 0.15, 0.18, "concrete", HX, 0, zS));
    // Direction arrow painted on ramp
}

function tree(g, x, z, h = 3) {
    g.add(cy(0.11, h * 0.5, "wood", x, h * 0.25, z));
    g.add(sp(h * 0.3, "garden2", x, h * 0.72, z));
    g.add(sp(h * 0.2, "garden", x - h * 0.16, h * 0.6, z));
    g.add(sp(h * 0.2, "garden", x + h * 0.16, h * 0.6, z));
    g.add(sp(h * 0.18, "garden2", x, h * 0.55, z + h * 0.16));
}

function toilet(g, x, y, z, ry = 0) {
    const gr = new THREE.Group();
    gr.add(bc(0.38, 0.44, 0.62, "white_fix", -0.19, 0, -0.31));
    gr.add(bc(0.38, 0.12, 0.22, "white_fix", -0.19, 0.44, -0.36)); // tank
    const sg = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 16), M.white_fix);
    sg.rotation.x = Math.PI / 2; sg.position.set(0, 0.46, -0.06);
    gr.add(sg);
    gr.rotation.y = ry; gr.position.set(x, y, z);
    g.add(gr);
}

function sink(g, x, y, z, wall = "z") {
    g.add(bc(0.52, 0.08, 0.4, "white_fix", x - 0.26, y + 0.83, z - 0.2));
    g.add(bc(0.08, 0.83, 0.08, "wall_int", x - 0.04, y, z - 0.1));
    g.add(cy(0.02, 0.14, "chrome", x, y + 0.97, z - 0.1));
}

function shower(g, x, y, z, w = 0.95, d = 0.95) {
    g.add(bc(w, 0.06, d, "sdb_tile", x, y, z));
    g.add(bc(w, 1.9, 0.05, "glass_op", x, y + 0.06, z));
    g.add(bc(0.05, 1.9, d, "glass_op", x, y + 0.06, z));
    g.add(cy(0.03, 0.5, "chrome", x + w * 0.6, y + 2.0, z + d * 0.5));
    g.add(sp(0.08, "chrome", x + w * 0.6, y + 2.2, z + d * 0.5));
}

function bathtub(g, x, y, z) {
    g.add(bc(1.75, 0.62, 0.82, "white_fix", x, y, z));
    g.add(bc(1.55, 0.46, 0.62, "sdb_tile", x + 0.1, y + 0.12, z + 0.1));
    g.add(cy(0.025, 0.18, "chrome", x + 0.3, y + 0.65, z + 0.15));
}

function bed(g, x, y, z, w = 2, d = 2.2) {
    g.add(bc(w, 0.3, d, "furniture", x, y, z));
    g.add(bc(w, 0.6, 0.25, "furniture2", x, y + 0.3, z)); // headboard
    g.add(bc(0.55, 0.14, 0.44, "white_fix", x + 0.18, y + 0.3, z + 0.08));
    g.add(bc(0.55, 0.14, 0.44, "white_fix", x + w - 0.73, y + 0.3, z + 0.08));
    g.add(bc(w, 0.08, d * 0.6, "white_fix", x, y + 0.3, z + d * 0.35)); // duvet
    g.add(bc(0.44, 0.52, 0.44, "furniture2", x - 0.52, y, z + 0.35));
    g.add(bc(0.44, 0.52, 0.44, "furniture2", x + w + 0.08, y, z + 0.35));
}

function sofa(g, x, y, z, w = 3, d = 1.0) {
    g.add(bc(w, 0.44, d, "furniture", x, y, z));
    g.add(bc(w, 0.6, 0.28, "furniture2", x, y + 0.44, z)); // back
    g.add(bc(0.28, 0.6, d, "furniture2", x, y + 0.44, z));
    g.add(bc(0.28, 0.6, d, "furniture2", x + w - 0.28, y + 0.44, z));
    // cushions
    for (let i = 0; i < Math.floor(w / 0.85); i++)
        g.add(bc(0.62, 0.18, 0.55, "furniture", x + 0.12 + i * 0.82, y + 0.55, z + 0.1));
}

function tv(g, x, y, z, w = 1.6) {
    g.add(bc(w, 0.88, 0.07, "col", x, y, z));
    g.add(bc(w - 0.1, 0.76, 0.04, "screen", x + 0.05, y + 0.06, z + 0.07));
    g.add(bc(0.1, 0.38, 0.22, "col", x + w / 2 - 0.05, y - 0.38, z + 0.05));
    g.add(bc(0.5, 0.06, 0.22, "col", x + w / 2 - 0.25, y - 0.42, z + 0.05));
}

function car(g, x, y, z, col = 0x3a5878) {
    const bM = new THREE.MeshLambertMaterial({ color: col });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.82, 4.6), bM);
    body.position.set(x + 0.96, y + 0.66, z + 2.3); g.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.68, 2.4), bM);
    cab.position.set(x + 0.96, y + 1.38, z + 1.6); g.add(cab);
    const glM = new THREE.MeshLambertMaterial({ color: 0x88ccee, transparent: true, opacity: 0.5 });
    const gl = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.58, 2.2), glM);
    gl.position.set(x + 0.96, y + 1.38, z + 1.6); g.add(gl);
    [[x + 0.32, z + 0.55], [x + 1.6, z + 0.55], [x + 0.32, z + 4.05], [x + 1.6, z + 4.05]].forEach(([wx, wz]) => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.18, 12), M.col);
        wh.rotation.z = Math.PI / 2; wh.position.set(wx, y + 0.34, wz); g.add(wh);
    });
}

function island(g, x, y, z) {
    g.add(bc(2.1, 0.92, 0.98, "furniture2", x, y, z));
    g.add(bc(2.14, 0.05, 1.02, "white_fix", x - 0.02, y + 0.92, z - 0.02));
    for (let i = 0; i < 3; i++) {
        g.add(cy(0.16, 0.75, "furniture", x + 0.35 + i * 0.7, y, z - 0.58));
        g.add(sp(0.18, "furniture2", x + 0.35 + i * 0.7, y + 0.75, z - 0.58));
    }
}

function glass(g, x, y, z, w, h, ax = "z") {
    const m = bc(ax === "z" ? w : 0.06, h, ax === "z" ? 0.06 : w, "glass",
        ax === "z" ? x : x - 0.03, y, z - 0.03);
    g.add(m);
}

// ─── SCENE BUILD ──────────────────────────────────────────────
function buildScene(scene, explodeY = 0) {
    const G = {};
    ["lot", "fence", "ss", "rdc", "r1", "r2", "columns", "exterior"].forEach(k => {
        G[k] = new THREE.Group(); scene.add(G[k]);
    });

    const a = (k, m) => G[k].add(m);

    // EXPLODE offsets
    const ssOff = explodeY * -6;
    const r1Off = explodeY * 5;
    const r2Off = explodeY * 10;

    // ── LOT ─────────────────────────────────────────────────────
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(LW, LD), M.garden);
    gnd.rotation.x = -Math.PI / 2; gnd.position.set(LW / 2, -0.02, LD / 2);
    gnd.receiveShadow = true; a("lot", gnd);

    // Street
    a("lot", bc(LW, 0.04, 2.5, "paving2", 0, -0.02, -2.5));
    // Allée
    a("lot", bc(8.5, 0.06, HZ, "paving", 1.5, 0, 0));
    a("lot", bc(HX, 0.06, HZ, "garden2", 0, 0, 0));
    a("lot", bc(3, 0.06, HZ, "garden2", 10, 0, 0));
    // Side garden
    a("lot", bc(HX, 0.06, HD + 5, "garden", 0, 0, HZ));
    // Rear garden
    a("lot", bc(HW, 0.08, LD - (HZ + HD), "garden", HX, 0, HZ + HD));
    a("lot", bc(HW, 0.1, 1.2, "paving", HX, 0, HZ + HD));
    // Trees
    [
        [0.9, 1.5, 3.8], [0.9, 4.5, 3.2], [12.0, 2.0, 4.0], [13.5, 3.5, 3.2],
        [0.9, 8.0, 3.5], [0.9, 12.0, 3.0], [0.9, 16.0, 3.8],
        [8.5, HZ + HD + 2.5, 4.2], [11.5, HZ + HD + 2.0, 3.5]
    ].forEach(([x, z, h]) => tree(G.lot, x, z, h));

    // ── FENCE ───────────────────────────────────────────────────
    for (let x = 0; x < LW; x += 0.65) {
        if (x >= 1.5 && x <= 5.0) continue; // gate opening
        a("fence", bc(0.55, 1.5, 0.18, "fence", x, 0, -0.09));
    }
    for (let x = 0; x < LW; x += 0.65) a("fence", bc(0.55, 1.5, 0.18, "fence", x, 0, LD - 0.09));
    for (let z = 0; z < LD; z += 0.65) a("fence", bc(0.18, 1.5, 0.55, "fence", -0.09, 0, z));
    for (let z = 0; z < LD; z += 0.65) a("fence", bc(0.18, 1.2, 0.55, "fence2", LW - 0.09, 0, z));
    [[0, 0], [LW, 0], [0, LD], [LW, LD]].forEach(([fx, fz]) =>
        a("fence", bc(0.3, 1.9, 0.3, "concrete", fx - 0.15, 0, fz - 0.15)));

    // ── POOL ────────────────────────────────────────────────────
    const PX = HX + 0.8, PZ = HZ + HD + 1.5, PW = 5, PD = 3.2;
    a("exterior", bc(PW, 1.75, PD, "pool_wall", PX, -1.75, PZ));
    a("exterior", bc(PW - 0.24, 0.08, PD - 0.24, "pool_water", PX + 0.12, -0.1, PZ + 0.12));
    // coping
    [[PX - 0.14, PZ - 0.14, PW + 0.28, 0.2, 0.16], [PX - 0.14, PZ + PD - 0.02, PW + 0.28, 0.2, 0.16],
    [PX - 0.14, PZ - 0.02, 0.16, 0.2, PD + 0.12], [PX + PW - 0.02, PZ - 0.02, 0.16, 0.2, PD + 0.12]
    ].forEach(([ex, ez, ew, eh, ed]) => a("exterior", bc(ew, eh, ed, "paving2", ex, 0, ez)));
    a("exterior", label3D("PISCINE 5×3.2m", PX + PW / 2, 0.9, PZ + PD / 2, "#44aadd", 0.28));

    // ── OUTDOOR KITCHEN ─────────────────────────────────────────
    const OKX = HX + 7.2, OKZ = HZ + HD + 1.3, OKW = 3.3, OKD = 2.6;
    a("exterior", bc(OKW, 2.2, OKD, "outdoor_k", OKX, 0, OKZ));
    a("exterior", bc(OKW + 0.1, 0.06, OKD + 0.1, "concrete", OKX - 0.05, 2.2, OKZ - 0.05));
    [[OKX + 0.1, OKZ + 0.1], [OKX + OKW - 0.1, OKZ + 0.1], [OKX + 0.1, OKZ + OKD], [OKX + OKW - 0.1, OKZ + OKD]].forEach(([px, pz]) =>
        a("exterior", bc(0.12, 3.0, 0.12, "wood", px, 0, pz)));
    a("exterior", bc(OKW + 0.5, 0.1, OKD + 0.5, "roof_tile", OKX - 0.25, 3.0, OKZ - 0.25));
    a("exterior", bc(0.7, 0.7, 0.7, "col", OKX + 0.25, 2.2, OKZ + 0.4)); // stove
    a("exterior", label3D("Cuisine Ext. (Bois)", OKX + OKW / 2, 3.8, OKZ + OKD / 2, "#d4a840", 0.26));

    // ── SECURITY POST ───────────────────────────────────────────
    a("exterior", bc(1.5, 2.6, 2.0, "secu", 0, 0, 0.5));
    a("exterior", bc(1.7, 0.12, 2.2, "concrete", -0.1, 2.6, 0.4));
    glass(G.exterior, 0.3, 1.0, 0.5, 0.8, 1.1, "z");
    a("exterior", bc(0.22, 2.1, 0.22, "concrete", 1.5, 0, 0.5));
    a("exterior", bc(0.22, 2.1, 0.22, "concrete", 1.5, 0, 2.0));
    for (let i = 0; i < 5; i++) a("exterior", bc(0.07, 2.0, 0.07, "steel", 1.76 + i * 0.58, 0, 0.5));
    a("exterior", bc(3.1, 0.07, 0.07, "steel", 1.5, 1.95, 0.5));
    a("exterior", label3D("Poste Gardien", 0.8, 3.4, 1.5, "#b8d890", 0.22));

    // ── STRUCTURAL COLUMNS ──────────────────────────────────────
    const colH = SS_BOT + (R2_H * 2 + RDC_H + SLAB * 3) + 8;
    [
        [HX, HZ], [HX + 4, HZ], [HX + 7, HZ], [HX + HW, HZ],
        [HX, HZ + 5], [HX + HW, HZ + 5],
        [HX, HZ + 8], [HX + HW, HZ + 8],
        [HX, HZ + HD], [HX + 4, HZ + HD], [HX + 7, HZ + HD], [HX + HW, HZ + HD],
    ].forEach(([cx, cz]) => {
        a("columns", bc(0.28, colH, 0.28, "col", cx - 0.14, SS_BOT, cz - 0.14));
        [0, RDC_H + SLAB - 0.1].forEach(y_ =>
            a("columns", bc(0.4, 0.18, 0.4, "gold", cx - 0.2, y_, cz - 0.2)));
    });

    // ═══════════════════════════════════════════════════
    // SOUS-SOL  (Y base = SS_BOT + ssOff)
    // ═══════════════════════════════════════════════════
    const SY = SS_BOT + ssOff; // explode offset applied

    const ssG = G.ss;
    ramp(ssG); // ramp always at ground level

    // Foundation slab
    ssG.add(bc(HW, 0.28, HD, "slab", HX, SY - 0.28, HZ));
    // Walls
    [[HX - 0.32, SY, HZ - 0.32, 0.32, SS_H, HD + 0.64],
    [HX + HW, SY, HZ - 0.32, 0.32, SS_H, HD + 0.64],
    [HX - 0.32, SY, HZ - 0.32, HW + 0.64, SS_H, 0.32],
    [HX - 0.32, SY, HZ + HD, HW + 0.64, SS_H, 0.32],
    ].forEach(([x, y, z, w, h, d]) => ssG.add(bc(w, h, d, "concrete", x, y, z)));

    // Interior walls SS
    ssG.add(bc(0.2, SS_H, 6.8, "concrete_d", HX + 7 - 0.1, SY, HZ));   // garage/service split
    ssG.add(bc(0.2, SS_H, 3.2, "concrete_d", HX + 9.3 - 0.1, SY, HZ)); // buand/wc
    ssG.add(bc(4.2, SS_H, 0.2, "concrete_d", HX + 6.8, SY, HZ + 3 - 0.1)); // tech/buand
    ssG.add(bc(HW - 0.3, SS_H, 0.2, "concrete_d", HX + 0.15, SY, HZ + 6 - 0.1)); // VIP/above
    ssG.add(bc(0.2, SS_H, 6.2, "concrete_d", HX + 9 - 0.1, SY, HZ + 5.8)); // couloir VIP

    // Ceiling/floor slab
    ssG.add(bc(HW, SLAB, HD, "slab", HX, SY + SS_H, HZ));

    // GARAGE — floor + 2 cars
    ssG.add(bc(7 - 0.3, 0.06, 6 - 0.3, "garage_fl", HX + 0.15, SY, HZ + 0.15));
    car(ssG, HX + 0.3, SY + 0.06, HZ + 0.3, 0x3a5870);
    car(ssG, HX + 3.85, SY + 0.06, HZ + 0.3, 0x3a5040);
    // Garage door frame
    ssG.add(bc(4.8, 2.6, 0.08, "steel", HX + 0.9, SY, HZ - 0.02));
    // Garage door panels
    ssG.add(bc(4.75, 0.65, 0.05, "concrete_d", HX + 0.9, SY + 1.95, HZ - 0.01));
    ssG.add(bc(4.75, 0.65, 0.05, "concrete_d", HX + 0.9, SY + 1.3, HZ - 0.01));
    ssG.add(bc(4.75, 0.65, 0.05, "concrete_d", HX + 0.9, SY + 0.65, HZ - 0.01));
    ssG.add(label3D("GARAGE 42m²", HX + 3.5, SY + SS_H - 0.5, HZ + 3, "#c8a820", 0.32));

    // BUANDERIE
    ssG.add(bc(2.4 - 0.3, SS_H - 0.3, 3 - 0.3, "wall_int", HX + 7.15, SY, HZ + 0.15));
    // machines
    ssG.add(bc(0.66, 0.9, 0.62, "chrome", HX + 7.3, SY, HZ + 0.3));
    ssG.add(bc(0.66, 0.9, 0.62, "furniture2", HX + 8.0, SY, HZ + 0.3));
    ssG.add(bc(2.2, 0.05, 0.64, "white_fix", HX + 7.2, SY + 0.9, HZ + 0.28));
    sink(ssG, HX + 7.5, SY, HZ + 2.1);
    ssG.add(bc(0.6, 1.4, 0.15, "concrete_d", HX + 7.15, SY, HZ + 0.15)); // ironing area
    ssG.add(label3D("Buanderie", HX + 8.3, SY + SS_H - 0.5, HZ + 1.5, "#aaa080", 0.22));

    // WC / SDB SS
    ssG.add(bc(1.5 - 0.3, SS_H - 0.3, 3 - 0.3, "sdb_tile", HX + 9.45, SY, HZ + 0.15));
    toilet(ssG, HX + 9.85, SY, HZ + 0.3, 0);
    shower(ssG, HX + 9.65, SY, HZ + 1.4, 0.88, 0.88);
    sink(ssG, HX + 10.2, SY, HZ + 2.2);
    ssG.add(label3D("SDB/WC", HX + 10.2, SY + SS_H - 0.5, HZ + 1.5, "#88aabb", 0.2));

    // LOCAL TECHNIQUE
    ssG.add(bc(3.9 - 0.3, SS_H - 0.3, 3 - 0.3, "tech_wall", HX + 7.05, SY, HZ + 3.15));
    ssG.add(bc(1.5, 1.8, 0.4, "col", HX + 7.2, SY, HZ + 3.3));   // tableau élec
    ssG.add(bc(0.65, 0.85, 0.65, "tech_wall", HX + 9.1, SY, HZ + 3.3)); // chauffe-eau
    ssG.add(bc(1.0, 1.2, 0.85, "concrete_d", HX + 7.2, SY, HZ + 4.5));  // groupe électrogène
    ssG.add(label3D("Local Technique", HX + 8.8, SY + SS_H - 0.5, HZ + 4.5, "#9090a8", 0.22));

    // VIP ROOM — Cinéma
    ssG.add(bc(8.8 - 0.3, SS_H - 0.3, 5.8 - 0.3, "vip_wall", HX + 0.15, SY, HZ + 6.15));
    ssG.add(bc(6.6, 3.5, 0.18, "col", HX + 1.2, SY, HZ + 6.4)); // screen wall
    ssG.add(bc(6.4, 3.2, 0.08, "screen_surf", HX + 1.3, SY + 0.15, HZ + 6.42)); // screen
    // 3 rows × 4 seats
    for (let row = 0; row < 3; row++) for (let s = 0; s < 4; s++) {
        ssG.add(bc(0.58, 0.92, 0.72, "seat", HX + 1.15 + s * 1.65, SY, HZ + 7.5 + row * 1.42));
        ssG.add(bc(0.58, 0.52, 0.22, "seat2", HX + 1.15 + s * 1.65, SY + 0.92, HZ + 7.5 + row * 1.42));
    }
    // Sub, projector
    ssG.add(bc(0.4, 0.28, 0.4, "col", HX + 4.5, SY + SS_H - 0.65, HZ + 6.8));
    ssG.add(label3D("PIÈCE VIP — Cinéma 45m²", HX + 5, SY + SS_H - 0.4, HZ + 9, "#d4b840", 0.36));

    // COULOIR SS
    ssG.add(bc(1.8 - 0.3, SS_H - 0.3, 5.8 - 0.3, "wall_int", HX + 9.15, SY, HZ + 6.15));

    // STAIRS SS → RDC (main)
    stairs(ssG, HX + 9.35, HZ + 6.55, HX + 11.0, HZ + 6.55, SY, SY + SS_H + SLAB, 12, "stair_conc", "x");
    // STAIRS dérobé SS → suite dressing
    stairs(ssG, HX + 6.0, HZ + HD - 2.2, HX + 7.5, HZ + HD - 2.2, SY, SY + SS_H + SLAB, 12, "stair_conc", "x");

    ssG.add(label3D("← Escalier Dérobé → Suite", HX + 6.8, SY + SS_H - 0.4, HZ + HD - 1.5, "#e8a0a0", 0.22));

    // ═══════════════════════════════════════════════════
    // RDC  (Y base = 0 — fixed)
    // ═══════════════════════════════════════════════════
    const RY = 0;
    const rdcG = G.rdc;
    const WH = RDC_H, WT = 0.28;

    // FRONT WALL  (z=HZ, main facade)
    rdcG.add(bc(3, WH, WT, "wall_ext", HX, RY, HZ));           // left pier
    rdcG.add(bc(2.8, WH, WT, "wall_ext", HX + 8.2, RY, HZ));     // right
    rdcG.add(bc(5.2, 0.68, WT, "wall_ext", HX + 3, RY + WH - 0.68, HZ)); // lintel salon
    // Salon glass (front facade — big openings)
    glass(G.rdc, HX + 3.1, RY + 0.08, HZ, 1.55, SALON_H - 0.15, "z");
    glass(G.rdc, HX + 4.75, RY + 0.08, HZ, 1.55, SALON_H - 0.15, "z");
    glass(G.rdc, HX + 6.35, RY + 0.08, HZ, 0.7, WH - 0.15, "z");

    // BACK WALL
    rdcG.add(bc(3.8, WH, WT, "wall_ext", HX, RY, HZ + HD));
    rdcG.add(bc(0.65, WH, WT, "wall_ext", HX + 3.8, RY, HZ + HD));
    rdcG.add(bc(2.5, WH, WT, "wall_ext", HX + 6.3, RY, HZ + HD));
    rdcG.add(bc(2.2, WH, WT, "wall_ext", HX + 9.5, RY, HZ + HD));
    rdcG.add(bc(HW, 0.5, WT, "wall_ext", HX, RY + WH - 0.5, HZ + HD));
    // Back glass (suite + ch2 openings)
    glass(G.rdc, HX + 0.35, RY + 0.2, HZ + HD, 1.6, WH - 0.65, "z");
    glass(G.rdc, HX + 2.05, RY + 0.2, HZ + HD, 1.5, WH - 0.65, "z");
    glass(G.rdc, HX + 8.3, RY + 0.9, HZ + HD, 1.4, 1.3, "z");
    glass(G.rdc, HX + 10.3, RY + 0.9, HZ + HD, 0.9, 1.3, "z");

    // LEFT WALL
    rdcG.add(bc(WT, WH, 5, "wall_ext", HX, RY, HZ));
    rdcG.add(bc(WT, WH, 3.6, "wall_ext", HX, RY, HZ + 10.4));
    rdcG.add(bc(WT, 0.65, 1.5, "wall_ext", HX, RY + WH - 0.65, HZ + 5));
    glass(G.rdc, HX - 0.03, RY + 0.88, HZ + 8.2, 1.9, 1.55, "x"); // suite side window

    // RIGHT WALL
    rdcG.add(bc(WT, WH, HD, "wall_ext", HX + HW, RY, HZ));

    // INTERIOR PARTITIONS
    rdcG.add(bc(0.2, WH, 5, "wall_int", HX + 7 - 0.1, RY, HZ));
    rdcG.add(bc(0.2, WH, 2, "wall_int", HX + 8.8 - 0.1, RY, HZ));
    rdcG.add(bc(0.2, WH, 2, "wall_int", HX + 10.5 - 0.1, RY, HZ));
    rdcG.add(bc(3, WH, 0.2, "wall_int", HX, RY, HZ + 5));
    rdcG.add(bc(0.7, WH, 0.2, "wall_int", HX + 3, RY, HZ + 5));
    rdcG.add(bc(4.1, WH, 0.2, "wall_int", HX + 3.9, RY, HZ + 5));
    rdcG.add(bc(HW, 0.2, 0.2, "wall_int", HX, RY, HZ + 7));
    rdcG.add(bc(HW, 0.2, 0.2, "wall_int", HX, RY, HZ + 8));
    rdcG.add(bc(0.2, WH, 4, "wall_int", HX + 4 - 0.1, RY, HZ + 8));
    rdcG.add(bc(0.2, WH, 4, "wall_int", HX + 6 - 0.1, RY, HZ + 8));
    rdcG.add(bc(0.2, WH, 4, "wall_int", HX + 8.5 - 0.1, RY, HZ + 8));
    rdcG.add(bc(0.2, WH, 2, "wall_int", HX + 10.5 - 0.1, RY, HZ + 8));
    rdcG.add(bc(2.2, WH, 0.2, "wall_int", HX + 4, RY, HZ + 10));
    rdcG.add(bc(0.2, WH, 2, "wall_int", HX + 6.8 - 0.1, RY, HZ + 5));
    rdcG.add(bc(4.2, 0.2, 0.2, "wall_int", HX + 6.8, RY, HZ + 6));

    // DOUBLE HEIGHT salon extra walls
    const DH = SALON_H - WH;
    rdcG.add(bc(7, DH, WT, "wall_ext", HX, RY + WH, HZ));
    rdcG.add(bc(WT, DH, 5, "wall_ext", HX, RY + WH, HZ));
    rdcG.add(bc(0.2, DH, 5, "wall_int", HX + 7 - 0.1, RY + WH, HZ));
    // extra glazing upper DH
    glass(G.rdc, HX + 3.1, RY + WH + 0.1, HZ, 1.55, DH - 0.15, "z");
    glass(G.rdc, HX + 4.75, RY + WH + 0.1, HZ, 1.55, DH - 0.15, "z");

    // SLAB RDC ceiling
    rdcG.add(bc(HW, SLAB, HD - 2, "slab", HX, RY + WH, HZ + 2));
    rdcG.add(bc(HW - 7, SLAB, 2, "slab", HX + 7, RY + WH, HZ));

    // FLOORS (colored)
    const fl = [
        [7 - 0.4, 5 - 0.4, "salon_fl", HX + 0.2, RY, HZ + 0.2],
        [4 - 0.4, 2 - 0.3, "floor_tile", HX + 3.2, RY, HZ + 0.15],
        [1.5 - 0.3, 2 - 0.3, "sdb_tile", HX + 7.15, RY, HZ + 0.15],
        [2.5 - 0.3, 2 - 0.3, "floor_tile", HX + 8.85, RY, HZ + 0.15],
        [4 - 0.4, 4 - 0.4, "cuisine_fl", HX + 7.2, RY, HZ + 0.2],
        [4 - 0.4, 1 - 0.2, "floor_tile", HX + 7.2, RY, HZ + 6.1],
        [HW - 0.4, 1 - 0.2, "floor_ceramic", HX + 0.2, RY, HZ + 7.1],
        [4 - 0.4, 4 - 0.4, "floor_wood", HX + 0.2, RY, HZ + 8.2],
        [2 - 0.3, 2 - 0.3, "sdb_floor", HX + 4.15, RY, HZ + 8.15],
        [2 - 0.3, 2 - 0.3, "floor_tile", HX + 4.15, RY, HZ + 10.15],
        [2.5 - 0.4, 4 - 0.4, "floor_wood2", HX + 6.2, RY, HZ + 8.2],
        [2 - 0.3, 2 - 0.3, "sdb_floor", HX + 8.65, RY, HZ + 8.15],
        [2.5 - 0.4, 2 - 0.3, "floor_wood2", HX + 8.65, RY, HZ + 10.15],
    ];
    fl.forEach(([w, d, mat, x, y, z]) => rdcG.add(bc(w, 0.06, d, mat, x, y, z)));

    // FRONT TERRACE
    rdcG.add(bc(8, 0.14, 2.2, "terrace_f", HX, RY - 0.01, HZ - 2.2));
    [[HX + 0.3, HZ - 2.1], [HX + 3.9, HZ - 2.1], [HX + 7.5, HZ - 2.1]].forEach(([px, pz]) =>
        rdcG.add(bc(0.18, WH + 0.3, 0.18, "wood", px, RY, pz)));
    rdcG.add(bc(8, 0.13, 0.2, "wood", HX, RY + WH + 0.14, HZ - 2.1));
    rdcG.add(bc(8, 0.1, 2.3, "roof_tile", HX, RY + WH + 0.18, HZ - 2.2));

    // BACK TERRACE
    rdcG.add(bc(HW, 0.12, 1.3, "terrace_t", HX, RY - 0.01, HZ + HD));

    // STAIRS RDC → SS
    stairs(rdcG, HX + 9.35, HZ + 0.3, HX + 11.0, HZ + 0.3, RY, RY - SS_BOT, 12, "stair_conc", "x");

    // FURNITURE — SALON
    sofa(rdcG, HX + 0.4, RY + 0.06, HZ + 1.5, 3.2, 1.0);
    sofa(rdcG, HX + 0.4, RY + 0.06, HZ + 3.8, 1.6, 0.9);
    tv(rdcG, HX + 5.0, RY + 0.65, HZ + 0.45, 1.9);
    rdcG.add(bc(1.25, 0.44, 0.68, "furniture2", HX + 1.85, RY + 0.06, HZ + 2.6)); // coffee table
    rdcG.add(bc(3.5, 0.02, 2.5, "red_acc", HX + 0.45, RY + 0.07, HZ + 1.4)); // rug
    rdcG.add(cy(0.04, 1.85, "chrome", HX + 6.4, RY + 0.06, HZ + 4.3)); // lamp

    // CUISINE
    rdcG.add(bc(0.7, 0.9, 3.4, "furniture", HX + 7.1, RY, HZ + 0.25)); // back counter
    rdcG.add(bc(3.1, 0.9, 0.7, "furniture", HX + 9.5, RY, HZ + 0.25)); // side counter
    rdcG.add(bc(0.66, 0.9, 0.66, "furniture2", HX + 7.1, RY, HZ + 0.25)); // hob zone
    island(rdcG, HX + 7.3, RY, HZ + 2.4);
    rdcG.add(bc(0.68, 0.42, 0.62, "chrome", HX + 7.14, RY + 1.42, HZ + 0.28)); // hotte

    // HALL
    rdcG.add(bc(0.56, 1.1, 0.28, "furniture", HX + 3.2, RY, HZ + 0.14));
    rdcG.add(bc(0.5, 0.9, 0.5, "furniture2", HX + 7.0, RY, HZ + 0.18));

    // WC VISITEUR
    toilet(rdcG, HX + 7.35, RY, HZ + 1.3, Math.PI);
    sink(rdcG, HX + 7.3, RY, HZ + 0.2);

    // SUITE
    bed(rdcG, HX + 0.3, RY + 0.06, HZ + 9.1, 2.0, 2.2);
    rdcG.add(bc(1.9, 1.9, 0.28, "furniture", HX + 0.28, RY, HZ + 8.3));
    rdcG.add(bc(1.9, 1.9, 0.28, "furniture2", HX + 0.28, RY, HZ + 11.6));

    // SDB SUITE
    shower(rdcG, HX + 4.1, RY, HZ + 8.22, 0.95, 0.95);
    bathtub(rdcG, HX + 4.1, RY, HZ + 9.45);
    toilet(rdcG, HX + 5.35, RY, HZ + 8.22, Math.PI / 2);
    sink(rdcG, HX + 5.55, RY, HZ + 9.65);

    // DRESSING
    for (let i = 0; i < 4; i++) rdcG.add(bc(0.48, 1.7, 1.75, "furniture", HX + 4.1 + i * 0.0, RY, HZ + 10.18));
    rdcG.add(bc(1.25, 0.06, 1.25, "col", HX + 4.4, RY + 0.01, HZ + 11.0)); // trappe dérobée

    // CHAMBRE 2
    bed(rdcG, HX + 6.2, RY + 0.06, HZ + 9.1, 1.8, 2.0);
    rdcG.add(bc(1.85, 1.7, 0.28, "furniture2", HX + 6.18, RY, HZ + 8.28));

    // SDB 2
    shower(rdcG, HX + 8.62, RY, HZ + 8.22, 0.9, 0.9);
    toilet(rdcG, HX + 9.52, RY, HZ + 8.22, Math.PI / 2);
    sink(rdcG, HX + 9.75, RY, HZ + 9.65);

    // CHAMBRE 3
    bed(rdcG, HX + 8.82, RY + 0.06, HZ + 10.3, 1.62, 1.9);

    // LABELS RDC
    rdcG.add(label3D("SALON ★ Double Hauteur 35m²", HX + 3.5, SALON_H + 0.35, HZ + 2.5, "#ffe880", 0.4));
    rdcG.add(label3D("Cuisine + Îlot 16m²", HX + 9, WH + 0.3, HZ + 2.5, "#88dd88", 0.28));
    rdcG.add(label3D("Suite Parentale 16m²", HX + 2, WH + 0.3, HZ + 10, "#ffaaaa", 0.3));
    rdcG.add(label3D("SDB Suite", HX + 5, WH + 0.3, HZ + 9, "#88bbdd", 0.22));
    rdcG.add(label3D("Dressing ↕ Dérobé", HX + 5, WH + 0.3, HZ + 11, "#cc99ee", 0.22));
    rdcG.add(label3D("Chambre 2", HX + 7, WH + 0.3, HZ + 10, "#aaaaee", 0.26));
    rdcG.add(label3D("Chambre 3", HX + 9.8, WH + 0.3, HZ + 11, "#aaaaee", 0.22));
    rdcG.add(label3D("Hall Entrée", HX + 5, WH + 0.3, HZ + 0.85, "#e8d890", 0.22));
    rdcG.add(label3D("Couloir Nuit", HX + 6.5, WH + 0.3, HZ + 7.5, "#d0c8a0", 0.22));
    rdcG.add(label3D("Terrasse Couverte 16m²", HX + 4, WH + 0.6, HZ - 0.9, "#e8c860", 0.28));

    // Trémie R+1
    rdcG.add(bc(1.4, 0.1, 1.8, "gold", HX + 4.3, WH - 0.05, HZ + 10.2));
    rdcG.add(label3D("▲ Trémie → R+1", HX + 5, WH + 0.4, HZ + 11.1, "#4499cc", 0.22));

    // ═══════════════════════════════════════════════════
    // R+1 FUTURE
    // ═══════════════════════════════════════════════════
    const R1_BASE = RDC_H + SLAB + r1Off;
    G.r1.add(bc(HW, R1_H, HD, "ghost_r1", HX, R1_BASE, HZ));
    G.r1.add(bc(HW, R1_H, HD, "wire_r1", HX, R1_BASE, HZ));
    G.r1.add(bc(HW, SLAB, HD, "future_slab", HX, R1_BASE + R1_H, HZ));
    G.r1.add(label3D("R+1 — Structure prévue (132m²)", HX + HW / 2, R1_BASE + R1_H / 2, HZ + HD / 2, "#44aaff", 0.38));
    G.r1.add(bc(1.4, R1_H + 0.2, 1.8, "col", HX + 4.3, R1_BASE - 0.1, HZ + 10.2)); // trémie

    // ═══════════════════════════════════════════════════
    // R+2 FUTURE + ROOF
    // ═══════════════════════════════════════════════════
    const R2_BASE = RDC_H + SLAB + R1_H + SLAB + r2Off;
    G.r2.add(bc(HW, R2_H, HD, "ghost_r2", HX, R2_BASE, HZ));
    G.r2.add(bc(HW, R2_H, HD, "wire_r2", HX, R2_BASE, HZ));
    const roofPeak = R2_BASE + R2_H + 2.5;
    const rg = new THREE.ConeGeometry(8.0, 3.0, 4);
    const rm = new THREE.Mesh(rg, M.roof_tile);
    rm.rotation.y = Math.PI / 4; rm.position.set(HX + HW / 2, roofPeak - 1.5, HZ + HD / 2);
    G.r2.add(rm);
    G.r2.add(label3D("R+2 + Toiture Finale", HX + HW / 2, roofPeak + 0.5, HZ + HD / 2, "#bb77ff", 0.34));

    return G;
}

// ─── CAMERA PRESETS ───────────────────────────────────────────
const PRESETS = [
    { n: "Perspective", theta: -0.55, phi: 0.72, r: 42, tx: 7.5, ty: 3, tz: 11 },
    { n: "Façade Avant", theta: 0, phi: 1.05, r: 28, tx: 7.5, ty: 2, tz: 11 },
    { n: "Vue Aérienne", theta: -0.4, phi: 0.2, r: 38, tx: 7.5, ty: 0, tz: 11 },
    { n: "Jardin Arrière", theta: Math.PI, phi: 0.95, r: 28, tx: 7.5, ty: 2, tz: 11 },
    { n: "Sous-sol (intérieur)", theta: -0.3, phi: 1.25, r: 20, tx: 7.5, ty: -1.5, tz: 11 },
    { n: "Sous-sol (plongeant)", theta: -0.5, phi: 0.55, r: 32, tx: 7.5, ty: -2, tz: 11 },
    { n: "Intérieur RDC", theta: 0.3, phi: 1.22, r: 14, tx: 5, ty: 1, tz: 10 },
    { n: "Côté gauche", theta: -Math.PI / 2, phi: 0.9, r: 28, tx: 7.5, ty: 2, tz: 11 },
];

const TOGGLES = [
    { k: "lot", l: "Terrain & Jardin", c: "#3a8020" },
    { k: "fence", l: "Clôtures", c: "#9a8040" },
    { k: "exterior", l: "Piscine + Ext.", c: "#2299aa" },
    { k: "ss", l: "Sous-sol complet", c: "#c8a020" },
    { k: "rdc", l: "RDC complet", c: "#60b840" },
    { k: "columns", l: "Poteaux R+2", c: "#d4a030" },
    { k: "r1", l: "R+1 Futur", c: "#4488cc" },
    { k: "r2", l: "R+2 + Toiture", c: "#9944cc" },
];

const QUICK_VIEWS = [
    { l: "Sous-sol seul", fn: (setV) => setV({ lot: true, fence: true, exterior: false, ss: true, rdc: false, columns: true, r1: false, r2: false }) },
    { l: "RDC seul", fn: (setV) => setV({ lot: true, fence: true, exterior: true, ss: false, rdc: true, columns: true, r1: false, r2: false }) },
    { l: "Structure nue", fn: (setV) => setV({ lot: false, fence: false, exterior: false, ss: true, rdc: true, columns: true, r1: true, r2: true }) },
    { l: "Vue complète", fn: (setV) => setV({ lot: true, fence: true, exterior: true, ss: true, rdc: true, columns: true, r1: true, r2: true }) },
    { l: "R+1/R+2 off", fn: (setV, cur) => setV({ ...cur, r1: false, r2: false }) },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function Villa3D() {
    const mountRef = useRef(null);
    const stateRef = useRef(null);
    const camRef = useRef({ theta: -0.55, phi: 0.72, r: 42, tx: 7.5, ty: 3, tz: 11 });
    const animRef = useRef(null);

    const [vis, setVis] = useState({ lot: true, fence: true, exterior: true, ss: true, rdc: true, columns: true, r1: true, r2: true });
    const [preset, setPreset] = useState(0);
    const [panel, setPanel] = useState(true);
    const [explode, setExplode] = useState(0);   // 0=assembled, 1=exploded
    const [xray, setXray] = useState(false);     // ground transparent
    const [dark, setDark] = useState(true);

    // Build scene once
    useEffect(() => {
        const el = mountRef.current; if (!el) return;
        const W = el.clientWidth, H = el.clientHeight;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x141210);
        scene.fog = new THREE.FogExp2(0x141210, 0.009);
        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        el.appendChild(renderer.domElement);

        // Lights
        scene.add(new THREE.AmbientLight(0xfff0e0, 0.6));
        const sun = new THREE.DirectionalLight(0xfff8e8, 1.5);
        sun.position.set(30, 45, 20); sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        Object.assign(sun.shadow.camera, { near: 1, far: 160, left: -28, right: 28, top: 32, bottom: -32 });
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xaaccff, 0.3);
        fill.position.set(-20, 12, -15); scene.add(fill);
        // Underground fill light (helps see basement)
        const ssLight = new THREE.PointLight(0xffeedd, 1.5, 18);
        ssLight.position.set(7.5, -1.5, 11); scene.add(ssLight);
        const ssLight2 = new THREE.PointLight(0xfff0cc, 1.0, 15);
        ssLight2.position.set(7.5, -2.0, 8); scene.add(ssLight2);

        // Extended ground
        const eg = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshLambertMaterial({ color: 0x1e2e0e }));
        eg.rotation.x = -Math.PI / 2; eg.position.set(7.5, -0.05, 10); eg.receiveShadow = true; scene.add(eg);
        const grid = new THREE.GridHelper(120, 120, 0x1c1a10, 0x161410);
        grid.position.set(7.5, -0.01, 10); scene.add(grid);

        const groups = buildScene(scene, 0);
        stateRef.current = {
            scene, camera, renderer, groups, sun, fill, ssLight, ssLight2, grid, eg,
            down: false, lx: 0, ly: 0
        };

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
        stateRef.current.updateCam = updateCam;

        const getXY = e => e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
        const onDown = e => { stateRef.current.down = true;[stateRef.current.lx, stateRef.current.ly] = getXY(e); };
        const onUp = () => { stateRef.current.down = false; };
        const onMove = e => {
            if (!stateRef.current.down) return;
            const [cx, cy] = getXY(e);
            const st = stateRef.current;
            camRef.current.theta -= (cx - st.lx) * 0.007;
            camRef.current.phi = Math.max(0.05, Math.min(1.52, camRef.current.phi + (cy - st.ly) * 0.007));
            st.lx = cx; st.ly = cy; updateCam();
        };
        const onWheel = e => {
            e.preventDefault();
            camRef.current.r = Math.max(4, Math.min(85, camRef.current.r + e.deltaY * 0.05));
            updateCam();
        };

        renderer.domElement.addEventListener("mousedown", onDown);
        renderer.domElement.addEventListener("touchstart", onDown, { passive: true });
        window.addEventListener("mouseup", onUp);
        window.addEventListener("touchend", onUp);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onMove, { passive: true });
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

        const onResize = () => {
            const W = el.clientWidth, H = el.clientHeight;
            camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
        };
        window.addEventListener("resize", onResize);

        animRef.current = requestAnimationFrame(function loop() {
            animRef.current = requestAnimationFrame(loop);
            renderer.render(scene, camera);
        });

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
            renderer.dispose();
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        };
    }, []);

    // Visibility
    useEffect(() => {
        if (!stateRef.current) return;
        const { groups } = stateRef.current;
        TOGGLES.forEach(t => { if (groups[t.k]) groups[t.k].visible = vis[t.k]; });
    }, [vis]);

    // X-ray (ground transparency)
    useEffect(() => {
        if (!stateRef.current) return;
        const { eg, grid } = stateRef.current;
        if (eg) eg.material.opacity = xray ? 0.08 : 1; eg.material.transparent = xray;
        if (grid) grid.visible = !xray;
        // also make lot group transparent
        if (stateRef.current.groups.lot) {
            stateRef.current.groups.lot.traverse(obj => {
                if (obj.isMesh && obj !== eg) {
                    obj.material.transparent = true;
                    obj.material.opacity = xray ? 0.15 : 1;
                    obj.material.needsUpdate = true;
                }
            });
        }
    }, [xray]);

    // Explode — rebuild scene with offset
    useEffect(() => {
        if (!stateRef.current) return;
        const { scene, groups } = stateRef.current;
        // Remove old groups
        TOGGLES.forEach(t => {
            if (groups[t.k]) { scene.remove(groups[t.k]); groups[t.k] = null; }
        });
        // Also remove exterior/columns
        ["exterior", "columns"].forEach(k => {
            if (groups[k]) { scene.remove(groups[k]); groups[k] = null; }
        });
        const newGroups = buildScene(scene, explode);
        Object.assign(groups, newGroups);
        // Re-apply visibility
        TOGGLES.forEach(t => { if (groups[t.k]) groups[t.k].visible = vis[t.k]; });
    }, [explode]);

    const applyPreset = useCallback((i) => {
        const p = PRESETS[i];
        camRef.current = { theta: p.theta, phi: p.phi, r: p.r, tx: p.tx, ty: p.ty, tz: p.tz };
        setPreset(i);
        if (stateRef.current) stateRef.current.updateCam();
    }, []);

    const BG = dark ? "#141210" : "#f0f2f4";
    const FG = dark ? "#c8a840" : "#2a2a2a";
    const BORDER = dark ? "#2a2414" : "#d0d4d8";
    const PAN = dark ? "#0e0c08" : "#ffffff";

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: BG, fontFamily: "'Courier New',monospace", overflow: "hidden"
        }}>

            {/* TOP BAR */}
            <div style={{
                padding: "5px 12px", background: dark ? "#1a1610" : "#ffffff",
                borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center",
                gap: 8, flexWrap: "wrap", flexShrink: 0
            }}>
                <div>
                    <div style={{ fontSize: 10, color: FG, letterSpacing: 3, textTransform: "uppercase" }}>
                        Villa Évolutive R+2 · 3D Complète
                    </div>
                    <div style={{ fontSize: 7, color: dark ? "#4a4030" : "#888" }}>
                        Agovodou, Lomé · 300m² · SS+R0+R1+R2
                    </div>
                </div>

                {/* Presets */}
                <div style={{ display: "flex", gap: 2, marginLeft: 8, flexWrap: "wrap" }}>
                    {PRESETS.map((p, i) => (
                        <button key={i} onClick={() => applyPreset(i)} style={{
                            padding: "2px 7px", border: `1px solid ${i === preset ? FG : BORDER}`,
                            background: i === preset ? (dark ? "#2a2010" : "#fff4dd") : "transparent",
                            color: i === preset ? FG : (dark ? "#555" : "#999"),
                            fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 3
                        }}>{p.n}</button>
                    ))}
                </div>

                <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
                    {/* Explode toggle */}
                    <button onClick={() => setExplode(e => e > 0 ? 0 : 1)} style={{
                        padding: "3px 10px", border: `1px solid ${explode > 0 ? FG : BORDER}`,
                        background: explode > 0 ? (dark ? "#2a2010" : "#fffbe8") : "transparent",
                        color: explode > 0 ? FG : (dark ? "#555" : "#999"),
                        fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 3
                    }}>💥 Éclater</button>
                    {/* X-ray */}
                    <button onClick={() => setXray(x => !x)} style={{
                        padding: "3px 10px", border: `1px solid ${xray ? FG : BORDER}`,
                        background: xray ? (dark ? "#1a2030" : "#e8f0ff") : "transparent",
                        color: xray ? FG : (dark ? "#555" : "#999"),
                        fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 3
                    }}>👁 Rayon-X</button>
                    {/* Dark/Light */}
                    <button onClick={() => setDark(d => !d)} style={{
                        padding: "3px 8px", border: `1px solid ${BORDER}`, background: "transparent",
                        color: dark ? "#555" : "#999", fontSize: 9, cursor: "pointer", borderRadius: 3
                    }}>{dark ? "☀" : "🌙"}</button>
                    <button onClick={() => setPanel(p => !p)} style={{
                        padding: "3px 8px", border: `1px solid ${BORDER}`, background: "transparent",
                        color: dark ? "#555" : "#999", fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 3
                    }}>{panel ? "◀" : "▶"}</button>
                </div>
            </div>

            {/* Explode indicator */}
            {explode > 0 && (
                <div style={{
                    background: dark ? "#2a2010" : "#fff8e0", borderBottom: `1px solid ${FG}`,
                    padding: "4px 14px", fontSize: 8, color: FG, display: "flex", alignItems: "center", gap: 12
                }}>
                    <span>💥 Vue éclatée activée — les étages sont séparés verticalement pour exploration</span>
                    <button onClick={() => setExplode(0)} style={{
                        padding: "2px 8px", border: `1px solid ${FG}`, background: "transparent",
                        color: FG, fontSize: 7, cursor: "pointer", fontFamily: "monospace", borderRadius: 3
                    }}>Réassembler</button>
                </div>
            )}

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                {/* CANVAS */}
                <div ref={mountRef} style={{ flex: 1, overflow: "hidden", position: "relative", cursor: "grab" }}>
                    <div style={{
                        position: "absolute", bottom: 8, left: 8, fontSize: 7,
                        color: dark ? "#2e2818" : "#999", lineHeight: 2, pointerEvents: "none"
                    }}>
                        🖱 Glisser = rotation · Molette = zoom · Boutons en haut = point de vue
                    </div>
                    {xray && (
                        <div style={{
                            position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
                            background: "rgba(0,100,200,0.15)", border: "1px solid #4488cc",
                            padding: "4px 14px", fontSize: 8, color: "#88bbff", fontFamily: "monospace",
                            pointerEvents: "none", borderRadius: 4
                        }}>
                            👁 Mode Rayon-X — sol transparent pour voir le sous-sol
                        </div>
                    )}
                </div>

                {/* PANEL */}
                {panel && (
                    <div style={{
                        width: 200, background: PAN, borderLeft: `1px solid ${BORDER}`,
                        overflow: "auto", flexShrink: 0
                    }}>
                        {/* Calques */}
                        <div style={{
                            padding: "6px 12px", fontSize: 7, color: dark ? "#4a4030" : "#888",
                            letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${BORDER}`,
                            background: dark ? "#131208" : "#f8f9fa"
                        }}>Calques</div>

                        {[
                            { title: "Extérieur", keys: ["lot", "fence", "exterior"] },
                            { title: "Sous-sol (-1)", keys: ["ss"] },
                            { title: "Rez-de-Chaussée", keys: ["rdc"] },
                            { title: "Structure R+2", keys: ["columns"] },
                            { title: "Futurs étages", keys: ["r1", "r2"] },
                        ].map(grp => (
                            <div key={grp.title}>
                                <div style={{
                                    padding: "4px 12px", fontSize: 7,
                                    color: dark ? "#3a3020" : "#aaa",
                                    background: dark ? "#111008" : "#f0f2f4", letterSpacing: 1
                                }}>
                                    {grp.title}
                                </div>
                                {grp.keys.map(k => {
                                    const t = TOGGLES.find(t => t.k === k); if (!t) return null;
                                    return (
                                        <div key={k} onClick={() => setVis(v => ({ ...v, [k]: !v[k] }))}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 8,
                                                padding: "6px 14px", cursor: "pointer",
                                                background: vis[k] ? "transparent" : (dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)"),
                                                borderBottom: `1px solid ${dark ? "#141210" : "#f0f2f4"}`,
                                                transition: "background 0.1s"
                                            }}>
                                            <div style={{
                                                width: 9, height: 9, flexShrink: 0,
                                                background: vis[k] ? t.c : (dark ? "#222" : "#ddd"),
                                                border: `1px solid ${vis[k] ? t.c : (dark ? "#333" : "#ccc")}`,
                                                transition: "all 0.15s"
                                            }} />
                                            <span style={{ fontSize: 8, color: vis[k] ? FG : (dark ? "#333" : "#bbb") }}>{t.l}</span>
                                            <span style={{
                                                marginLeft: "auto", fontSize: 7,
                                                color: vis[k] ? "#4a8" : "#422"
                                            }}>{vis[k] ? "✓" : "✗"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Quick views */}
                        <div style={{ padding: "8px 10px", borderTop: `1px solid ${BORDER}` }}>
                            <div style={{ fontSize: 7, color: dark ? "#4a4030" : "#888", letterSpacing: 1, marginBottom: 5 }}>
                                VUES RAPIDES
                            </div>
                            {QUICK_VIEWS.map(({ l, fn }) => (
                                <button key={l} onClick={() => fn(setVis, vis)} style={{
                                    display: "block", width: "100%", padding: "5px 8px", marginBottom: 3,
                                    border: `1px solid ${BORDER}`, background: "transparent",
                                    color: dark ? "#7a6840" : "#666", fontSize: 7.5, cursor: "pointer",
                                    fontFamily: "monospace", textAlign: "left", borderRadius: 3
                                }}>{l}</button>
                            ))}
                        </div>

                        {/* Outils */}
                        <div style={{ padding: "8px 10px", borderTop: `1px solid ${BORDER}` }}>
                            <div style={{ fontSize: 7, color: dark ? "#4a4030" : "#888", letterSpacing: 1, marginBottom: 5 }}>
                                OUTILS
                            </div>
                            <button onClick={() => setExplode(e => e > 0 ? 0 : 1)} style={{
                                display: "block", width: "100%", padding: "5px 8px", marginBottom: 3,
                                border: `1px solid ${explode > 0 ? FG : BORDER}`,
                                background: explode > 0 ? (dark ? "#2a2010" : "#fffbe8") : "transparent",
                                color: explode > 0 ? FG : (dark ? "#7a6840" : "#666"), fontSize: 7.5, cursor: "pointer",
                                fontFamily: "monospace", textAlign: "left", borderRadius: 3
                            }}>💥 {explode > 0 ? "Réassembler" : "Vue éclatée (SS/RDC/R1/R2)"}</button>
                            <button onClick={() => setXray(x => !x)} style={{
                                display: "block", width: "100%", padding: "5px 8px", marginBottom: 3,
                                border: `1px solid ${xray ? FG : BORDER}`,
                                background: xray ? (dark ? "#1a2030" : "#e8f0ff") : "transparent",
                                color: xray ? FG : (dark ? "#7a6840" : "#666"), fontSize: 7.5, cursor: "pointer",
                                fontFamily: "monospace", textAlign: "left", borderRadius: 3
                            }}>👁 {xray ? "Désactiver rayon-X" : "Rayon-X (voir sous-sol)"}</button>
                            <button onClick={() => applyPreset(4)} style={{
                                display: "block", width: "100%", padding: "5px 8px", marginBottom: 3,
                                border: `1px solid ${BORDER}`, background: "transparent",
                                color: dark ? "#7a6840" : "#666", fontSize: 7.5, cursor: "pointer",
                                fontFamily: "monospace", textAlign: "left", borderRadius: 3
                            }}>🔦 Focus Sous-sol (caméra)</button>
                            <button onClick={() => { setXray(true); setVis(v => ({ ...v, rdc: false, r1: false, r2: false })); applyPreset(5); }
                            } style={{
                                display: "block", width: "100%", padding: "5px 8px", marginBottom: 3,
                                border: `1px solid #c8a020`, background: "transparent",
                                color: "#c8a020", fontSize: 7.5, cursor: "pointer",
                                fontFamily: "monospace", textAlign: "left", borderRadius: 3
                            }}>⭐ Mode Sous-sol complet</button>
                        </div>

                        {/* Legend */}
                        <div style={{ padding: "8px 10px", borderTop: `1px solid ${BORDER}` }}>
                            <div style={{ fontSize: 7, color: dark ? "#4a4030" : "#888", letterSpacing: 1, marginBottom: 5 }}>LÉGENDE</div>
                            {[
                                ["#c8b880", "Plancher salon (travertin)"],
                                ["#c8a060", "Parquet bois"],
                                ["#ddd4b8", "Carrelage"],
                                ["#d0e8f0", "Carrelage SDB"],
                                ["#607078", "Époxy garage"],
                                ["#f8f0d8", "VIP (crème)"],
                                ["#44aadd", "Eau piscine"],
                                ["#d4a030", "Poteaux R+2 (or)"],
                            ].map(([c, l]) => (
                                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                    <div style={{ width: 8, height: 8, background: c, border: `1px solid ${BORDER}`, flexShrink: 0 }} />
                                    <span style={{ fontSize: 7.5, color: dark ? "#7a7060" : "#666" }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}