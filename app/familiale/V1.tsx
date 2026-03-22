// @ts-nocheck
"use client";
import { useState } from "react";

const S = 36; // 1m = 36px
const px = v => v * S;

const LOT_W = 15;
const LOT_H = 20;

// House on lot: 1.75m left margin, 1.75m right margin, 5m front, 3m rear
const HX = 1.75, HY = 5, HW = 11.5, HH = 12;

// Terrace: in front of salon, attached
const TX = HX, TY = 2, TW = 8, TH = 3;

const C = {
    lot: "#f2ede0",
    garden: "#c4d9a0",
    terrace: "#e8c87a",
    allee: "#ccc0a8",
    voisin: "#d4cfc0",
    salon: "#fffbf0",
    cuisine: "#edf8ed",
    suite: "#fff4f4",
    chambre: "#f5f0ff",
    sdb: "#e0f0ff",
    dressing: "#f0e8ff",
    hall: "#f0ece0",
    couloir: "#e8e4d8",
    service: "#dedad0",
    wall: "#1a1510",
    grid: "#e0d8c8",
    accent: "#c09030",
};

const SPACES = [
    // ── Outdoor
    { id: "j_av", label: "Jardin Avant", x: 0, y: 0, w: LOT_W, h: 2, fill: C.garden, border: "outdoor" },
    { id: "j_g", label: "", x: 0, y: 2, w: HX, h: 18, fill: C.garden, border: "outdoor" },
    { id: "j_ar", label: "Jardin Arrière", x: HX, y: HY + HH, w: HW, h: 3, fill: C.garden, border: "outdoor" },
    {
        id: "voisin", label: "← Voisin", x: HX + HW, y: 2, w: 1.75, h: 18, fill: C.voisin, border: "outdoor",
        note: "Maison famille du collègue"
    },

    // ── Approach
    {
        id: "terr", label: "Terrasse Couverte", x: TX, y: TY, w: TW, h: TH, fill: C.terrace, border: "terrace",
        area: 24, note: "Auvent en double pente · Baies vitrées vers salon\nSol carrelage grand format · Vue jardin avant\nLumière naturelle directe"
    },
    { id: "allee", label: "Allée / Accès", x: TX + TW, y: TY, w: HX + HW - TX - TW, h: TH, fill: C.allee, border: "outdoor" },

    // ── House front strip (y: HY to HY+2)
    {
        id: "hall", label: "Hall d'Entrée", x: HX + 2, y: HY, w: 5.5, h: 2, fill: C.hall, border: "room",
        area: 11, note: "Double porte vitrée · Vue sur salon\nAccès terrasse ↔ intérieur"
    },
    { id: "wc", label: "WC", x: HX + 7.5, y: HY, w: 2, h: 2, fill: C.sdb, border: "room", area: 4 },
    {
        id: "acc_ss", label: "↓ Sous-sol", x: HX + 9.5, y: HY, w: 2, h: 2, fill: C.service, border: "room",
        area: 4, note: "Escalier béton vers garage\nbuanderie · pièce VIP"
    },

    // ── Living zone (y: HY+2 to HY+7)
    {
        id: "salon", label: "GRAND SALON", x: HX, y: HY + 2, w: 7.5, h: 5, fill: C.salon, border: "salon",
        area: 37, sub: "Double Hauteur · 5.5m de plafond",
        note: "Hauteur sous plafond 5.5m\nBaies vitrées côté terrasse + jardin\nÉclairage zénithal (velux) possible\nLumière naturelle toute la journée\nOuverture sur terrasse : portes coulissantes"
    },
    {
        id: "cuis", label: "Cuisine + Îlot", x: HX + 7.5, y: HY + 2, w: 4, h: 5, fill: C.cuisine, border: "room",
        area: 20, note: "Îlot central · Plan de travail en U\nFenêtres hautes pour lumière\nAccès direct sous-sol"
    },

    // ── Corridor (y: HY+7 to HY+8)
    { id: "coul", label: "Couloir de Nuit", x: HX, y: HY + 7, w: HW, h: 1, fill: C.couloir, border: "room", area: 11.5 },

    // ── Night zone (y: HY+8 to HY+12)
    {
        id: "suite", label: "Suite Parentale", x: HX, y: HY + 8, w: 4, h: 4, fill: C.suite, border: "room",
        area: 16, note: "Accès privé: dressing → escalier dérobé → sous-sol\nVue + accès jardin arrière\nIsolée phoniquement du reste"
    },
    { id: "sdb_s", label: "SDB Suite", x: HX + 4, y: HY + 8, w: 1.5, h: 2, fill: C.sdb, border: "room", area: 3 },
    {
        id: "dress", label: "Dressing", x: HX + 4, y: HY + 10, w: 1.5, h: 2, fill: C.dressing, border: "room",
        area: 3, note: "Escalier dérobé → sous-sol\nPassage vers SDB suite"
    },
    { id: "ch2", label: "Chambre 2", x: HX + 5.5, y: HY + 8, w: 3, h: 4, fill: C.chambre, border: "room", area: 12 },
    { id: "ch3", label: "Chambre 3", x: HX + 8.5, y: HY + 8, w: 3, h: 4, fill: C.chambre, border: "room", area: 12 },
];

