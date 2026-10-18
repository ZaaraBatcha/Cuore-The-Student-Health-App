import { plantSpecies, plantPalette } from '../lib/xp';

// A horizontal "garden view": a grass patch with plants laid out organically.
// Each plant appears at a milestone (level). Older plants sit further along the row.
export default function FlowerGarden({ totalPoints, currentLevel, plantsCount, compact }) {
  // Layout: garden is 100% wide, ~220px tall
  // Each plant has a stable x-position derived from its index
  const plants = [];
  for (let i = 0; i < plantsCount; i++) {
    const species = plantSpecies(i);
    // X position: spread across the garden, deterministic
    const x = 8 + ((i * 13 + 7) % 84); // 8–92% of width
    // Y position: organic variation
    const yJitter = ((i * 31) % 7) - 3; // small up/down
    plants.push({
      key: i,
      species,
      x,
      yJitter,
      ageInPlants: plantsCount - 1 - i, // most recent plant is "youngest"
    });
  }

  // Compact mode: bare scene only. Parent supplies the card, header and
  // level/points chrome (so they appear in exactly one place on the page).
  if (compact) {
    return <GardenScene plants={plants} />;
  }

  return (
    <div className="card-mint mb-4 overflow-hidden">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <div className="font-bold text-mint-900">Your garden</div>
            <div className="text-xs text-mint-700">
              {plantsCount === 0
                ? 'Complete a task to plant your first sprout.'
                : `${plantsCount} plant${plantsCount === 1 ? '' : 's'} growing · keep going!`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-bold text-mint-800 shadow-sm border border-mint-200">
            ✨ Lvl {currentLevel}
          </div>
          <div className="text-xs text-mint-700 mt-1.5 font-medium">{totalPoints} pts</div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-mint-300 shadow-inner" style={{ aspectRatio: '5 / 2' }}>
        <GardenScene plants={plants} />
      </div>
    </div>
  );
}

function GardenScene({ plants }) {
  return (
    <svg
      viewBox="0 0 500 200"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full block"
      role="img"
      aria-label={`Garden with ${plants.length} plants`}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf4ec" />
          <stop offset="100%" stopColor="#fdfcf8" />
        </linearGradient>
        <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a4cdb5" />
          <stop offset="100%" stopColor="#7bb392" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="500" height="120" fill="url(#skyGrad)" />

      {/* Distant hills */}
      <path d="M 0 110 Q 100 80 200 100 Q 380 75 500 95 L 500 130 L 0 130 Z" fill="#c4d4c0" opacity="0.6" />

      {/* Sun */}
      <circle cx="430" cy="40" r="22" fill="#fde68a" opacity="0.85" />
      <circle cx="430" cy="40" r="14" fill="#fcd34d" />

      {/* Clouds */}
      <Cloud x={60} y={30} scale={1} />
      <Cloud x={280} y={50} scale={0.7} />

      {/* Grass ground */}
      <rect x="0" y="120" width="500" height="80" fill="url(#grassGrad)" />

      {/* Soil */}
      <ellipse cx="250" cy="170" rx="280" ry="14" fill="#5a9a78" opacity="0.5" />

      {/* Grass blades (decorative) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = 15 + i * 24 + ((i % 2) * 8);
        return (
          <path
            key={`blade-${i}`}
            d={`M ${x} 160 Q ${x + 1} ${150 - (i % 3) * 3} ${x + 2} 160`}
            stroke="#5a9a78"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        );
      })}

      {/* Plants: drawn in order so newer ones appear on top */}
      {plants.map((p) => (
        <Plant key={p.key} plant={p} />
      ))}

      {/* Floating butterflies appear at high counts (decorative) */}
      {plants.length >= 7 && <Butterfly x={150} y={50} />}
      {plants.length >= 5 && <Butterfly x={350} y={70} />}
    </svg>
  );
}

function Cloud({ x, y, scale }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="22" ry="10" fill="white" opacity="0.9" />
      <ellipse cx="18" cy="-4" rx="14" ry="9" fill="white" opacity="0.9" />
      <ellipse cx="-12" cy="-3" rx="12" ry="8" fill="white" opacity="0.9" />
    </g>
  );
}

