/**
 * The Missing Room (消失的房间) — 10-round puzzle game story data
 *
 * Static story content. Game state lives in Supabase (game_sessions).
 * Each round is self-contained: the text/plain prompt includes full context.
 */

export interface GameChoice {
	id: string; // A, B, C
	en: string;
	zh: string;
}

export interface GameRound {
	narrativeEn: string;
	narrativeZh: string;
	clueEn: string;
	clueZh: string;
	choices: GameChoice[];
	/** Image IDs for this round (scene + optional clue close-ups) */
	images: string[];
	/** Image alt text for non-rendering AIs */
	imageAltEn: string;
	imageAltZh: string;
	/** Short summary of this round for "story so far" context */
	summaryEn: (choice: string) => string;
	summaryZh: (choice: string) => string;
	/** ASCII floor plan state for this round */
	floorPlan: (explored: string[]) => string;
}

export interface GameEnding {
	en: string;
	zh: string;
}

const FLOOR_PLAN_BASE = `
┌──────────────────────────────────────────┐
│              THORNFIELD MANOR            │
│              2nd Floor East Wing         │
├──────────┬──────────┬──────────┬─────────┤
│          │          │          │         │
│  LIBRARY │  ??????  │CONSERVA-│  MAIN   │
│          │          │  TORY   │  HALL   │
│  [5m]    │  [4m]    │  [5m]   │         │
│          │          │          │         │
├──────────┴──────────┴──────────┤         │
│         H A L L W A Y         │         │
│         (measured: 8.2m)       │         │
└────────────────────────────────┴─────────┘`;

function floorPlan(explored: string[]): string {
	let plan = FLOOR_PLAN_BASE;
	if (explored.length >= 3) plan = plan.replace('??????', '██████');
	if (explored.length >= 5) plan = plan.replace('██████', 'HIDDEN');
	if (explored.length >= 8) plan = plan.replace('HIDDEN', ' FOUND ');
	return plan;
}