const SW = { outdoor: 0.5, terrace: 2, room: 2.5, salon: 3 };

function RoomLabel({ sp }) {
    const cx = px(sp.x + sp.w / 2);
    const cy = px(sp.y + sp.h / 2);
    const small = sp.w * S < 72 || sp.h * S < 56;
    const fs = small ? 7 : (sp.id === "salon" ? 11 : 9);

    return (
        <g pointerEvents="none">
            {sp.label && sp.label.split("\n").map((line, i, arr) => (
                <text key={i}
                    x={cx} y={cy + (i - (arr.length - 1) / 2) * (fs + 3) - (sp.sub ? fs / 2 : 0)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={fs} fontWeight={sp.id === "salon" ? "700" : "500"}
                    fontFamily="'Georgia', serif" fill={C.wall} letterSpacing="0.5"
                >{line}</text>
            ))}
            {sp.sub && (
                <text x={cx} y={cy + (fs + 2)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={6.5} fill="#887755" fontFamily="'Courier New', monospace" letterSpacing="0.5"
                >{sp.sub}</text>
            )}
            {sp.area && sp.w * S > 60 && sp.h * S > 44 && (
                <text x={cx} y={cy + (sp.sub ? fs * 2.5 + 2 : fs + 6)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={6.5} fill="#aa9977" fontFamily="'Courier New', monospace"
                >{sp.area} m²</text>
            )}
        </g>
    );
}

// Sun rays for light indicator
function SunRays({ x, y, r = 14 }) {
    const rays = Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return {
            x1: x + Math.cos(a) * (r + 2), y1: y + Math.sin(a) * (r + 2),
            x2: x + Math.cos(a) * (r + 8), y2: y + Math.sin(a) * (r + 8),
        };
    });
    return (
        <g>
            <circle cx={x} cy={y} r={r} fill="#f5c842" opacity={0.7} />
            {rays.map((ray, i) => (
                <line key={i} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2}
                    stroke="#f5a800" strokeWidth={1.5} />
            ))}
            <text x={x} y={y + r + 20} textAnchor="middle" fontSize={7}
                fill="#b87800" fontFamily="'Courier New', monospace">Lumière</text>
        </g>
    );
}

function DimLine({ x1, y1, x2, y2, label, orient = "h" }) {
    const mx = (px(x1) + px(x2)) / 2;
    const my = (px(y1) + px(y2)) / 2;
    return (
        <g>
            <line x1={px(x1)} y1={px(y1)} x2={px(x2)} y2={px(y2)}
                stroke="#aa9966" strokeWidth={0.75} strokeDasharray="3,2" />
            <line x1={px(x1)} y1={px(y1) - 4} x2={px(x1)} y2={px(y1) + 4}
                stroke="#aa9966" strokeWidth={0.75} />
            <line x1={px(x2)} y1={px(y2) - 4} x2={px(x2)} y2={px(y2) + 4}
                stroke="#aa9966" strokeWidth={0.75} />
            <text x={mx} y={my - 5} textAnchor="middle" fontSize={7}
                fill="#886644" fontFamily="'Courier New', monospace">{label}</text>
        </g>
    );
}

