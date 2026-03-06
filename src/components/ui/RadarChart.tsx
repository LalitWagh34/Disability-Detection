import React from 'react';

interface RadarChartProps {
    data: { label: string; value: number; fullMark: number }[];
    size?: number;
    color?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300, color = "#8b5cf6" }) => {
    const center = size / 2;
    const radius = (size / 2) - 40; // padding
    const angleSlice = (Math.PI * 2) / data.length;

    // Helper to calculate coordinates - safe against NaN
    const getCoordinates = (value: number, index: number, max: number) => {
        const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
        const safeMax = isNaN(max) || max === 0 ? 1 : max;
        const ratio = safeValue / safeMax;
        // Start from top (-PI/2)
        const angle = index * angleSlice - Math.PI / 2;
        return {
            x: center + Math.cos(angle) * (radius * ratio),
            y: center + Math.sin(angle) * (radius * ratio)
        };
    };

    // Generate path for the data polygon
    const points = data.map((d, i) => {
        const coords = getCoordinates(d.value ?? 0, i, d.fullMark ?? 100);
        return `${coords.x},${coords.y}`;
    }).join(" ");

    // Generate grid levels (concentric polygons)
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

    return (
        <div className="relative flex justify-center items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Grid Lines */}
                {levels.map((level, i) => (
                    <polygon
                        key={i}
                        points={data.map((d, j) => {
                            const coords = getCoordinates(d.fullMark * level, j, d.fullMark);
                            return `${coords.x},${coords.y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {data.map((d, i) => {
                    const coords = getCoordinates(d.fullMark, i, d.fullMark);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={coords.x}
                            y2={coords.y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Area */}
                <polygon
                    points={points}
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="2"
                    className="drop-shadow-sm transition-all duration-500 ease-out"
                />

                {/* Dots at vertices */}
                {data.map((d, i) => {
                    const coords = getCoordinates(d.value, i, d.fullMark);
                    return (
                        <circle
                            key={i}
                            cx={coords.x}
                            cy={coords.y}
                            r="4"
                            fill={color}
                            className="hover:r-6 transition-all cursor-pointer"
                        >
                            <title>{d.label}: {d.value}/{d.fullMark}</title>
                        </circle>
                    );
                })}

                {/* Labels */}
                {data.map((d, i) => {
                    // Push labels out a bit further than fullMark
                    const labelRadius = radius + 20;
                    const angle = i * angleSlice - Math.PI / 2;
                    const x = center + Math.cos(angle) * labelRadius;
                    const y = center + Math.sin(angle) * labelRadius;

                    // Adjust anchor based on position to avoid overlap
                    let anchor = "middle";
                    if (x < center - 10) anchor = "end";
                    if (x > center + 10) anchor = "start";

                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor={anchor}
                            dominantBaseline="middle"
                            className="text-xs font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-tighter"
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