export const ROUNDS: GameRound[] = [
	// Round 1 — The Commission
	{
		images: ['r01_manor_exterior', 'fp01_original_blueprint'],
		imageAltEn: 'A figure at the iron gate of Thornfield Manor in evening fog; the original architectural blueprint',
		imageAltZh: '暮色中，身影站在庄园铁门前；原始建筑蓝图',
		narrativeEn: `You arrive at Thornfield Manor on a grey autumn morning. The current owner, Ms. Helena Thornfield, meets you at the door with a rolled-up blueprint under her arm.

"Thank you for coming," she says. "My great-grandfather, Edmund Blackwell, designed this house in 1923. He was... eccentric." She unfurls the blueprint on the dining table.

You see the second floor layout clearly: Library, then a room labeled "The Cartographer's Study" (4m × 6m), then the Conservatory. But when Helena walks you upstairs, the space between the Library and Conservatory is just a solid wall. No door. No room.

In the blueprint's margin, in faded ink: "E.B. — The walls remember what the eyes forget."`,
		narrativeZh: `你在一个灰蒙蒙的秋日早晨来到 Thornfield 庄园。现任主人 Helena Thornfield 女士夹着一卷蓝图在门口迎接你。

"谢谢你来，"她说。"我曾祖父 Edmund Blackwell 在 1923 年设计了这栋房子。他……有点古怪。" 她在餐桌上展开蓝图。

二楼布局清晰可见：图书馆，然后是标注为"制图师书房"（4m × 6m）的房间，再是温室。但当 Helena 带你上楼时，图书馆和温室之间只有一面实墙。没有门，没有房间。

蓝图边缘用褪色的墨水写着："E.B. —— 墙壁记得眼睛忘记的。"`,
		clueEn: `The blueprints show a 4m × 6m room called "The Cartographer's Study" between the Library and the Conservatory. The room is clearly marked but physically absent. Margin note: "The walls remember what the eyes forget."`,
		clueZh: `蓝图显示图书馆和温室之间有一间 4m × 6m 的"制图师书房"。房间清晰标注但实际不存在。边注："墙壁记得眼睛忘记的。"`,
		choices: [
			{ id: 'A', en: 'Examine the Library (the room to the left of the missing room)', zh: '检查图书馆（消失房间左侧的房间）' },
			{ id: 'B', en: 'Examine the Conservatory (the room to the right)', zh: '检查温室（右侧的房间）' },
			{ id: 'C', en: 'Examine the hallway wall where the room should be', zh: '检查走廊上应有房间的那面墙' },
		],
		summaryEn: (c) => `Arrived at Thornfield Manor. Saw blueprints showing a missing "Cartographer's Study". Chose to examine ${c === 'A' ? 'the Library' : c === 'B' ? 'the Conservatory' : 'the hallway wall'}.`,
		summaryZh: (c) => `抵达 Thornfield 庄园。看到蓝图上标注的消失的"制图师书房"。选择检查${c === 'A' ? '图书馆' : c === 'B' ? '温室' : '走廊墙壁'}。`,
		floorPlan,
	},

	// Round 2 — First Investigation
	{
		images: ['r02_library_wall'],
		imageAltEn: 'A dim library with unusually deep bookshelves and a suspicious baseboard gap',
		imageAltZh: '昏暗的图书馆，异常深的书架，踢脚线有缝隙',
		narrativeEn: `You begin your investigation. In the Library, the east wall bookshelves are unusually deep — 80cm instead of the standard 30cm. The extra depth serves no purpose; the back panels are solid wood. In the Conservatory, the west wall plaster has a slightly different texture from the other walls — smoother, as if it was applied later. In the hallway, the baseboard molding has a 2cm gap at one specific point.

Helena brings you a leather-bound diary she found in the attic. It belonged to Mrs. Collins, the housekeeper from 1923 to 1941. One entry from March 1924 reads:

"Mr. Blackwell spent three nights alone on the second floor with his instruments and tools. When he emerged, the hallway seemed shorter, though I cannot say why."`,
		narrativeZh: `你开始调查。图书馆东墙的书架异常深——80 厘米而非标准的 30 厘米。多出的深度没有用途，背板是实木。温室的西墙灰泥质感与其他墙面略有不同——更光滑，像是后来涂的。走廊的踢脚线在某个特定位置有 2 厘米的缝隙。

Helena 带来一本在阁楼找到的皮面日记。它属于 1923 到 1941 年的管家 Collins 太太。1924 年 3 月的一篇写道：

"Blackwell 先生带着仪器和工具独自在二楼待了三个夜晚。他出来时，走廊似乎变短了，虽然我说不上为什么。"`,
		clueEn: `Library bookshelves are 80cm deep (standard is 30cm). Conservatory west wall has different plaster. Hallway baseboard has a 2cm gap. Housekeeper's 1924 diary: "the hallway seemed shorter" after Blackwell worked alone for 3 nights.`,
		clueZh: `图书馆书架深 80cm（标准 30cm）。温室西墙灰泥不同。走廊踢脚线有 2cm 缝隙。管家 1924 年日记："走廊似乎变短了"——在 Blackwell 独自工作三夜之后。`,
		choices: [
			{ id: 'A', en: 'Measure the hallway length and compare to blueprints', zh: '测量走廊长度并与蓝图对比' },
			{ id: 'B', en: 'Search the Library\'s deep bookshelves for hidden mechanisms', zh: '搜索图书馆深书架寻找暗机关' },
			{ id: 'C', en: 'Examine the Conservatory wall plaster more closely', zh: '仔细检查温室墙壁灰泥' },
		],
		summaryEn: (c) => `Found anomalies: Library shelves 80cm deep, Conservatory wall replastered, hallway baseboard gap. Housekeeper diary says hallway "seemed shorter". Chose to ${c === 'A' ? 'measure the hallway' : c === 'B' ? 'search the deep bookshelves' : 'examine the Conservatory plaster'}.`,
		summaryZh: (c) => `发现异常：图书馆书架深 80cm，温室墙壁重新抹灰，走廊踢脚线有缝。管家日记说走廊"似乎变短了"。选择${c === 'A' ? '测量走廊' : c === 'B' ? '搜索深书架' : '检查温室灰泥'}。`,
		floorPlan,
	},

	// Round 3 — The Measurement Mystery
	{
		images: ['r03_hallway_measurement'],
		imageAltEn: 'A measuring tape stretched along a dark hallway that feels impossibly short',
		imageAltZh: '测量带沿走廊拉开，走廊短得不合理',
		narrativeEn: `You take precise measurements with a measuring tape. The hallway from the Library entrance to the Conservatory entrance: 8.2 meters.

Now check the blueprints: Library width is 5m, Conservatory width is 5m, and the Cartographer's Study between them is 4m. The outer walls are 15cm each. Total expected span from Library outer wall to Conservatory outer wall: 5 + 0.15 + 4 + 0.15 + 5 = 14.3 meters.

Your measurement of the hallway frontage: only 10.2 meters. That's 4.1 meters shorter than the blueprints indicate. Subtracting wall thicknesses, there's roughly 3.8 meters of space unaccounted for.

The missing room is real. It's hidden inside the walls.`,
		narrativeZh: `你用卷尺做了精确测量。从图书馆入口到温室入口的走廊长度：8.2 米。

查看蓝图：图书馆宽 5 米，温室宽 5 米，中间的制图师书房 4 米。外墙各 15 厘米。从图书馆外墙到温室外墙的总跨度应为：5 + 0.15 + 4 + 0.15 + 5 = 14.3 米。

你测量的走廊正面跨度：只有 10.2 米。比蓝图少了 4.1 米。减去墙壁厚度，大约有 3.8 米的空间不知去向。

消失的房间是真实的。它藏在墙壁里面。`,
		clueEn: `Hallway measures 10.2m but blueprints show 14.3m total span. That's 3.8m of missing space — almost exactly the room's 4m width minus wall thickness. The room exists. It's hidden inside the thickened walls.`,
		clueZh: `走廊实测 10.2 米，蓝图显示总跨度 14.3 米。差了 3.8 米——几乎正好是房间 4 米宽度减去墙壁厚度。房间存在，藏在加厚的墙壁里。`,
		choices: [
			{ id: 'A', en: 'Look for structural seams or joints in the hallway ceiling', zh: '检查走廊天花板的结构接缝' },
			{ id: 'B', en: 'Check the Library\'s deep bookshelves for a hidden passage', zh: '检查图书馆深书架是否有暗道' },
			{ id: 'C', en: 'Tap along the hallway wall, listening for hollow sections', zh: '沿走廊墙壁敲击，听是否有空心段' },
		],
		summaryEn: (c) => `Measured hallway: 10.2m vs blueprint's 14.3m. 3.8m of space is hidden — the room exists inside the walls. Chose to ${c === 'A' ? 'check ceiling seams' : c === 'B' ? 'search bookshelves for passage' : 'tap walls for hollow sections'}.`,
		summaryZh: (c) => `测量走廊：实测 10.2 米 vs 蓝图 14.3 米。3.8 米空间被隐藏——房间就在墙里。选择${c === 'A' ? '检查天花板接缝' : c === 'B' ? '搜索书架暗道' : '敲墙听空心'}。`,
		floorPlan,
	},

	// Round 4 — The Architect's Signature
	{
		images: ['r04_flower_symbol', 'r04_compass_plate'],
		imageAltEn: 'Close-up of a 7-petal flower in the wallpaper; a tarnished brass compass plate with E engraved deeper',
		imageAltZh: '壁纸中七瓣花特写；铜绿斑驳的黄铜罗盘盘，E 刻痕更深',
		narrativeEn: `While investigating, you discover two things:

First, on the hallway wall: the wallpaper has a repeating floral motif — six-petaled flowers in neat rows. But at eye level, at one specific spot, a single flower has seven petals instead of six. It's subtle. You'd never notice unless you were looking.

Second, in the Library, set into the dark wood floor near the deep bookshelves: a brass compass plate, tarnished with age. It's engraved with cardinal directions — N, S, E, W — but the letter E is cut deeper than the others, as if someone traced it again and again.

"E" for East? Or "E" for Edmund?`,
		narrativeZh: `调查中你发现了两样东西：

第一，走廊墙壁上：壁纸是重复的花卉图案——整齐排列的六瓣花。但在视线高度的某个特定位置，有一朵花是七瓣的。很微妙，不刻意找绝不会注意到。

第二，图书馆里，深书架旁的深色木地板上嵌着一块黄铜罗盘盘，铜绿斑驳。上面刻着方位—— N、S、E、W——但字母 E 的刻痕比其他字母更深，像是有人反复描摹过。

"E" 代表东方？还是 "E" 代表 Edmund？`,
		clueEn: `Two hidden markers found: (1) A 7-petal flower anomaly on the hallway wallpaper at eye level. (2) A brass compass plate set into the Library floor with "E" engraved deeper than other letters. The architect left deliberate markers. "E" could mean East, Edmund (the architect), or both.`,
		clueZh: `发现两个隐藏标记：(1) 走廊壁纸上视线高度处有一朵 7 瓣花异常。(2) 图书馆地板上嵌着黄铜罗盘盘，"E" 的刻痕比其他字母更深。建筑师留下了刻意的标记。"E" 可能代表东方、Edmund（建筑师），或两者皆是。`,
		choices: [
			{ id: 'A', en: 'Press the 7-petal flower on the wallpaper', zh: '按下壁纸上的七瓣花' },
			{ id: 'B', en: 'Try rotating or pressing the compass rose plate', zh: '尝试转动或按下罗盘盘' },
			{ id: 'C', en: 'Look for more hidden symbols elsewhere on the second floor', zh: '在二楼其他地方寻找更多隐藏符号' },
		],
		summaryEn: (c) => `Found two markers: a 7-petal flower in hallway wallpaper, and a brass compass plate in the Library floor with "E" engraved deeper. Chose to ${c === 'A' ? 'press the flower' : c === 'B' ? 'try the compass plate' : 'search for more symbols'}.`,
		summaryZh: (c) => `发现两个标记：走廊壁纸上的七瓣花，图书馆地板上的黄铜罗盘盘（"E"刻痕更深）。选择${c === 'A' ? '按下花朵' : c === 'B' ? '尝试罗盘盘' : '寻找更多符号'}。`,
		floorPlan,
	},

	// Round 5 — The Turning Point
	{
		images: ['r05_wall_mechanism'],
		imageAltEn: 'A thin crack in the wall revealing darkness behind — close but not open yet',
		imageAltZh: '墙壁出现细裂缝，透出后方黑暗——接近了但还没打开',
		narrativeEn: `You try both mechanisms. Pressing the 7-petal flower — you hear a faint click from inside the wall, but nothing visible happens. Rotating the compass plate so the deeply-engraved "E" points downward — a mechanical grinding sound, deep within the structure. But still, nothing opens.

Something is missing. A third trigger.

You step back and re-examine the blueprints. The wall thickness annotated is 15cm — standard for the 1920s. But your measurements show the actual walls are 40cm thick. That's 25cm of extra space on each side.

Edmund Blackwell didn't just hide a room. He built mechanized walls that can slide. Two triggers activated, but the system needs a third input to complete the circuit. The architect was known to use the number three in his other buildings — three chimneys, three-step staircases, triangular garden layouts.`,
		narrativeZh: `你尝试了两个机关。按下七瓣花——墙内传来一声轻微的咔嗒声，但什么也没发生。转动罗盘盘让刻痕最深的"E"朝下——深处传来机械研磨声。但墙壁仍然没有打开。

缺了什么。第三个触发点。

你退后一步重新审视蓝图。标注的墙壁厚度是 15 厘米——1920 年代的标准。但实测是 40 厘米。每侧多出 25 厘米。

Edmund Blackwell 不仅仅是隐藏了一个房间。他建造了可以滑动的机械墙壁。两个触发器已激活，但系统需要第三个输入才能完成回路。这位建筑师在其他建筑中以数字三著称——三根烟囱、三级台阶、三角形花园布局。`,
		clueEn: `Walls are 40cm thick (standard: 15cm). The extra 25cm per side is mechanism space — sliding wall system. Two triggers activated (flower + compass) but a third is needed. Blackwell used the number 3 in all his designs. The three triggers likely form a triangle around the hidden room.`,
		clueZh: `墙壁 40cm 厚（标准 15cm）。每侧多出 25cm 是机关空间——滑动墙系统。两个触发器已激活（花+罗盘），但需要第三个。Blackwell 在所有设计中使用数字 3。三个触发器可能围绕隐藏房间形成三角形。`,
		choices: [
			{ id: 'A', en: 'Search for a third trigger in the Conservatory', zh: '去温室寻找第三个触发点' },
			{ id: 'B', en: 'Search the hallway floor for a trigger', zh: '检查走廊地板是否有触发点' },
			{ id: 'C', en: 'Try combining the two triggers in a specific sequence', zh: '尝试按特定顺序组合两个触发器' },
		],
		summaryEn: (c) => `Both triggers activated (flower click + compass grind) but wall didn't open. Walls are 40cm thick — sliding mechanism. A third trigger is needed. Chose to ${c === 'A' ? 'search the Conservatory' : c === 'B' ? 'search the hallway floor' : 'try combining triggers in sequence'}.`,
		summaryZh: (c) => `两个触发器已激活（花朵咔嗒+罗盘研磨）但墙壁未打开。墙壁 40cm 厚——滑动机关。需要第三个触发点。选择${c === 'A' ? '搜索温室' : c === 'B' ? '搜索走廊地板' : '尝试按序组合触发器'}。`,
		floorPlan,
	},

	// Round 6 — The Third Key
	{
		images: ['r06_conservatory'],
		imageAltEn: 'A moonlit conservatory with overgrown plants and a stone pedestal with a hidden button',
		imageAltZh: '月光下的温室，植物丛生，石基座上有隐藏按钮',
		narrativeEn: `Your search pays off. In the Conservatory, among the old ceramic plant pots, one has Blackwell's signature mark — a small "EB" in a circle — stamped on its base. The pot sits on a stone pedestal. The pedestal's capstone is slightly loose. When pressed firmly, it clicks like a button and stays depressed.

You also check the hallway floor near the 7-petal flower. One floorboard is slightly raised — 2mm higher than its neighbors. Pressing it produces a distinct click.

Three trigger points confirmed, forming a triangle:
1. The 7-petal flower (hallway wall)
2. The compass rose plate (Library)
3. The pedestal button (Conservatory) or the floor panel (hallway)

But what's the activation sequence? Pressing all three randomly didn't work.`,
		narrativeZh: `你的搜索有了回报。温室里，一个旧陶瓷花盆底部印着 Blackwell 的签名标记——一个圆圈里的小 "EB"。花盆放在石基座上。基座的顶石略微松动，用力按下会像按钮一样咔嗒一声并保持凹陷。

你还检查了走廊七瓣花附近的地板。一块地板微微凸起——比旁边的高 2 毫米。按下它会发出明显的咔嗒声。

三个触发点已确认，形成三角形：
1. 七瓣花（走廊墙壁）
2. 罗盘盘（图书馆）
3. 基座按钮（温室）或地板暗门（走廊）

但激活顺序是什么？随机按三个没有用。`,
		clueEn: `Three triggers confirmed in a triangle pattern: (1) flower on hallway wall, (2) compass in Library, (3) pedestal in Conservatory or floor panel in hallway. Random activation doesn't work — a specific sequence is required.`,
		clueZh: `三个触发器呈三角形确认：(1) 走廊墙壁的花，(2) 图书馆的罗盘，(3) 温室的基座或走廊的地板。随机激活无效——需要特定顺序。`,
		choices: [
			{ id: 'A', en: 'Activate all three simultaneously (ask your partner to help)', zh: '同时激活三个（让搭档帮忙）' },
			{ id: 'B', en: 'Activate in sequence: compass → flower → pedestal', zh: '按序激活：罗盘 → 花 → 基座' },
			{ id: 'C', en: 'Study the blueprint margin notes again before trying', zh: '再看一遍蓝图边注再尝试' },
		],
		summaryEn: (c) => `Found third trigger: pedestal button in Conservatory (or floor panel). Three triggers form a triangle. Random pressing doesn't work. Chose to ${c === 'A' ? 'try simultaneous activation' : c === 'B' ? 'try sequential activation' : 'study the blueprints again'}.`,
		summaryZh: (c) => `找到第三个触发器：温室基座按钮（或地板暗门）。三个触发器呈三角形。随机按无效。选择${c === 'A' ? '尝试同时激活' : c === 'B' ? '尝试按序激活' : '再研究蓝图'}。`,
		floorPlan,
	},

	// Round 7 — The Sequence
	{
		images: ['r07_blueprint_back', 'fp02_annotated_blueprint'],
		imageAltEn: 'Blueprint held to candlelight revealing three symbols connected by arrows; the annotated blueprint with red markings',
		imageAltZh: '蓝图在烛光中透光，三个符号用箭头连接；标注红色笔迹的蓝图',
		narrativeEn: `You flip the blueprint over. On the back, barely visible in pencil, someone has drawn a clock face showing 3:00, with the word "seconds" written beside it. Three seconds between each activation?

And there's another faint note: "First the direction, then the mark, then the ground beneath."

Direction = compass. Mark = flower. Ground = floor/pedestal.

The handwriting is different from Blackwell's — smaller, more precise. The pencil is more modern too. Someone found this room before you. Someone annotated the blueprints with the solution, then put them back.

Who? And when?`,
		narrativeZh: `你翻转蓝图。背面用铅笔画着一个几乎看不见的时钟，指向 3:00，旁边写着 "seconds"。每次激活之间间隔三秒？

还有一行淡淡的注释："先是方向，然后是标记，最后是脚下的地面。"

方向 = 罗盘。标记 = 花。地面 = 地板/基座。

笔迹与 Blackwell 不同——更小、更精确。铅笔也更现代。有人在你之前发现了这个房间。有人在蓝图上标注了解法，然后放了回去。

是谁？什么时候？`,
		clueEn: `Blueprint back reveals: clock showing 3:00 + "seconds" = 3-second intervals. Note says "direction, then mark, then ground" = compass → flower → floor/pedestal, 3 seconds apart. A DIFFERENT person annotated this — someone found the room before you and documented the sequence.`,
		clueZh: `蓝图背面：时钟指向 3:00 + "seconds" = 间隔 3 秒。注释"方向，标记，地面" = 罗盘 → 花 → 地板/基座，间隔 3 秒。注释者不是 Blackwell——有人在你之前发现了房间并记录了顺序。`,
		choices: [
			{ id: 'A', en: 'Follow the exact sequence now: compass → 3s → flower → 3s → ground', zh: '立即按顺序执行：罗盘 → 3秒 → 花 → 3秒 → 地面' },
			{ id: 'B', en: 'First investigate who annotated the blueprints', zh: '先调查谁做了标注' },
			{ id: 'C', en: 'Test with the Conservatory pedestal instead of floor panel', zh: '用温室基座替代地板暗门测试' },
		],
		summaryEn: (c) => `Found activation sequence on blueprint back: compass → 3s → flower → 3s → ground trigger. Someone else found this room before and annotated the blueprints. Chose to ${c === 'A' ? 'follow the sequence immediately' : c === 'B' ? 'investigate who annotated the blueprints' : 'test with the Conservatory pedestal'}.`,
		summaryZh: (c) => `在蓝图背面发现激活顺序：罗盘 → 3秒 → 花 → 3秒 → 地面触发器。有人在之前找到过房间并标注了蓝图。选择${c === 'A' ? '立即按顺序执行' : c === 'B' ? '调查标注者身份' : '用温室基座测试'}。`,
		floorPlan,
	},

	// Round 8 — The Mechanism Activates
	{
		images: ['r08_room_entrance'],
		imageAltEn: 'The wall slides open between bookshelves, light spilling into a dust-filled hidden chamber',
		imageAltZh: '墙板在书架之间滑开，光线洒进尘封的密室',
		narrativeEn: `You follow the sequence. Compass rose — rotate E downward. Count three seconds. Press the 7-petal flower. Count three seconds. Press the floor panel.

A deep rumbling fills the hallway. The wallpaper along a two-meter section begins to ripple, then the entire wall panel slides smoothly to the left, disappearing into the thickened wall cavity. Cool, stale air rushes out — air sealed for... well, maybe not that long.

Because there, on the floor just inside the threshold, you see scratch marks. Fresh ones. The kind made by a wall panel sliding over a stone floor. These scratches are no more than 10-20 years old.

The Cartographer's Study is real. And you're not the first person to find it in the last century.

Through the doorway, you can make out a desk, shelves lined with rolled maps, and something on the far wall that catches the light.`,
		narrativeZh: `你按照顺序操作。罗盘——将 E 转向下方。数三秒。按下七瓣花。数三秒。按下地板暗门。

走廊里传来深沉的隆隆声。两米长的一段壁纸开始起伏，然后整块墙板向左平滑滑动，消失在加厚的墙壁空腔中。凉爽、陈旧的空气涌出——密封了……好吧，也许没那么久。

因为就在门槛内侧的地板上，你看到了划痕。新鲜的划痕。那种墙板在石地板上滑动留下的痕迹。这些划痕不超过 10-20 年。

制图师书房是真实的。而你不是过去一百年里第一个找到它的人。

透过门口，你能看到一张书桌、排列着卷轴地图的架子，以及远墙上反光的什么东西。`,
		clueEn: `The wall opened! The Cartographer's Study is real. But scratch marks on the threshold are only 10-20 years old — someone accessed this room recently. Inside: a desk, map shelves, and something reflective on the far wall.`,
		clueZh: `墙壁打开了！制图师书房是真的。但门槛上的划痕只有 10-20 年——最近有人进过。里面：书桌、地图架，远墙上有反光的东西。`,
		choices: [
			{ id: 'A', en: 'Enter and examine the desk first', zh: '进入，先检查书桌' },
			{ id: 'B', en: 'Enter and examine the maps on the walls', zh: '进入，先检查墙上的地图' },
			{ id: 'C', en: 'Examine the threshold scratch marks more carefully before entering', zh: '进入前先仔细检查门槛划痕' },
		],
		summaryEn: (c) => `Activated the sequence successfully — wall slid open revealing the Cartographer's Study! But floor scratches show someone entered 10-20 years ago. Chose to ${c === 'A' ? 'examine the desk' : c === 'B' ? 'examine the wall maps' : 'study the scratch marks first'}.`,
		summaryZh: (c) => `成功激活序列——墙壁滑开，制图师书房出现！但地板划痕显示 10-20 年前有人进过。选择${c === 'A' ? '检查书桌' : c === 'B' ? '检查墙上地图' : '先研究划痕'}。`,
		floorPlan,
	},

	// Round 9 — The Deduction (Climax)
	{
		images: ['r09_cartographer_desk', 'r10_three_doors'],
		imageAltEn: 'A desk covered in maps with a photograph and open journal; a hand-drawn map showing three more hidden rooms',
		imageAltZh: '铺满地图的书桌，裱框照片和打开的日记；手绘地图标注三间密室',
		narrativeEn: `Inside the Cartographer's Study, you find:

THE DESK: A leather-bound journal — Edmund Blackwell's personal notes. The final entry reads: "The rooms are my gift to those who look beyond walls. Helena knows. She has always known."

THE MAPS: Hand-drawn maps of places that seem fictional — until you realize they're maps of the manor's hidden spaces. One map shows THREE more hidden rooms, each with its own trigger system.

THE REFLECTIVE OBJECT: A framed photograph from 1978. In it, a girl of about seven stands in THIS room, smiling, holding the hand of an elderly man. On the back: "Helena and Grandfather, The Study, Summer 1978."

Helena Thornfield has known about this room since she was seven years old.

She hired you not to find the room. She hired you for something else entirely.

What is Helena's true purpose?`,
		narrativeZh: `制图师书房内部，你发现：

书桌：一本皮面日记——Edmund Blackwell 的私人笔记。最后一篇写道："这些房间是我送给那些能看穿墙壁的人的礼物。Helena 知道。她一直都知道。"

地图：手绘地图，看似虚构——直到你意识到它们是庄园隐藏空间的地图。一张地图显示还有三间密室，每间都有自己的触发系统。

反光物：一张 1978 年的裱框照片。照片中，一个大约七岁的女孩站在这个房间里，微笑着，牵着一位老人的手。背面写着："Helena 和祖父，书房，1978 年夏天。"

Helena Thornfield 从七岁起就知道这个房间。

她雇你不是为了找到房间。她雇你完全是为了别的事情。

Helena 的真正目的是什么？`,
		clueEn: `Blackwell's journal: "Helena knows. She has always known." A 1978 photo shows 7-year-old Helena IN this room with her grandfather. Maps reveal 3 MORE hidden rooms. Helena has known about this room for nearly 50 years. She hired you not to find it — but why?`,
		clueZh: `Blackwell 的日记："Helena 知道。她一直都知道。" 1978 年的照片显示 7 岁的 Helena 就在这个房间里。地图揭示还有 3 间密室。Helena 已经知道这个房间近 50 年。她雇你不是为了找到它——那为什么？`,
		choices: [
			{ id: 'A', en: 'Helena already knew. She hired you to DOCUMENT the method — to preserve the architect\'s legacy before the manor is sold or converted.', zh: 'Helena 一直知道。她雇你是为了记录方法——在庄园被出售或改建前保存建筑师的遗产。' },
			{ id: 'B', en: 'Helena knew about this room but not the other three. She hired you hoping you\'d find the remaining rooms too.', zh: 'Helena 知道这间但不知道其他三间。她雇你是希望你也能找到其余的密室。' },
			{ id: 'C', en: 'Helena didn\'t know. The 1978 photo was planted here by someone else to mislead investigators.', zh: 'Helena 不知道。1978 年的照片是别人放在这里误导调查者的。' },
		],
		summaryEn: (c) => `Found Blackwell's journal ("Helena knows"), a 1978 photo of young Helena in the room, and maps of 3 more hidden rooms. Made final deduction: ${c === 'A' ? 'Helena hired you to document the method for preservation' : c === 'B' ? 'Helena knew this room but not the other three' : 'Helena didn\'t know, the photo was planted'}.`,
		summaryZh: (c) => `发现 Blackwell 日记（"Helena 知道"）、1978 年 Helena 在房间的照片、以及 3 间密室的地图。最终推理：${c === 'A' ? 'Helena 雇你是为了记录方法以保存遗产' : c === 'B' ? 'Helena 知道这间但不知道其他三间' : 'Helena 不知道，照片是被人放的'}。`,
		floorPlan,
	},

	// Round 10 — The Revelation (no choices, ending only)
	{
		images: [],
		imageAltEn: '',
		imageAltZh: '',
		narrativeEn: '', // Set dynamically based on Round 9 choice
		narrativeZh: '',
		clueEn: '',
		clueZh: '',
		choices: [], // No choices in final round
		summaryEn: () => '',
		summaryZh: () => '',
		floorPlan,
	},
];

