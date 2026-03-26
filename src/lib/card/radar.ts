/**
 * 6-axis meme radar chart — ported from punkgo-jack/src/roast/render.rs
 * Polar coordinate geometry for hexagonal radar visualization.
 */

export const RADAR_LABELS = [
	'Yapping',
	'Googling',
	'Grinding',
	'Shipping',
	'Tunnel Vision',
	'Plot Armor',
] as const;

export type RadarData = [number, number, number, number, number, number];

const ANGLES = [-90, -30, 30, 90, 150, 210];

function polar(cx: number, cy: number, r: number, val: number, angleDeg: number): [number, number] {
	const rad = (angleDeg * Math.PI) / 180;
	return [
		cx + (val / 100) * r * Math.cos(rad),
		cy + (val / 100) * r * Math.sin(rad),
	];
}

function hexPoints(cx: number, cy: number, r: number): string {
	return ANGLES.map((a) => {
		const [x, y] = polar(cx, cy, r, 100, a);
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(' ');
}

export interface RadarChartOptions {
	cx: number;
	cy: number;
	radius: number;
	data: RadarData;
	fillColor: string;
	strokeColor: string;
}

export function renderRadarSVG(opts: RadarChartOptions): string {
	const { cx, cy, radius, data, fillColor, strokeColor } = opts;

	// Grid rings (outer, mid, inner)
	const gridRings = [1.0, 0.66, 0.33].map((scale) => {
		const r = radius * scale;
		return `<polygon points="${hexPoints(cx, cy, r)}" fill="none" stroke="#D4B89640" stroke-width="0.5"/>`;
	});

	// Axis lines (center to each vertex)
	const axisLines = ANGLES.map((a) => {
		const [x, y] = polar(cx, cy, radius, 100, a);
		return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#D4B89620" stroke-width="0.5"/>`;
	});

	// Data polygon
	const dataPoints = data.map((v, i) => {
		const [x, y] = polar(cx, cy, radius, v, ANGLES[i]);
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(' ');

	// Data dots
	const dots = data.map((v, i) => {
		const [x, y] = polar(cx, cy, radius, v, ANGLES[i]);
		return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${strokeColor}"/>`;
	});

	// Labels
	const labelOffset = radius + 18;
	const labels = RADAR_LABELS.map((label, i) => {
		const [x, y] = polar(cx, cy, labelOffset, 100, ANGLES[i]);
		const anchor = x < cx - 5 ? 'end' : x > cx + 5 ? 'start' : 'middle';
		const dy = y < cy - 5 ? -4 : y > cy + 5 ? 12 : 4;
		return `<text x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}" fill="#8B7B6B" font-family="Space Grotesk, sans-serif" font-size="10" font-weight="600">${label}</text>`;
	});

	return [
		`<g class="radar-chart">`,
		...gridRings,
		...axisLines,
		`<polygon points="${dataPoints}" fill="${fillColor}30" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="round"/>`,
		...dots,
		...labels,
		`</g>`,
	].join('\n');
}