function Plant({ plant }) {
  const palette = plantPalette(plant.species);
  const cx = (plant.x / 100) * 500;
  const baseY = 175 + plant.yJitter;

  switch (plant.species) {
    case 'sprout':
      return <Sprout cx={cx} baseY={baseY} palette={palette} />;
    case 'daisy':
      return <Daisy cx={cx} baseY={baseY} palette={palette} />;
    case 'tulip':
      return <Tulip cx={cx} baseY={baseY} palette={palette} />;
    case 'sunflower':
      return <Sunflower cx={cx} baseY={baseY} palette={palette} />;
    case 'bush':
      return <Bush cx={cx} baseY={baseY} palette={palette} />;
    case 'tree':
      return <Tree cx={cx} baseY={baseY} palette={palette} />;
    case 'mushroom':
      return <Mushroom cx={cx} baseY={baseY} palette={palette} />;
    case 'bluebell':
      return <Bluebell cx={cx} baseY={baseY} palette={palette} />;
    default:
      return <Sprout cx={cx} baseY={baseY} palette={palette} />;
  }
}

function Sprout({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="10" ry="3" fill="#5a9a78" opacity="0.4" />
      <path d={`M ${cx} ${baseY} Q ${cx} ${baseY - 14} ${cx} ${baseY - 22}`} stroke={palette.stem} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx={cx - 5} cy={baseY - 18} rx="5" ry="3" fill={palette.stem} transform={`rotate(-30 ${cx - 5} ${baseY - 18})`} />
      <ellipse cx={cx + 5} cy={baseY - 14} rx="5" ry="3" fill={palette.stem} transform={`rotate(30 ${cx + 5} ${baseY - 14})`} />
    </g>
  );
}

function Daisy({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="11" ry="3" fill="#5a9a78" opacity="0.4" />
      <path d={`M ${cx} ${baseY} Q ${cx + 2} ${baseY - 20} ${cx} ${baseY - 36}`} stroke={palette.stem} strokeWidth="2" fill="none" strokeLinecap="round" />
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={cx + s * 5} cy={baseY - 20} rx="4" ry="2" fill={palette.stem} transform={`rotate(${s > 0 ? 30 : -30} ${cx + s * 5} ${baseY - 20})`} />
      ))}
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={angle}
          cx={cx + Math.cos((angle * Math.PI) / 180) * 6}
          cy={baseY - 36 + Math.sin((angle * Math.PI) / 180) * 6}
          rx="5"
          ry="3"
          fill={palette.petal}
          transform={`rotate(${angle} ${cx + Math.cos((angle * Math.PI) / 180) * 6} ${baseY - 36 + Math.sin((angle * Math.PI) / 180) * 6})`}
        />
      ))}
      <circle cx={cx} cy={baseY - 36} r="4" fill={palette.center} />
    </g>
  );
}

function Tulip({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="11" ry="3" fill="#5a9a78" opacity="0.4" />
      <path d={`M ${cx} ${baseY} Q ${cx + 3} ${baseY - 20} ${cx} ${baseY - 32}`} stroke={palette.stem} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx={cx - 6} cy={baseY - 18} rx="5" ry="2" fill={palette.stem} transform={`rotate(-30 ${cx - 6} ${baseY - 18})`} />
      {/* Tulip head */}
      <path
        d={`M ${cx - 7} ${baseY - 32} Q ${cx - 7} ${baseY - 44} ${cx} ${baseY - 40} Q ${cx + 7} ${baseY - 44} ${cx + 7} ${baseY - 32} Q ${cx + 4} ${baseY - 28} ${cx} ${baseY - 30} Q ${cx - 4} ${baseY - 28} ${cx - 7} ${baseY - 32} Z`}
        fill={palette.petal}
      />
    </g>
  );
}

function Sunflower({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="14" ry="4" fill="#5a9a78" opacity="0.4" />
      <path d={`M ${cx} ${baseY} L ${cx} ${baseY - 56}`} stroke={palette.stem} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx={cx - 8} cy={baseY - 30} rx="7" ry="3" fill={palette.stem} transform={`rotate(-30 ${cx - 8} ${baseY - 30})`} />
      <ellipse cx={cx + 8} cy={baseY - 42} rx="7" ry="3" fill={palette.stem} transform={`rotate(30 ${cx + 8} ${baseY - 42})`} />
      {/* Petals */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const px = cx + Math.cos(angle) * 10;
        const py = baseY - 56 + Math.sin(angle) * 10;
        return <ellipse key={i} cx={px} cy={py} rx="6" ry="3" fill={palette.petal} transform={`rotate(${i * 30} ${px} ${py})`} />;
      })}
      <circle cx={cx} cy={baseY - 56} r="6" fill={palette.center} />
    </g>
  );
}

