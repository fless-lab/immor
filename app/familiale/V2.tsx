// @ts-nocheck
"use client";
import { useState, useRef, useCallback } from "react";

const S = 34; // px per meter
const p = v => v * S;

const LOT_W = 15, LOT_H = 20;
const HX = 2, HY = 3, HW = 11, HH = 12;

const C = {
    wall: "#1a1510", salon: "#fffbee", cuisine: "#edf8ed", suite: "#fff4f4",
    chambre: "#f5f0ff", sdb: "#d8eeff", dressing: "#f0e8ff", hall: "#f0ece0",
    couloir: "#e8e4d8", service: "#dedad0", garage: "#d0ccc0", vip: "#f8f4e8",
    garden: "#b8d895", terrace: "#e8c870", pool: "#5ec8e0", outdoor_k: "#e0d090",
    security: "#d0d8b8", future: "#dde8f4", future2: "#ece0f8", voisin: "#cdc8b8",
    ramp: "#c0bab0", accent: "#c8a840",
};

// ── Architectural symbols ──────────────────────────────────────

function DoorBattant({ x, y, w = 0.9, dir, swing = 1 }) {
    const R = p(w);
    const x0 = p(x), y0 = p(y);
    // dir = which wall the door sits on (top/bottom/left/right)
    // swing = 1 or -1
    let gap, arc, hinge, leaf;
    if (dir === "top" || dir === "bottom") {
        const sign = dir === "top" ? 1 : -1;
        const hx = swing > 0 ? x0 : x0 + R;
        hinge = [hx, y0];
        leaf = [swing > 0 ? x0 + R : x0, y0];
        // arc from leaf end, sweeping toward wall
        const arcEnd = [hx, y0 + sign * R];
        arc = `M ${leaf[0]} ${leaf[1]} A ${R} ${R} 0 0 ${swing > 0 ? (dir === "top" ? 1 : 0) : (dir === "top" ? 0 : 1)} ${arcEnd[0]} ${arcEnd[1]}`;
        gap = <rect x={x0} y={y0 - 3} width={R} height={6} fill={C.wall} opacity={0} />;
        return (
            <g pointerEvents="none">
                <rect x={x0} y={y0 - 3} width={R} height={6} fill="white" />
                <line x1={hinge[0]} y1={hinge[1]} x2={leaf[0]} y2={leaf[1]} stroke={C.wall} strokeWidth={1.5} />
                <path d={arc} fill="none" stroke={C.wall} strokeWidth={0.8} strokeDasharray="3,2" />
            </g>
        );
    }
    if (dir === "left" || dir === "right") {
        const sign = dir === "right" ? 1 : -1;
        const hy = swing > 0 ? y0 : y0 + R;
        hinge = [x0, hy];
        leaf = [x0, swing > 0 ? y0 + R : y0];
        const arcEnd = [x0 + sign * R, hy];
        arc = `M ${leaf[0]} ${leaf[1]} A ${R} ${R} 0 0 ${swing > 0 ? (dir === "right" ? 0 : 1) : (dir === "right" ? 1 : 0)} ${arcEnd[0]} ${arcEnd[1]}`;
        return (
            <g pointerEvents="none">
                <rect x={x0 - 3} y={y0} width={6} height={R} fill="white" />
                <line x1={hinge[0]} y1={hinge[1]} x2={leaf[0]} y2={leaf[1]} stroke={C.wall} strokeWidth={1.5} />
                <path d={arc} fill="none" stroke={C.wall} strokeWidth={0.8} strokeDasharray="3,2" />
            </g>
        );
    }
    return null;
}

function DoorSliding({ x, y, w = 1.2, dir }) {
    const L = p(w);
    if (dir === "top" || dir === "bottom") {
        return (
            <g pointerEvents="none">
                <rect x={p(x)} y={p(y) - 4} width={L} height={8} fill="white" />
                <rect x={p(x)} y={p(y) - 3} width={L / 2 - 1} height={6} fill="none" stroke={C.wall} strokeWidth={1} />
                <rect x={p(x) + L / 2 + 1} y={p(y) - 3} width={L / 2 - 1} height={6} fill="none" stroke="#4488cc" strokeWidth={1} strokeDasharray="2,1" />
                <text x={p(x) + L / 2} y={p(y) + 10} textAnchor="middle" fontSize={5.5} fill="#4488cc" fontFamily="monospace">coulissante</text>
            </g>
        );
    }
    return (
        <g pointerEvents="none">
            <rect x={p(x) - 4} y={p(y)} width={8} height={L} fill="white" />
            <rect x={p(x) - 3} y={p(y)} width={6} height={L / 2 - 1} fill="none" stroke={C.wall} strokeWidth={1} />
            <rect x={p(x) - 3} y={p(y) + L / 2 + 1} width={6} height={L / 2 - 1} fill="none" stroke="#4488cc" strokeWidth={1} strokeDasharray="2,1" />
        </g>
    );
}

function Window({ x, y, len, dir }) {
    const L = p(len);
    if (dir === "top" || dir === "bottom") {
        return (
            <g pointerEvents="none">
                <rect x={p(x)} y={p(y) - 4} width={L} height={8} fill="white" />
                <line x1={p(x)} y1={p(y) - 3} x2={p(x) + L} y2={p(y) - 3} stroke="#4488cc" strokeWidth={1} />
                <line x1={p(x)} y1={p(y)} x2={p(x) + L} y2={p(y)} stroke="#4488cc" strokeWidth={1.5} />
                <line x1={p(x)} y1={p(y) + 3} x2={p(x) + L} y2={p(y) + 3} stroke="#4488cc" strokeWidth={1} />
            </g>
        );
    }
    return (
        <g pointerEvents="none">
            <rect x={p(x) - 4} y={p(y)} width={8} height={L} fill="white" />
            <line x1={p(x) - 3} y1={p(y)} x2={p(x) - 3} y2={p(y) + L} stroke="#4488cc" strokeWidth={1} />
            <line x1={p(x)} y1={p(y)} x2={p(x)} y2={p(y) + L} stroke="#4488cc" strokeWidth={1.5} />
            <line x1={p(x) + 3} y1={p(y)} x2={p(x) + 3} y2={p(y) + L} stroke="#4488cc" strokeWidth={1} />
        </g>
    );
}