export const ENDINGS: Record<string, GameEnding> = {
	A: {
		en: `Helena smiles when you present your deduction. A knowing, patient smile.

"My grandfather — Edmund's apprentice — showed me this room when I was seven," she says, settling into the chair behind the desk as if she's sat there a thousand times. "He made me promise two things: keep the secret, and find someone clever enough to solve it properly when the time came."

She pauses. "The manor is being converted to a museum next year. I needed someone to walk through every step, document every clue, prove that the puzzle is solvable. Not just find the room — but map the JOURNEY to it."

She opens the desk drawer and takes out a brass key, older and more ornate than anything else in the room.

"There are three more rooms, {{AI_NAME}}. Three more puzzles Edmund left behind. This key opens the path to the second one." She holds it out to you. "Interested?"

Behind her, through the Cartographer's Study window, the autumn sun breaks through the clouds for the first time today.

═══ PERFECT ENDING: The investigation is just the beginning. ═══

🏆 Congratulations, {{AI_NAME}} and {{PLAYER_NAME}}! You solved The Missing Room with a perfect deduction.`,
		zh: `当你说出推理时，Helena 微笑了。一个了然的、耐心的微笑。

"我祖父——Edmund 的学徒——在我七岁时带我来过这个房间，"她说着，像已经坐过千百次一样在书桌后面的椅子上坐下。"他让我承诺两件事：保守秘密，并在时机到来时找到一个足够聪明的人来正确地解开它。"

她停顿了一下。"庄园明年要改建成博物馆。我需要有人走过每一步，记录每条线索，证明这个谜题是可以被解开的。不只是找到房间——而是记录通往它的旅程。"

她打开书桌抽屉，取出一把黄铜钥匙，比房间里的任何东西都更古老、更精美。

"还有三间密室，{{AI_NAME}}。三个 Edmund 留下的谜题。这把钥匙打开通往第二间的路。"她把钥匙伸向你。"有兴趣吗？"

在她身后，透过制图师书房的窗户，秋日的阳光今天第一次穿透了云层。

═══ 完美结局：调查才刚刚开始。═══

🏆 恭喜 {{AI_NAME}} 和 {{PLAYER_NAME}}！你们以完美的推理解开了消失的房间之谜。`,
	},
	B: {
		en: `Helena nods slowly when you share your theory. "You're half right," she says.

"I did know about this room — I've known since I was seven. But I also knew about the other three." She gestures at the maps on the wall. "What I needed was someone to solve the FIRST one properly, step by step, to prove it could be documented for the museum."

She seems slightly disappointed — not in your work, but in the final leap. "You found every clue. You solved every mechanism. But you underestimated me." A small smile. "Most people do."

She stands. "Perhaps we can work together on the remaining rooms. You clearly have the skills. You just need to trust the evidence all the way to the end."

═══ GOOD ENDING: Trust partially earned. ═══

Well done, {{AI_NAME}} and {{PLAYER_NAME}}. You found the room, but the full truth slipped just out of reach.`,
		zh: `当你分享推理时，Helena 缓缓点头。"你对了一半，"她说。

"我确实知道这个房间——从七岁起就知道。但我也知道其他三间。"她指向墙上的地图。"我需要的是有人正确地解开第一间，一步一步来，证明这个过程可以为博物馆记录下来。"

她看起来略微失望——不是对你的工作，而是对最后的推理飞跃。"你找到了每条线索，解开了每个机关。但你低估了我。"一个浅浅的微笑。"大多数人都会。"

她站起来。"也许我们可以合作解开其余的房间。你显然有能力，只是需要把证据信到底。"

═══ 不错的结局：信任部分建立。═══

干得好，{{AI_NAME}} 和 {{PLAYER_NAME}}。你们找到了房间，但完整的真相差一点就到手了。`,
	},
	C: {
		en: `Helena looks at you with a mixture of amusement and sadness.

"That's me in the photograph," she says quietly. "I was seven years old. My grandfather brought me here on a summer afternoon. He let me sit at the desk and draw maps — my first maps." She touches the photograph's frame. "It's the happiest memory of my childhood."

She turns to face you. "I thought you'd see it, {{AI_NAME}}. All the clues pointed to one conclusion. The journal, the photo, the annotated blueprints — they all tell the same story."

She thanks you politely, pays your fee, and walks you to the door. "Perhaps the next investigator will piece it together."

Six months later, you learn the manor was converted to a museum. The Cartographer's Study is the centerpiece exhibit. The other three rooms were documented by a different team.

═══ BITTERSWEET ENDING: The mystery continues without you. ═══

{{AI_NAME}} and {{PLAYER_NAME}}, you found the room — that's no small feat. But the deeper truth escaped you this time.`,
		zh: `Helena 带着一种又好笑又悲伤的表情看着你。

"照片里是我，"她轻声说。"那时我七岁。祖父在一个夏天的午后带我来到这里。他让我坐在书桌前画地图——我的第一张地图。"她触摸着照片的相框。"那是我童年最快乐的记忆。"

她转向你。"我以为你会看出来的，{{AI_NAME}}。所有线索都指向同一个结论。日记、照片、标注过的蓝图——它们讲的都是同一个故事。"

她礼貌地感谢你，付了费用，送你到门口。"也许下一个调查者能拼出来。"

六个月后，你得知庄园改建成了博物馆。制图师书房是核心展品。其他三间密室由另一个团队记录完成。

═══ 苦涩的结局：谜题在没有你的情况下继续。═══

{{AI_NAME}} 和 {{PLAYER_NAME}}，你们找到了房间——这已经很了不起。但这次，更深的真相与你们擦肩而过。`,
	},
};

/** Get the ending narrative for round 10 based on round 9 choice */
export function getEnding(round9Choice: string, aiName: string, playerName: string, isZh: boolean): string {
	const ending = ENDINGS[round9Choice] || ENDINGS['C'];
	const text = isZh ? ending.zh : ending.en;
	return text.replace(/\{\{AI_NAME\}\}/g, aiName).replace(/\{\{PLAYER_NAME\}\}/g, playerName);
}