function Bush({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="20" ry="4" fill="#5a9a78" opacity="0.4" />
      <circle cx={cx - 10} cy={baseY - 8} r="10" fill={palette.accent} />
      <circle cx={cx + 10} cy={baseY - 8} r="10" fill={palette.accent} />
      <circle cx={cx} cy={baseY - 14} r="11" fill={palette.stem} />
      <circle cx={cx - 6} cy={baseY - 18} r="6" fill={palette.accent} opacity="0.7" />
      <circle cx={cx + 5} cy={baseY - 16} r="5" fill={palette.accent} opacity="0.7" />
    </g>
  );
}

function Tree({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="18" ry="4" fill="#5a9a78" opacity="0.4" />
      {/* Trunk */}
      <rect x={cx - 4} y={baseY - 30} width="8" height="30" fill="#9a5d44" rx="2" />
      {/* Canopy */}
      <circle cx={cx} cy={baseY - 38} r="22" fill={palette.stem} />
      <circle cx={cx - 12} cy={baseY - 32} r="14" fill={palette.accent} />
      <circle cx={cx + 10} cy={baseY - 36} r="12" fill={palette.stem} />
      <circle cx={cx - 4} cy={baseY - 48} r="10" fill={palette.accent} opacity="0.8" />
    </g>
  );
}

function Mushroom({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="9" ry="2.5" fill="#5a9a78" opacity="0.4" />
      {/* Stem */}
      <rect x={cx - 3} y={baseY - 12} width="6" height="12" fill={palette.stem} rx="3" />
      {/* Cap */}
      <path
        d={`M ${cx - 11} ${baseY - 12} Q ${cx - 11} ${baseY - 24} ${cx} ${baseY - 22} Q ${cx + 11} ${baseY - 24} ${cx + 11} ${baseY - 12} Z`}
        fill={palette.accent}
      />
      {/* Spots */}
      <circle cx={cx - 4} cy={baseY - 18} r="2" fill="#fdfcf8" />
      <circle cx={cx + 5} cy={baseY - 16} r="1.5" fill="#fdfcf8" />
    </g>
  );
}

function Bluebell({ cx, baseY, palette }) {
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 2} rx="10" ry="3" fill="#5a9a78" opacity="0.4" />
      <path d={`M ${cx} ${baseY} Q ${cx + 4} ${baseY - 18} ${cx + 6} ${baseY - 30}`} stroke={palette.stem} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx={cx - 3} cy={baseY - 18} rx="4" ry="2" fill={palette.stem} transform={`rotate(-30 ${cx - 3} ${baseY - 18})`} />
      {/* Bell flowers */}
      {[0, -8, 8].map((dy, i) => (
        <path
          key={i}
          d={`M ${cx + 6 + dy * 0.5} ${baseY - 30 - i * 5} Q ${cx + 9 + dy * 0.5} ${baseY - 26 - i * 5} ${cx + 6 + dy * 0.5} ${baseY - 22 - i * 5} L ${cx + 3 + dy * 0.5} ${baseY - 22 - i * 5} Q ${cx + 4 + dy * 0.5} ${baseY - 26 - i * 5} ${cx + 6 + dy * 0.5} ${baseY - 30 - i * 5} Z`}
          fill={palette.petal}
          opacity="0.9"
        />
      ))}
    </g>
  );
}

function Butterfly({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-4" cy="-2" rx="4" ry="3" fill="#f9a8d4" />
      <ellipse cx="4" cy="-2" rx="4" ry="3" fill="#f9a8d4" />
      <ellipse cx="-3" cy="2" rx="3" ry="2" fill="#c4b5fd" />
      <ellipse cx="3" cy="2" rx="3" ry="2" fill="#c4b5fd" />
      <ellipse cx="0" cy="0" rx="0.8" ry="2.5" fill="#5a9a78" />
    </g>
  );
}