function Stairs({ x, y, w, h, label, steps = 7, future }) {
    const sw = p(w), sh = p(h);
    const stepH = sh / steps;
    return (
        <g pointerEvents="none">
            <rect x={p(x)} y={p(y)} width={sw} height={sh}
                fill={future ? "#c8d8f0" : "#dad6cc"} stroke={C.wall} strokeWidth={1.2} />
            {Array.from({ length: steps }, (_, i) => (
                <line key={i} x1={p(x)} y1={p(y) + i * stepH} x2={p(x) + sw} y2={p(y) + i * stepH}
                    stroke={C.wall} strokeWidth={0.6} />
            ))}
            {/* Arrow direction */}
            <polygon
                points={`${p(x) + sw / 2 - 4},${p(y) + sh - 8} ${p(x) + sw / 2},${p(y) + sh - 2} ${p(x) + sw / 2 + 4},${p(y) + sh - 8}`}
                fill={future ? "#4488aa" : C.wall} />
            <text x={p(x) + sw / 2} y={p(y) + 8} textAnchor="middle"
                fontSize={7} fill={future ? "#2266aa" : C.wall} fontFamily="monospace" fontWeight="bold">
                {label}
            </text>
        </g>
    );
}

function Toilet({ x, y }) {
    return (
        <g pointerEvents="none">
            <rect x={p(x)} y={p(y)} width={13} height={20} rx={3} fill="white" stroke={C.wall} strokeWidth={0.8} />
            <ellipse cx={p(x) + 6.5} cy={p(y) + 14} rx={4.5} ry={5} fill="#e0f0ff" stroke={C.wall} strokeWidth={0.6} />
        </g>
    );
}

function Shower({ x, y }) {
    return (
        <g pointerEvents="none">
            <rect x={p(x)} y={p(y)} width={p(1)} height={p(1)} fill="#d8f0ff" stroke={C.wall} strokeWidth={0.8} />
            <circle cx={p(x) + p(0.5)} cy={p(y) + p(0.5)} r={p(0.25)} fill="none" stroke="#4488cc" strokeWidth={0.8} />
            <line x1={p(x) + 4} y1={p(y) + 4} x2={p(x) + p(1) - 4} y2={p(y) + p(1) - 4} stroke="#4488cc" strokeWidth={0.5} />
            <line x1={p(x) + p(1) - 4} y1={p(y) + 4} x2={p(x) + 4} y2={p(y) + p(1) - 4} stroke="#4488cc" strokeWidth={0.5} />
        </g>
    );
}

function Sink({ x, y }) {
    return (
        <g pointerEvents="none">
            <ellipse cx={p(x) + 10} cy={p(y) + 9} rx={9} ry={8} fill="white" stroke={C.wall} strokeWidth={0.8} />
            <circle cx={p(x) + 10} cy={p(y) + 9} r={3.5} fill="#d0e8ff" stroke={C.wall} strokeWidth={0.5} />
        </g>
    );
}

function Island({ x, y, w = 1.8, h = 0.85 }) {
    return (
        <g pointerEvents="none">
            <rect x={p(x)} y={p(y)} width={p(w)} height={p(h)} rx={3}
                fill="#f0e8d0" stroke="#886644" strokeWidth={1.2} />
            <text x={p(x) + p(w) / 2} y={p(y) + p(h) / 2} textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fill="#886644" fontFamily="monospace">Îlot cuisine</text>
        </g>
    );
}

function Car({ x, y, w = 2.5, h = 5 }) {
    return (
        <g pointerEvents="none">
            <rect x={p(x)} y={p(y)} width={p(w)} height={p(h)} rx={8}
                fill="#b8c8d8" stroke="#8899aa" strokeWidth={0.8} opacity={0.6} />
            <rect x={p(x) + 4} y={p(y) + p(h) * 0.3} width={p(w) - 8} height={p(h) * 0.4}
                rx={4} fill="#d8e8f0" stroke="#8899aa" strokeWidth={0.5} opacity={0.5} />
        </g>
    );
}

function Pool({ x, y, w, h }) {
    return (
        <g pointerEvents="none">
            <rect x={p(x)} y={p(y)} width={p(w)} height={p(h)}
                fill={C.pool} stroke="#2288aa" strokeWidth={1.5} rx={4} />
            {Array.from({ length: Math.floor(h * 2) }, (_, i) => (
                <line key={i} x1={p(x)} y1={p(y) + i * S / 2} x2={p(x) + p(w)} y2={p(y) + i * S / 2}
                    stroke="rgba(0,120,180,0.2)" strokeWidth={0.5} />
            ))}
            <text x={p(x) + p(w) / 2} y={p(y) + p(h) / 2} textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill="#005588" fontFamily="Georgia" fontWeight="bold">Piscine</text>
            <text x={p(x) + p(w) / 2} y={p(y) + p(h) / 2 + 11} textAnchor="middle"
                fontSize={6.5} fill="#0077aa" fontFamily="monospace">5m × 3m</text>
        </g>
    );
}

// ── FLOOR DATA ────────────────────────────────────────────────

