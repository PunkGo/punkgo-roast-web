/**
 * GET /game/scene/{id} — Renders a scene image as a styled HTML page
 *
 * For AI clients that can't render inline images from text/plain,
 * this provides a clickable link to view the scene in browser.
 */
import type { RequestHandler } from './$types';

const SCENES: Record<string, { title: string; titleZh: string }> = {
	r01: { title: 'Thornfield Manor — Arrival', titleZh: 'Thornfield 庄园 — 抵达' },
	r02: { title: 'The Library', titleZh: '图书馆' },
	r03: { title: 'The Hallway Measurement', titleZh: '走廊测量' },
	r04: { title: 'Hidden Markers', titleZh: '隐藏标记' },
	r04a: { title: 'The Seven-Petal Flower', titleZh: '七瓣花' },
	r04b: { title: 'The Compass Plate', titleZh: '罗盘盘' },
	r05: { title: 'The Wall Mechanism', titleZh: '墙壁机关' },
	r06: { title: 'The Conservatory', titleZh: '温室' },
	r07: { title: 'Blueprint Revelation', titleZh: '蓝图背面' },
	r08: { title: 'The Hidden Entrance', titleZh: '密室入口' },
	r09: { title: "The Cartographer's Study", titleZh: '制图师书房' },
	r10: { title: 'Three More Rooms', titleZh: '三间密室' },
	fp01: { title: 'Original Blueprint', titleZh: '原始蓝图' },
	fp02: { title: 'Annotated Blueprint', titleZh: '标注蓝图' },
};

const ID_TO_FILE: Record<string, string> = {
	r01: 'r01_manor_exterior', r02: 'r02_library_wall', r03: 'r03_hallway_measurement',
	r04: 'r04_flower_symbol', r04a: 'r04_flower_symbol', r04b: 'r04_compass_plate', r05: 'r05_wall_mechanism',
	r06: 'r06_conservatory', r07: 'r07_blueprint_back', r08: 'r08_room_entrance',
	r09: 'r09_cartographer_desk', r10: 'r10_three_doors',
	fp01: 'fp01_original_blueprint', fp02: 'fp02_annotated_blueprint',
};

export const GET: RequestHandler = async ({ params, url }) => {
	const id = params.id;
	const scene = SCENES[id];
	const file = ID_TO_FILE[id];
	if (!scene || !file) {
		return new Response('Scene not found', { status: 404 });
	}

	const origin = url.origin;
	const imgUrl = `${origin}/game/${file}.jpg`;

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${scene.title} — The Missing Room</title>
<style>
  body{margin:0;background:#1a1510;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:Georgia,serif}
  .wrap{max-width:600px;width:100%;padding:24px}
  img{width:100%;border-radius:12px;display:block}
  .title{color:#c8a060;text-align:center;margin-top:16px;font-size:18px;letter-spacing:0.05em}
  .sub{color:#6a5a48;text-align:center;font-size:12px;margin-top:8px}
</style>
</head>
<body>
<div class="wrap">
  <img src="${imgUrl}" alt="${scene.title}" />
  <div class="title">${scene.title}</div>
  <div class="sub">${scene.titleZh} — The Missing Room</div>
</div>
</body>
</html>`;

	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