export default function VillaPlan() {
    const [hovered, setHovered] = useState<string | null>(null);
    const hsp = SPACES.find(s => s.id === hovered);

    const SVG_W = px(LOT_W) + 60;
    const SVG_H = px(LOT_H) + 60;

    return (
        <div style={{
            display: "flex", gap: 0, background: "#f5f0e4",
            fontFamily: "'Georgia', serif", minHeight: "100vh",
            padding: "20px 16px"
        }}>
            {/* Plan */}
            <div>
                <div style={{ marginBottom: 8 }}>
                    <span style={{
                        fontSize: 11, letterSpacing: 4, color: "#5a4020",
                        fontFamily: "'Courier New', monospace", textTransform: "uppercase"
                    }}>Villa Évolutive R+2 — Plan Rez-de-Chaussée</span>
                    <span style={{
                        marginLeft: 20, fontSize: 9, color: "#9a8860",
                        fontFamily: "'Courier New', monospace"
                    }}>300 m² · Agovodou, Lomé · Esquisse</span>
                </div>

                <svg width={SVG_W} height={SVG_H} style={{
                    border: "2px solid #1a1510",
                    boxShadow: "4px 4px 16px rgba(0,0,0,0.15)"
                }}>
                    {/* Background */}
                    <rect width={SVG_W} height={SVG_H} fill={C.lot} />

                    {/* Grid (faint) */}
                    {Array.from({ length: LOT_W * 2 }, (_, i) => (
                        <line key={`gv${i}`} x1={px(i * 0.5)} y1={0} x2={px(i * 0.5)} y2={SVG_H}
                            stroke={C.grid} strokeWidth={0.3} />
                    ))}
                    {Array.from({ length: LOT_H * 2 }, (_, i) => (
                        <line key={`gh${i}`} x1={0} y1={px(i * 0.5)} x2={SVG_W} y2={px(i * 0.5)}
                            stroke={C.grid} strokeWidth={0.3} />
                    ))}

                    {/* Spaces */}
                    {SPACES.map(sp => (
                        <g key={sp.id}
                            onMouseEnter={() => sp.note || sp.area ? setHovered(sp.id) : null}
                            onMouseLeave={() => setHovered(null)}
                            style={{ cursor: sp.note || sp.area ? "pointer" : "default" }}
                        >
                            <rect
                                x={px(sp.x)} y={px(sp.y)} width={px(sp.w)} height={px(sp.h)}
                                fill={sp.fill}
                                stroke={C.wall}
                                strokeWidth={SW[sp.border] || 0.5}
                                opacity={hovered === sp.id ? 0.8 : 1}
                            />
                            {hovered === sp.id && (
                                <rect x={px(sp.x)} y={px(sp.y)} width={px(sp.w)} height={px(sp.h)}
                                    fill={C.accent} opacity={0.12} />
                            )}
                            <RoomLabel sp={sp} />
                        </g>
                    ))}

                    {/* House outline (thick) */}
                    <rect x={px(HX)} y={px(HY)} width={px(HW)} height={px(HH)}
                        fill="none" stroke={C.wall} strokeWidth={4} pointerEvents="none" />

                    {/* Terrace hatch lines (decorative) */}
                    {Array.from({ length: 12 }, (_, i) => (
                        <line key={`th${i}`}
                            x1={px(TX)} y1={px(TY) + i * 9}
                            x2={px(TX) + i * 9} y2={px(TY)}
                            stroke="#c8a840" strokeWidth={0.4} opacity={0.4}
                            pointerEvents="none"
                        />
                    ))}

                    {/* Lot boundary */}
                    <rect x={2} y={2} width={px(LOT_W) - 4} height={px(LOT_H) - 4}
                        fill="none" stroke="#886644" strokeWidth={1} strokeDasharray="6,3"
                        pointerEvents="none" />

                    {/* Dimension lines */}
                    <DimLine x1={HX} y1={HY - 0.6} x2={HX + HW} y2={HY - 0.6} label="11.5 m" />
                    <DimLine x1={HX - 0.6} y1={HY} x2={HX - 0.6} y2={HY + HH} label="" orient="v" />
                    <g transform={`translate(${px(HX - 0.8)}, ${px(HY + HH / 2)})`}>
                        <text textAnchor="middle" fontSize={7} fill="#886644"
                            fontFamily="'Courier New', monospace"
                            transform="rotate(-90)">12 m</text>
                    </g>

                    {/* Sun / light arrow on top-left */}
                    <SunRays x={px(0.6)} y={px(0.7)} r={12} />

                    {/* Compass (orientation TBD) */}
                    <g transform={`translate(${px(LOT_W) - 26}, 20)`}>
                        <circle cx={0} cy={0} r={14} fill="white" fillOpacity={0.7}
                            stroke={C.wall} strokeWidth={0.5} />
                        <polygon points="0,-12 3,0 0,-4 -3,0" fill={C.wall} />
                        <polygon points="0,12 3,0 0,4 -3,0" fill="#ccc" />
                        <text x={0} y={-15} textAnchor="middle" fontSize={7}
                            fill={C.wall} fontWeight="bold">N?</text>
                        <text x={0} y={22} textAnchor="middle" fontSize={6}
                            fill="#888" fontFamily="'Courier New', monospace">à confirmer</text>
                    </g>

                    {/* Scale bar */}
                    <g transform={`translate(12, ${px(LOT_H) - 14})`}>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <rect key={i} x={px(i)} y={0} width={px(1)} height={6}
                                fill={i % 2 === 0 ? C.wall : "white"} stroke={C.wall} strokeWidth={0.5} />
                        ))}
                        {[0, 5].map(v => (
                            <text key={v} x={px(v)} y={-2} textAnchor="middle"
                                fontSize={7} fill={C.wall}
                                fontFamily="'Courier New', monospace">{v}m</text>
                        ))}
                    </g>

                    {/* "STREET" label at top */}
                    <text x={px(LOT_W / 2)} y={10} textAnchor="middle"
                        fontSize={8} fill="#886644" fontFamily="'Courier New', monospace"
                        letterSpacing={3}>— RUE —</text>

                    {/* Structural columns dots (R+2 prep) */}
                    {[
                        [HX, HY], [HX + HW / 2, HY], [HX + HW, HY],
                        [HX, HY + HH / 2], [HX + HW, HY + HH / 2],
                        [HX, HY + HH], [HX + HW / 2, HY + HH], [HX + HW, HY + HH],
                    ].map(([cx, cy], i) => (
                        <g key={`col${i}`} pointerEvents="none">
                            <rect x={px(cx) - 6} y={px(cy) - 6} width={12} height={12}
                                fill="#555" stroke={C.wall} strokeWidth={1} />
                        </g>
                    ))}

                    {/* R+2 label */}
                    <text x={px(HX + 0.3)} y={px(HY + 0.35)} fontSize={7}
                        fill="#555" fontFamily="'Courier New', monospace" pointerEvents="none">
                        ■ Poteau R+2
                    </text>
                </svg>

                {/* Legend strip below */}
                <div style={{
                    display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap",
                    padding: "6px 0"
                }}>
                    {[
                        [C.salon, "Salon double hauteur"],
                        [C.cuisine, "Cuisine"],
                        [C.suite, "Suite parentale"],
                        [C.chambre, "Chambres"],
                        [C.sdb, "SDB / WC"],
                        [C.dressing, "Dressing"],
                        [C.terrace, "Terrasse couverte"],
                        [C.garden, "Espaces verts"],
                    ].map(([col, lbl]) => (
                        <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{
                                width: 12, height: 12, background: col,
                                border: "1px solid #8a7a5a", flexShrink: 0
                            }} />
                            <span style={{
                                fontSize: 9, color: "#5a4a30",
                                fontFamily: "'Courier New', monospace"
                            }}>{lbl}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info panel */}
            <div style={{
                width: 240, marginLeft: 20, flexShrink: 0,
                display: "flex", flexDirection: "column", gap: 12
            }}>
                {/* Hover info */}
                <div style={{
                    background: "#fffbf2", border: "1.5px solid #c8a840",
                    padding: "14px 16px", minHeight: 120
                }}>
                    {hsp ? (
                        <>
                            <div style={{
                                fontSize: 11, letterSpacing: 2, color: "#5a4020",
                                fontFamily: "'Courier New', monospace", textTransform: "uppercase",
                                marginBottom: 6, fontWeight: "bold"
                            }}>
                                {hsp.label.replace("\n", " ")}
                            </div>
                            {hsp.area && (
                                <div style={{ fontSize: 18, fontWeight: "bold", color: C.accent, marginBottom: 8 }}>
                                    {hsp.area} m²
                                </div>
                            )}
                            {hsp.note && hsp.note.split("\n").map((line, i) => (
                                <p key={i} style={{
                                    fontSize: 10, color: "#665540", lineHeight: 1.7, margin: "1px 0",
                                    fontFamily: "'Courier New', monospace"
                                }}>
                                    · {line}
                                </p>
                            ))}
                        </>
                    ) : (
                        <p style={{
                            fontSize: 10, color: "#aaa", fontFamily: "'Courier New', monospace",
                            lineHeight: 1.8
                        }}>
                            Survole une pièce<br />pour voir les détails
                        </p>
                    )}
                </div>

                {/* Summary */}
                <div style={{
                    background: "#fffbf2", border: "1.5px solid #c0b090",
                    padding: "14px 16px"
                }}>
                    <div style={{
                        fontSize: 10, letterSpacing: 2, color: "#5a4020",
                        fontFamily: "'Courier New', monospace", textTransform: "uppercase",
                        marginBottom: 10, fontWeight: "bold"
                    }}>Récap. surfaces</div>
                    {[
                        ["Lot total", "300 m²"],
                        ["Emprise maison", "~138 m²"],
                        ["Terrasse couverte", "~24 m²"],
                        ["Jardins", "~100 m²"],
                        ["─────────────────", ""],
                        ["Grand Salon (DH)", "~37 m²"],
                        ["Cuisine + Îlot", "~20 m²"],
                        ["Suite parentale", "~22 m²"],
                        ["Chambres 2 & 3", "~24 m²"],
                        ["─────────────────", ""],
                        ["Structure prévue", "R+2"],
                        ["Sous-sol", "~90 m²"],
                    ].map(([k, v]) => (
                        <div key={k} style={{
                            display: "flex", justifyContent: "space-between",
                            marginBottom: 4
                        }}>
                            <span style={{
                                fontSize: 9, color: k.startsWith("─") ? "#ccc" : "#665540",
                                fontFamily: "'Courier New', monospace"
                            }}>{k}</span>
                            <span style={{
                                fontSize: 9, color: "#886644", fontFamily: "'Courier New', monospace",
                                fontWeight: "bold"
                            }}>{v}</span>
                        </div>
                    ))}
                </div>

                {/* Notes */}
                <div style={{
                    background: "#fff8ee", border: "1.5px solid #c0b090",
                    padding: "14px 16px"
                }}>
                    <div style={{
                        fontSize: 10, letterSpacing: 2, color: "#5a4020",
                        fontFamily: "'Courier New', monospace", textTransform: "uppercase",
                        marginBottom: 8, fontWeight: "bold"
                    }}>Notes Clés</div>
                    {[
                        "■ Poteaux béton armé 20×40cm prévus pour R+2",
                        "■ Trémies d'escalier réservées dans la dalle",
                        "■ Salon en double hauteur : plafond 5.5m",
                        "■ Terrasse dominante sur jardin avant",
                        "■ Suite isolée avec accès sous-sol privé",
                        "■ Orientation lumière naturelle à confirmer avec l'architecte",
                    ].map((note, i) => (
                        <p key={i} style={{
                            fontSize: 9, color: "#665540", lineHeight: 1.8,
                            margin: "2px 0", fontFamily: "'Courier New', monospace"
                        }}>
                            {note}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}