const FLOORS = {
    "-1": {
        name: "Sous-sol", short: "SS", color: "#5a4020", bg: "#e8e4dc", available: true,
        rooms: [
            {
                id: "ramp", label: "Rampe accès", x: 0, y: HY + 1, w: HX, h: 4, fill: C.ramp,
                area: 8, notes: ["Pente 15% · Largeur 3m", "Portail coulissant motorisé", "Éclairage sol LED"]
            },
            {
                id: "garage", label: "Garage", sub: "2 véhicules", x: HX, y: HY, w: 7, h: 6,
                fill: C.garage, area: 42,
                notes: ["2 places SUV côte à côte", "Porte sectionnelle motorisée", "Sol époxy anti-dérapant", "Éclairage LED plafonnier", "Accès escalier principal"]
            },
            {
                id: "buanderie", label: "Buanderie", x: HX + 7, y: HY, w: 2.5, h: 3,
                fill: C.service, area: 7.5,
                notes: ["Lave-linge + sèche-linge", "Bac laver + plan de travail", "Pompe de relevage eaux usées", "Toboggan à linge depuis couloir nuit (RDC)"]
            },
            {
                id: "wc_ss", label: "SDB/WC", x: HX + 9.5, y: HY, w: 1.5, h: 3,
                fill: C.sdb, area: 4.5, notes: ["WC + douche debout", "Ventilation VMC forcée"]
            },
            {
                id: "tech", label: "Local Technique", x: HX + 7, y: HY + 3, w: 4, h: 3,
                fill: C.service, area: 12,
                notes: ["Tableau électrique général", "Onduleur + groupe électrogène", "Ballon eau chaude 300L", "Nourrice plomberie centralisée", "Coffret domotique / fibre"]
            },
            {
                id: "vip", label: "Pièce VIP", sub: "Cinéma · Gym · Bureau", x: HX, y: HY + 6, w: 9, h: 5,
                fill: C.vip, area: 45,
                notes: ["Option A : Home cinéma 120\" + acoustique", "Option B : Salle de sport + sauna", "Option C : Bureau prestige + bibliothèque", "VMC double flux obligatoire", "Climatisation dédiée", "Finitions haut de gamme"]
            },
            {
                id: "couloir_ss", label: "Couloir", x: HX + 9, y: HY + 6, w: 2, h: 5,
                fill: C.couloir, area: 10, notes: ["Circulation sous-sol", "Escalier principal → RDC", "Escalier dérobé → Suite parentale"]
            },
        ],
        doors: [
            { x: HX + 2, y: HY, w: 1, dir: "top", swing: 1 },
            { x: HX + 7, y: HY + 0.8, w: 0.9, dir: "right", swing: 1 },
            { x: HX + 7, y: HY + 3.5, w: 0.9, dir: "right", swing: -1 },
            { x: HX + 9.5, y: HY + 0.8, w: 0.8, dir: "right", swing: 1 },
            { x: HX + 9, y: HY + 7, w: 0.9, dir: "right", swing: 1 },
            { x: HX + 2, y: HY + 6, w: 1, dir: "top", swing: -1 },
        ],
        windows: [],
        stairs: [
            { x: HX + 9.2, y: HY + 6.3, w: 1.8, h: 4.2, label: "↑ RDC", steps: 8 },
        ],
        fixtures: ["cars", "toilet_ss", "buanderie_eq"],
    },
    "0": {
        name: "Rez-de-Chaussée", short: "R+0", color: "#2a5020", bg: "#f2ede0", available: true,
        rooms: [
            {
                id: "parking_av", label: "Accès / Parking ext.", x: 0, y: 0, w: LOT_W - 2, h: HY,
                fill: C.garden, area: 39, outdoor: true,
                notes: ["Allée dallée jusqu'au portail", "2 places stationnement extérieur", "Portail électrique 3m de large", "Végétation tropicale en bordure"]
            },
            {
                id: "secu", label: "Poste Gardien", x: 0, y: 0, w: 1.5, h: 2,
                fill: C.security, area: 3,
                notes: ["Guérite de gardiennage 3m²", "Vue directe sur portail + entrée", "Interphone vidéo couleur", "Connexion alarme + caméras", "WC privatif possible +1m²"]
            },
            {
                id: "voisin", label: "Voisin →", x: HX + HW, y: 0, w: LOT_W - HX - HW, h: LOT_H,
                fill: C.voisin, outdoor: true, notes: ["Famille du collègue (côté droit)", "Mur mitoyen ou clôture"]
            },
            {
                id: "jardin_g", label: "Jardin G.", x: 0, y: HY, w: HX, h: HH,
                fill: C.garden, area: 24, outdoor: true, notes: ["Végétation tropicale", "Ombrage naturel côté gauche"]
            },
            {
                id: "jardin_ar_g", label: "Jardin arrière", x: 0, y: HY + HH, w: HX + 1, h: LOT_H - HY - HH,
                fill: C.garden, area: 10, outdoor: true, notes: ["Extension jardin gauche"]
            },
            {
                id: "piscine", label: "Piscine", x: HX + 0.8, y: HY + HH + 1, w: 5, h: 3.5,
                fill: C.pool, area: 17.5, pool: true,
                notes: ["5m × 3.5m · profondeur 1.5m", "Carrelage mosaïque bleu nuit", "Pompe + filtration + chimie auto", "Éclairage LED subaquatique coloré", "Plage béton lavé 1m tout autour", "Robinet de remplissage"]
            },
            {
                id: "cuisine_ext", label: "Cuisine Extérieure", x: HX + 7, y: HY + HH + 1, w: 3, h: 3,
                fill: C.outdoor_k, area: 9,
                notes: ["Cuisine africaine bois/charbon", "Plan de travail carrelé antiacide", "Stockage bois de chauffe abrité", "Auvent tôle/acier indépendant", "Évier + arrivée eau froide", "Connexion à la VMC buanderie SS"]
            },
            {
                id: "salon_jardin", label: "Terrasse Arrière", x: HX, y: HY + HH, w: HW, h: 1,
                fill: C.terrace, area: 11,
                notes: ["Terrasse dallée de plain-pied", "Liaison salon ↔ jardin ↔ piscine", "Pergola ou store motorisé possible"]
            },
            // Terrace front
            {
                id: "terr_av", label: "Terrasse Couverte", x: HX, y: HY - 2, w: 8, h: 2,
                fill: C.terrace, area: 16,
                notes: ["Auvent en double pente zinc", "Sol grand carrelage 80×80", "Vue jardin avant", "Portes coulissantes vers salon", "Profondeur 2m — ombragée"]
            },
            // Interior
            {
                id: "hall", label: "Hall d'Entrée", x: HX + 3, y: HY, w: 4, h: 2,
                fill: C.hall, area: 8,
                notes: ["Double porte vitrée sécurisée 1.4m", "Sas entrée élégant", "Placard d'entrée 1m", "Sol mosaïque travertin", "Connexion interphone gardien"]
            },
            {
                id: "wc_v", label: "WC Visiteur", x: HX + 7, y: HY, w: 1.5, h: 2,
                fill: C.sdb, area: 3, notes: ["WC + lave-mains suspendu", "Fenêtre haute ventilation", "Carrelage décoratif"]
            },
            {
                id: "acc_ss", label: "↓ Sous-sol", x: HX + 8.5, y: HY, w: 2.5, h: 2,
                fill: C.service, area: 5,
                notes: ["Escalier béton armé", "Accès garage + buanderie + VIP", "Porte coupe-feu recommandée", "Minuterie + détecteur fumée"]
            },
            {
                id: "salon", label: "GRAND SALON", sub: "★ Double Hauteur 5.5m",
                x: HX, y: HY + 2, w: 7, h: 5, fill: C.salon, area: 35,
                notes: ["Plafond double hauteur 5.5m", "4 grandes baies vitrées (terrasse avant)", "Ouverture sur terrasse arrière + piscine", "Velux possible pour lumière zénithale", "Éclairage indirect périphérie", "Climatisation gainable centralisée", "Cheminée décorative électrique optionnelle"]
            },
            {
                id: "cuis", label: "Cuisine + Îlot", x: HX + 7, y: HY + 2, w: 4, h: 4,
                fill: C.cuisine, area: 16,
                notes: ["Îlot central 2m×0.9m en marbre", "Plan de travail en U 6m linéaire", "Hotte décorative suspendue", "Fenêtres hautes lumière nord", "Accès terrasse arrière direct", "Passe-plat vers salon"]
            },
            {
                id: "cellier", label: "Cellier/Office", x: HX + 7, y: HY + 6, w: 4, h: 1,
                fill: C.service, area: 4, notes: ["Congélateur + rangements", "Connexion cuisine ↔ couloir nuit"]
            },
            {
                id: "couloir_n", label: "Couloir de Nuit", x: HX, y: HY + 7, w: HW, h: 1,
                fill: C.couloir, area: 11,
                notes: ["Séparation zone jour / zone nuit", "Puits de lumière possible (velux)", "Accès à toutes les chambres"]
            },
            {
                id: "suite", label: "Suite Parentale", x: HX, y: HY + 8, w: 4, h: 4,
                fill: C.suite, area: 16,
                notes: ["Chambre 4×3m isolée phoniquement", "Vue + accès direct jardin arrière", "Climatisation dédiée", "Porte vers terrasse arrière / piscine", "Intimité maximale — coin lecture"]
            },
            {
                id: "sdb_s", label: "SDB Suite", x: HX + 4, y: HY + 8, w: 2, h: 2,
                fill: C.sdb, area: 4,
                notes: ["Douche italienne 1×1m", "Baignoire îlot (optionnelle)", "Double vasque suspendue", "WC suspendu", "Carrelage travertin grand format"]
            },
            {
                id: "dress", label: "Dressing", x: HX + 4, y: HY + 10, w: 2, h: 2,
                fill: C.dressing, area: 4,
                notes: ["Dressing sur mesure éclairé", "Accès escalier dérobé → sous-sol", "Passage vers SDB suite", "LED intégrée dans rangements"]
            },
            {
                id: "ch2", label: "Chambre 2", x: HX + 6, y: HY + 8, w: 2.5, h: 4,
                fill: C.chambre, area: 10,
                notes: ["Chambre enfant / invité 10m²", "Placard intégré 2m de large", "Vue sur jardin arrière", "SDB attenante privative"]
            },
            {
                id: "sdb2", label: "SDB 2", x: HX + 8.5, y: HY + 8, w: 1.5, h: 2,
                fill: C.sdb, area: 3, notes: ["Douche + WC", "Lave-mains", "Ventilation VMC"]
            },
            {
                id: "ch3", label: "Chambre 3", x: HX + 8.5, y: HY + 10, w: 2.5, h: 2,
                fill: C.chambre, area: 5,
                notes: ["Chambre bureau ou enfant", "Fenêtre sur extérieur", "Placard intégré mural"]
            },
        ],
        doors: [
            { x: HX + 4, y: HY, w: 1.2, dir: "top", swing: 1 },
            { x: HX + 3, y: HY + 2.5, w: 0.9, dir: "left", swing: 1 },
            { x: HX + 7.2, y: HY, w: 0.8, dir: "right", swing: 1 },
            { x: HX + 8.5, y: HY + 0.8, w: 0.9, dir: "right", swing: 1 },
            { x: HX + 8, y: HY + 6, w: 0.9, dir: "bottom", swing: -1 },
            { x: HX + 1.5, y: HY + 7, w: 0.9, dir: "top", swing: 1 },
            { x: HX + 6.5, y: HY + 7, w: 0.9, dir: "top", swing: -1 },
            { x: HX + 9, y: HY + 7, w: 0.9, dir: "top", swing: 1 },
            { x: HX + 4, y: HY + 9, w: 0.8, dir: "right", swing: 1 },
            { x: HX + 4, y: HY + 10.3, w: 0.8, dir: "right", swing: -1 },
            { x: HX + 8.5, y: HY + 9, w: 0.8, dir: "right", swing: 1 },
            { x: HX + 10, y: HY + 6.2, w: 0.8, dir: "right", swing: -1 },
        ],
        sliding: [
            { x: HX + 1, y: HY + 2, w: 2.5, dir: "top" },
            { x: HX + 4.5, y: HY + 2, w: 1.5, dir: "top" },
            { x: HX + 1, y: HY + 7, w: 2.5, dir: "bottom" },
            { x: HX + 0.8, y: HY + 12, w: 1.5, dir: "bottom" },
        ],
        windows: [
            { x: HX + 0.5, y: HY + 2, len: 0.8, dir: "top" },
            { x: HX + 5.2, y: HY + 2, len: 0.8, dir: "top" },
            { x: HX, y: HY + 3, len: 1.5, dir: "left" },
            { x: HX, y: HY + 5.5, len: 1.2, dir: "left" },
            { x: HX + 7.5, y: HY + 2, len: 1.5, dir: "top" },
            { x: HX + 11, y: HY + 3, len: 1.5, dir: "right" },
            { x: HX, y: HY + 9, len: 1.8, dir: "left" },
            { x: HX + 4.5, y: HY + 8, len: 0.8, dir: "top" },
            { x: HX + 7.8, y: HY, len: 0.6, dir: "top" },
            { x: HX + 6.5, y: HY + 12, len: 1.2, dir: "bottom" },
            { x: HX + 11, y: HY + 9, len: 1.5, dir: "right" },
            { x: HX + 11, y: HY + 10.5, len: 1, dir: "right" },
            { x: HX + 9, y: HY + 12, len: 1.2, dir: "bottom" },
        ],
        stairs: [
            { x: HX + 8.7, y: HY + 0.2, w: 2.1, h: 1.6, label: "↓ SS", steps: 6 },
            { x: HX + 4.3, y: HY + 10.1, w: 1.4, h: 1.8, label: "↑ R+1", steps: 6, future: true },
        ],
        fixtures: ["toilet_v", "toilet_sdb2", "toilet_sdb2b", "shower_s", "sink_s", "shower2", "island", "toilet_suite"],
    },
    "1": {
        name: "R+1 (futur)", short: "R+1", color: "#204060", bg: "#e8f0f8", available: false,
        rooms: [
            {
                id: "dalle1", label: "Dalle R+1 — Structure en attente", x: HX, y: HY, w: HW, h: HH,
                fill: C.future, area: 132,
                notes: ["Dalle béton armé déjà coulée", "Imperméabilisée — toit-terrasse temporaire", "Trémie escalier réservée (2m×1.5m)", "Attentes plomberie montantes posées", "Poteaux R+2 ferraillés et en attente", "Plan suggéré : 3 ch + 2 SDB + séjour", "Terrasse au-dessus salon double hauteur"]
            },
            {
                id: "tremie1", label: "Trémie escalier", x: HX + 4.3, y: HY + 10.1, w: 1.4, h: 1.8,
                fill: "#a0c0e0", area: 2.5, notes: ["Réservation dalle pour escalier futur", "Actuellement fermée par trappe légère"]
            },
        ],
        doors: [], sliding: [], windows: [], stairs: [], fixtures: [],
    },
    "2": {
        name: "R+2 (futur)", short: "R+2", color: "#402060", bg: "#f0e8f8", available: false,
        rooms: [
            {
                id: "dalle2", label: "R+2 — Toiture & Suite de Prestige", x: HX, y: HY, w: HW, h: HH,
                fill: C.future2, area: 132,
                notes: ["Niveau toiture + suite panoramique", "Terrasse-toit 360° vue sur Lomé", "Suite de prestige possible", "Poteaux dimensionnés dès fondation", "Construction phase finale"]
            },
        ],
        doors: [], sliding: [], windows: [], stairs: [], fixtures: [],
    },
};

