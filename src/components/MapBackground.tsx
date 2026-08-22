export default function MapBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Base navy ground */}
      <div className="absolute inset-0 bg-[#0d1b2a]" />

      {/* Subtle terrain gradient layers */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, #16304d 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 20% 70%, #1e2d3d 0%, transparent 60%)",
        }}
      />

      {/* Topographic SVG contour lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] animate-drift"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDuration: "40s" }}
      >
        <defs>
          <filter id="blur-topo">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>
        <g
          filter="url(#blur-topo)"
          stroke="#f5f0e8"
          strokeWidth="0.6"
          fill="none"
        >
          <ellipse cx="30%" cy="25%" rx="18%" ry="10%" />
          <ellipse cx="30%" cy="25%" rx="22%" ry="14%" />
          <ellipse cx="30%" cy="25%" rx="26%" ry="18%" />
          <ellipse cx="30%" cy="25%" rx="30%" ry="22%" />
          <ellipse cx="72%" cy="65%" rx="20%" ry="12%" />
          <ellipse cx="72%" cy="65%" rx="24%" ry="16%" />
          <ellipse cx="72%" cy="65%" rx="28%" ry="20%" />
          <ellipse cx="55%" cy="45%" rx="10%" ry="6%" />
          <ellipse cx="55%" cy="45%" rx="14%" ry="9%" />
          <ellipse cx="15%" cy="75%" rx="12%" ry="7%" />
          <ellipse cx="15%" cy="75%" rx="16%" ry="11%" />
          <ellipse cx="85%" cy="20%" rx="8%" ry="5%" />
          <ellipse cx="85%" cy="20%" rx="12%" ry="8%" />
        </g>
      </svg>

      {/* Geographic grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#f5f0e8"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Coordinate labels */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="8%"
          y="15%"
          fill="#f5f0e8"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          48°52′N
        </text>
        <text
          x="8%"
          y="18%"
          fill="#f5f0e8"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          2°21′E
        </text>
        <text
          x="58%"
          y="35%"
          fill="#f5f0e8"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          52°22′N
        </text>
        <text
          x="58%"
          y="38%"
          fill="#f5f0e8"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          4°54′E
        </text>
        <text
          x="78%"
          y="72%"
          fill="#f5f0e8"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          55°40′N
        </text>
        <text
          x="78%"
          y="75%"
          fill="#f5f0e8"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          12°34′E
        </text>
      </svg>

      {/* Route path suggestion */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 20% 20% Q 45% 15%, 60% 35% T 80% 70%"
          fill="none"
          stroke="#c4714a"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          className="route-line"
          style={{ animationDuration: "4s" }}
        />
      </svg>

      {/* Atmospheric vignette */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #0d1b2a 100%)",
        }}
      />
    </div>
  );
}