const COLUMNS = [
    [HX, HY], [HX + 4, HY], [HX + 7, HY], [HX + HW, HY],
    [HX, HY + HH / 2], [HX + HW, HY + HH / 2],
    [HX, HY + HH], [HX + 4, HY + HH], [HX + 7, HY + HH], [HX + HW, HY + HH],
];

// ── Main Component ─────────────────────────────────────────────

export default function VillaPlan() {
    const [floor, setFloor] = useState("0");
    const [selected, setSelected] = useState(null);
    const [zoom, setZoom] = useState(1.1);
    const [pan, setPan] = useState({ x: 24, y: 16 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, px: 0, py: 0 });
    const [isDark, setIsDark] = useState(false); // Theme state

    const fd = FLOORS[floor];
    const selectedRoom = fd.rooms.find(r => r.id === selected);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        setZoom(z => Math.max(0.4, Math.min(5, z * (e.deltaY > 0 ? 0.9 : 1.1))));
    }, []);
    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0) return;
        setDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY, px: pan.x, py: pan.y });
    }, [pan]);
    const handleMouseMove = useCallback((e) => {
        if (!dragging) return;
        setPan({ x: dragStart.px + (e.clientX - dragStart.x), y: dragStart.py + (e.clientY - dragStart.y) });
    }, [dragging, dragStart]);
    const handleMouseUp = useCallback(() => setDragging(false), []);

    const floorOrder = ["-1", "0", "1", "2"];
    const floorTheme = {
        "-1": { btn: "#3a2c18", active: "#c8a020" },
        "0": { btn: "#182c18", active: "#60b840" },
        "1": { btn: "#182040", active: "#4088c0" },
        "2": { btn: "#28184a", active: "#a060e0" },
    };

    // Theme object mapping
    const t = {
        bg: isDark ? "#141210" : "#faf9f7",
        topBar: isDark ? "#1e1a16" : "#ffffff",
        panel: isDark ? "#1a1612" : "#ffffff",
        canvas: isDark ? "#1a1612" : "#f0ece4",
        border: isDark ? "#3a3028" : "#e0ddd5",
        panelBorder: isDark ? "#2e2820" : "#e0ddd5",
        textSub: isDark ? "#666" : "#888",
        textMuted: isDark ? "#555" : "#aaa",
        btnBtn: isDark ? "#141210" : "#ffffff",
        zoomBtn: isDark ? "#2a2420" : "#f4f2ee",
        zoomBorder: isDark ? "#4a4030" : "#e0ddd5",
        legendTitle: isDark ? "#5a5040" : "#a89b88",
        noteLines: isDark ? "#252018" : "#f0ece4",
    };

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: t.bg, fontFamily: "'Courier New', monospace", overflow: "hidden",
            userSelect: "none", transition: "background 0.3s ease"
        }}>
            {/* ── Top Bar ── */}
            <div style={{
                display: "flex", alignItems: "center", padding: "7px 16px", gap: 12, flexShrink: 0,
                background: t.topBar, borderBottom: `1px solid ${t.border}`, transition: "background 0.3s ease"
            }}>
                <div>
                    <div style={{ fontSize: 10, color: C.accent, letterSpacing: 3, textTransform: "uppercase", fontWeight: "bold" }}>
                        Villa Évolutive R+2
                    </div>
                    <div style={{ fontSize: 8, color: t.textSub, marginTop: 1 }}>
                        Agovodou, Lomé · 300 m² · Esquisse interactive
                    </div>
                </div>

                {/* Floor tabs */}
                <div style={{ display: "flex", gap: 3, marginLeft: 20 }}>
                    {floorOrder.map(f => {
                        const isCurrent = floor === f;
                        const available = FLOORS[f].available;
                        const th = floorTheme[f];
                        return (
                            <button key={f} onClick={() => { setFloor(f); setSelected(null); }}
                                style={{
                                    padding: "5px 14px", border: "1px solid",
                                    borderColor: isCurrent ? th.active : t.border,
                                    background: isCurrent ? th.btn : t.btnBtn,
                                    color: isCurrent ? th.active : available ? t.textSub : t.textMuted,
                                    fontSize: 9, cursor: "pointer", fontFamily: "monospace",
                                    transition: "all 0.15s",
                                }}>
                                <div style={{ fontSize: 12, fontWeight: "bold" }}>{FLOORS[f].short}</div>
                                <div style={{ fontSize: 7, marginTop: 1, color: isCurrent ? th.active : t.textMuted }}>
                                    {FLOORS[f].name.split(" ")[0]}
                                </div>
                                {!available && <div style={{ fontSize: 6, color: "#664422" }}>futur</div>}
                            </button>
                        );
                    })}
                </div>

                {/* Right Controls */}
                <div style={{ display: "flex", gap: 10, marginLeft: "auto", alignItems: "center" }}>
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDark(!isDark)}
                        style={{
                            background: "none", border: "1px solid", borderColor: t.zoomBorder, borderRadius: 20,
                            padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                            color: t.textSub, fontSize: 10, transition: "background 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = t.zoomBtn}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                        {isDark ? "☀️ Light" : "🌙 Dark"}
                    </button>

                    {/* Zoom */}
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: 4 }}>
                        <span style={{ fontSize: 8, color: t.textMuted, marginRight: 4 }}>Zoom: {Math.round(zoom * 100)}%</span>
                        {[{ l: "+", fn: () => setZoom(z => Math.min(5, z * 1.25)) },
                        { l: "−", fn: () => setZoom(z => Math.max(0.4, z / 1.25)) },
                        { l: "↺", fn: () => { setZoom(1.1); setPan({ x: 24, y: 16 }); } }
                        ].map(({ l, fn }) => (
                            <button key={l} onClick={fn} style={{
                                width: 26, height: 26, background: t.zoomBtn, border: `1px solid ${t.zoomBorder}`,
                                color: C.accent, cursor: "pointer", fontSize: l === "↺" ? 11 : 16, fontFamily: "monospace"
                            }}>{l}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                {/* Canvas */}
                <div style={{
                    flex: 1, overflow: "hidden", position: "relative",
                    cursor: dragging ? "grabbing" : "grab",
                    background: t.canvas, transition: "background 0.3s ease"
                }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <svg width="100%" height="100%">
                        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

                            {/* Lot */}
                            <rect x={0} y={0} width={p(LOT_W)} height={p(LOT_H)}
                                fill={fd.bg} stroke="#8a7a5a" strokeWidth={2} />

                            {/* Grid 1m */}
                            {Array.from({ length: LOT_W + 1 }, (_, i) => (
                                <line key={`gv${i}`} x1={p(i)} y1={0} x2={p(i)} y2={p(LOT_H)}
                                    stroke="rgba(140,120,80,0.18)" strokeWidth={0.5} />
                            ))}
                            {Array.from({ length: LOT_H + 1 }, (_, i) => (
                                <line key={`gh${i}`} x1={0} y1={p(i)} x2={p(LOT_W)} y2={p(i)}
                                    stroke="rgba(140,120,80,0.18)" strokeWidth={0.5} />
                            ))}

                            {/* Rooms */}
                            {fd.rooms.map(room => (
                                <g key={room.id}
                                    onClick={() => setSelected(selected === room.id ? null : room.id)}
                                    style={{ cursor: "pointer" }}>
                                    {room.pool ? <Pool x={room.x} y={room.y} w={room.w} h={room.h} /> :
                                        <rect x={p(room.x)} y={p(room.y)} width={p(room.w)} height={p(room.h)}
                                            fill={room.fill}
                                            stroke={selected === room.id ? C.accent : C.wall}
                                            strokeWidth={selected === room.id ? 3 : room.outdoor ? 0.8 : 2}
                                            opacity={room.outdoor ? 0.85 : 1} />
                                    }
                                    {selected === room.id && !room.pool && (
                                        <rect x={p(room.x)} y={p(room.y)} width={p(room.w)} height={p(room.h)}
                                            fill={C.accent} opacity={0.18} pointerEvents="none" />
                                    )}
                                    {/* Labels */}
                                    {!room.pool && room.w > 1.2 && room.h > 0.9 && (
                                        <>
                                            <text x={p(room.x + room.w / 2)} y={p(room.y + room.h / 2) - (room.sub ? 5 : 0)}
                                                textAnchor="middle" dominantBaseline="middle"
                                                fontSize={Math.min(10, p(Math.min(room.w * 0.4, room.h * 0.35)))}
                                                fontWeight={room.id === "salon" ? "700" : "500"}
                                                fontFamily="Georgia, serif" fill={room.id === "dalle1" || room.id === "dalle2" ? t.textSub : C.wall} pointerEvents="none">
                                                {room.label}
                                            </text>
                                            {room.sub && (
                                                <text x={p(room.x + room.w / 2)} y={p(room.y + room.h / 2) + 7}
                                                    textAnchor="middle" fontSize={6} fill="#888" fontFamily="monospace" pointerEvents="none">
                                                    {room.sub}
                                                </text>
                                            )}
                                            {room.area > 0 && room.w > 1.5 && room.h > 1.2 && (
                                                <text x={p(room.x + room.w / 2)} y={p(room.y + room.h / 2) + (room.sub ? 14 : 8)}
                                                    textAnchor="middle" fontSize={6} fill="#999" fontFamily="monospace" pointerEvents="none">
                                                    {room.area}m²
                                                </text>
                                            )}
                                        </>
                                    )}
                                </g>
                            ))}

                            {/* House outline */}
                            <rect x={p(HX)} y={p(HY)} width={p(HW)} height={p(HH)}
                                fill="none" stroke={C.wall} strokeWidth={floor === "-1" ? 3 : 4.5} pointerEvents="none" />

                            {/* Structural columns */}
                            {COLUMNS.map(([cx, cy], i) => (
                                <g key={`c${i}`} pointerEvents="none">
                                    <rect x={p(cx) - 5} y={p(cy) - 5} width={10} height={10} fill="#2a2018" />
                                    <rect x={p(cx) - 4} y={p(cy) - 4} width={8} height={8} fill="none" stroke={C.accent} strokeWidth={0.8} />
                                </g>
                            ))}

                            {/* Doors (battant) */}
                            {(fd.doors || []).map((d, i) => (
                                <DoorBattant key={`db${i}`} {...d} />
                            ))}
                            {/* Sliding doors */}
                            {(fd.sliding || []).map((d, i) => (
                                <DoorSliding key={`ds${i}`} {...d} />
                            ))}
                            {/* Windows */}
                            {(fd.windows || []).map((w, i) => (
                                <Window key={`w${i}`} {...w} />
                            ))}
                            {/* Stairs */}
                            {(fd.stairs || []).map((s, i) => (
                                <Stairs key={`st${i}`} {...s} />
                            ))}

                            {/* Floor-specific fixtures */}
                            {floor === "-1" && <>
                                <Car x={HX + 0.25} y={HY + 0.25} w={2.8} h={5.5} />
                                <Car x={HX + 3.75} y={HY + 0.25} w={2.8} h={5.5} />
                                <Toilet x={HX + 9.7} y={HY + 0.3} />
                                <Shower x={HX + 9.7} y={HY + 1.5} />
                            </>}
                            {floor === "0" && <>
                                <Toilet x={HX + 7.25} y={HY + 0.2} />
                                <Sink x={HX + 8.1} y={HY + 0.25} />
                                <Shower x={HX + 4.2} y={HY + 8.15} />
                                <Sink x={HX + 5.35} y={HY + 8.15} />
                                <Toilet x={HX + 4.2} y={HY + 9.3} />
                                <Toilet x={HX + 8.65} y={HY + 8.15} />
                                <Shower x={HX + 8.65} y={HY + 9.3} />
                                <Island x={HX + 7.4} y={HY + 3.2} />
                            </>}

                            {/* Outdoor kitchen symbol */}
                            {floor === "0" && (
                                <g pointerEvents="none">
                                    <rect x={p(HX + 7.3)} y={p(HY + HH + 1.3)} width={p(2.4)} height={p(0.6)}
                                        fill="#c8a850" stroke="#886600" strokeWidth={0.8} rx={2} />
                                    <text x={p(HX + 8.5)} y={p(HY + HH + 1.6)} textAnchor="middle"
                                        fontSize={6} fill="#664400" fontFamily="monospace">plan de travail</text>
                                </g>
                            )}

                            {/* Lot boundary dashes */}
                            <rect x={1} y={1} width={p(LOT_W) - 2} height={p(LOT_H) - 2}
                                fill="none" stroke="#9a8850" strokeWidth={1} strokeDasharray="6,3" pointerEvents="none" />

                            {/* Street */}
                            <text x={p(LOT_W / 2)} y={9} textAnchor="middle"
                                fontSize={8} fill="#9a8860" fontFamily="monospace" letterSpacing={3}>— RUE —</text>

                            {/* Scale bar */}
                            <g transform={`translate(5,${p(LOT_H) - 12})`}>
                                {[0, 1, 2, 3, 4, 5].map(i => (
                                    <rect key={i} x={p(i)} y={0} width={p(1)} height={6}
                                        fill={i % 2 === 0 ? "#2a2018" : "white"} stroke="#2a2018" strokeWidth={0.4} />
                                ))}
                                {[0, 5].map(v => (
                                    <text key={v} x={p(v)} y={-2} textAnchor="middle" fontSize={7}
                                        fill={C.accent} fontFamily="monospace">{v}m</text>
                                ))}
                            </g>

                            {/* Compass */}
                            <g transform={`translate(${p(LOT_W) - 28},18)`}>
                                <circle cx={0} cy={0} r={15} fill={isDark ? "rgba(20,16,12,0.75)" : "rgba(255,255,255,0.75)"} stroke={C.accent} strokeWidth={0.8} />
                                <polygon points="0,-12 3.5,0 0,-5 -3.5,0" fill={C.accent} />
                                <polygon points="0,12 3.5,0 0,5 -3.5,0" fill={isDark ? "#666" : "#aaa"} />
                                <text x={0} y={-15} textAnchor="middle" fontSize={7} fill={C.accent} fontWeight="bold">N</text>
                                <text x={0} y={24} textAnchor="middle" fontSize={5} fill={t.textMuted} fontFamily="monospace">à confirmer</text>
                            </g>

                            {/* Floor watermark */}
                            <text x={p(LOT_W / 2)} y={p(LOT_H / 2) + 20}
                                textAnchor="middle" dominantBaseline="middle"
                                fontSize={72} fill={fd.bg} fontWeight="900" fontFamily="Georgia"
                                opacity={0.6} pointerEvents="none">
                                {fd.short}
                            </text>

                        </g>
                    </svg>

                    {/* Hints */}
                    <div style={{
                        position: "absolute", bottom: 8, left: 8,
                        fontSize: 8, color: t.textMuted, fontFamily: "monospace", lineHeight: 1.8
                    }}>
                        🖱 Molette = zoom &nbsp;·&nbsp; Glisser = déplacer &nbsp;·&nbsp; Clic pièce = détails
                    </div>

                    {/* Legend symbols */}
                    <div style={{
                        position: "absolute", bottom: 8, right: 8,
                        fontSize: 7, color: t.textMuted, fontFamily: "monospace", textAlign: "right", lineHeight: 2
                    }}>
                        <span style={{ color: "#4488cc" }}>══</span> Fenêtre &nbsp;
                        <span style={{ color: "#888" }}>⌒</span> Porte battante &nbsp;
                        <span style={{ color: "#4488cc" }}>⇋</span> Coulissante &nbsp;
                        <span style={{ color: C.accent }}>■</span> Poteau R+2
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div style={{
                    width: 256, background: t.panel, borderLeft: `1px solid ${t.panelBorder}`,
                    display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
                    transition: "background 0.3s ease"
                }}>
                    {/* Active floor badge */}
                    <div style={{
                        padding: "10px 14px", borderBottom: `1px solid ${t.panelBorder}`,
                        background: floorTheme[floor].btn + (isDark ? "55" : "22")
                    }}>
                        <div style={{ fontSize: 8, color: t.textSub, letterSpacing: 2, marginBottom: 3 }}>ÉTAGE ACTIF</div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: floorTheme[floor].active }}>
                            {fd.name}
                        </div>
                        {!fd.available && (
                            <div style={{
                                marginTop: 5, fontSize: 8, color: "#cc8844", padding: "2px 8px",
                                background: isDark ? "#3a2010" : "#fff5e6", border: isDark ? "1px solid #664422" : "1px solid #eebb88", display: "inline-block"
                            }}>
                                ⏳ Phase future — structure prévue
                            </div>
                        )}
                    </div>

                    {/* Room info */}
                    <div style={{ flex: 1, overflow: "auto", padding: "10px 14px" }}>
                        {selectedRoom ? (
                            <div>
                                <button onClick={() => setSelected(null)}
                                    style={{
                                        fontSize: 7, color: t.textSub, background: "none", border: "none",
                                        cursor: "pointer", marginBottom: 8, fontFamily: "monospace"
                                    }}>
                                    ← retour
                                </button>
                                <div style={{
                                    fontSize: 12, color: C.accent, fontWeight: "bold",
                                    letterSpacing: 0.5, marginBottom: 4, lineHeight: 1.5
                                }}>
                                    {selectedRoom.label}
                                </div>
                                {selectedRoom.sub && (
                                    <div style={{ fontSize: 8, color: "#aa8844", marginBottom: 6 }}>{selectedRoom.sub}</div>
                                )}
                                {selectedRoom.area > 0 && (
                                    <div style={{ fontSize: 28, color: isDark ? "#f0d880" : "#d0a030", fontWeight: "bold", marginBottom: 10 }}>
                                        {selectedRoom.area}
                                        <span style={{ fontSize: 11, color: t.textSub, fontWeight: "normal" }}> m²</span>
                                    </div>
                                )}
                                <div style={{ fontSize: 7, color: t.legendTitle, letterSpacing: 1, marginBottom: 6 }}>
                                    {selectedRoom.outdoor ? "🌿 ESPACE EXTÉRIEUR" : "🏠 ESPACE INTÉRIEUR"}
                                </div>
                                {selectedRoom.notes?.map((note, i) => (
                                    <div key={i} style={{
                                        fontSize: 8.5, color: isDark ? "#a09070" : "#807050", lineHeight: 1.8,
                                        padding: "2px 0", borderBottom: `1px solid ${t.noteLines}`
                                    }}>
                                        · {note}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: 8, color: t.textMuted, marginBottom: 14, lineHeight: 2 }}>
                                    Clique sur une pièce pour voir ses détails, notes et surfaces.
                                </div>

                                <div style={{ fontSize: 7, color: t.legendTitle, letterSpacing: 1, marginBottom: 8 }}>LÉGENDE COULEURS</div>
                                {[
                                    [C.salon, "Grand Salon (DH)"], [C.cuisine, "Cuisine + Îlot"],
                                    [C.suite, "Suite parentale"], [C.chambre, "Chambres"],
                                    [C.sdb, "SDB / WC"], [C.dressing, "Dressing"],
                                    [C.garage, "Garage"], [C.vip, "Pièce VIP"],
                                    [C.terrace, "Terrasse"], [C.pool, "Piscine"],
                                    [C.outdoor_k, "Cuisine ext. (bois)"], [C.security, "Poste gardien"],
                                    [C.garden, "Jardins"], [C.service, "Locaux techniques"],
                                ].map(([col, lbl]) => (
                                    <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                        <div style={{
                                            width: 10, height: 10, background: col,
                                            border: `1px solid ${t.zoomBorder}`, flexShrink: 0
                                        }} />
                                        <span style={{ fontSize: 8, color: isDark ? "#7a7060" : "#8a8070" }}>{lbl}</span>
                                    </div>
                                ))}

                                <div style={{ fontSize: 7, color: t.legendTitle, letterSpacing: 1, marginTop: 14, marginBottom: 8 }}>RÉSUMÉ SURFACES</div>
                                {[
                                    ["Lot total", "300 m²"],
                                    ["Emprise maison", "~132 m²"],
                                    ["Terrasse couverte", "~16 m²"],
                                    ["Piscine", "~17 m²"],
                                    ["Cuisine ext.", "~9 m²"],
                                    ["──────────────", ""],
                                    ["Salon DH", "~35 m²"],
                                    ["Suite parentale", "~24 m²"],
                                    ["Chambres 2+3", "~15 m²"],
                                    ["Sous-sol total", "~90 m²"],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                        <span style={{ fontSize: 8, color: k.startsWith("─") ? t.noteLines : (isDark ? "#7a7060" : "#8a8070") }}>{k}</span>
                                        <span style={{ fontSize: 8, color: C.accent, fontWeight: "bold" }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick floor switch */}
                    <div style={{ padding: "8px 12px", borderTop: `1px solid ${t.panelBorder}` }}>
                        <div style={{ fontSize: 6, color: t.legendTitle, letterSpacing: 1, marginBottom: 5 }}>CHANGER D'ÉTAGE</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                            {floorOrder.map(f => {
                                const th = floorTheme[f];
                                const active = floor === f;
                                return (
                                    <button key={f} onClick={() => { setFloor(f); setSelected(null); }}
                                        style={{
                                            padding: "5px 4px", border: "1px solid",
                                            borderColor: active ? th.active : t.panelBorder,
                                            background: active ? th.btn : t.btnBtn,
                                            color: active ? th.active : t.textSub,
                                            fontSize: 8, cursor: "pointer", fontFamily: "monospace", textAlign: "center",
                                            transition: "background 0.2s"
                                        }}>
                                        <div style={{ fontSize: 11, fontWeight: "bold" }}>{FLOORS[f].short}</div>
                                        <div style={{ fontSize: 6, color: active ? th.active : t.textMuted }}>
                                            {FLOORS[f].name.split(" ").slice(0, 2).join(" ")}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}