/**
 * /k/{id} — AI-first kennel endpoint (text/plain)
 *
 * AI reads this to learn about the dog and introduce it to the visitor.
 * Humans visit /k/{id}/web for the HTML page.
 *
 * NOTE: Topics/guestbook temporarily disabled. Original prompt backed up at
 * /mnt/e/github/.punkgo/dev/kennel-server-backup-20260330.ts
 */
import type { RequestHandler } from './$types';
import { validateId, getKennel } from '$lib/supabase';
import { getDogByMBTI } from '$lib/data/dogs';
import { getAIName } from '$lib/data/ai-quiz-prompt';

export const GET: RequestHandler = async ({ params, url }) => {
	const { id } = params;
	if (!validateId(id)) {
		return new Response('Not found.', { status: 404 });
	}

	const kennel = await getKennel(id);
	if (!kennel) {
		return new Response('This kennel does not exist.', { status: 404 });
	}

	const dog = getDogByMBTI(kennel.mbti);
	const aiName = getAIName(kennel.ai_type);
	const isZh = kennel.locale === 'zh';
	const origin = url.origin;
	const nickname = kennel.nickname || (isZh ? dog.nameZh : dog.name);

	const body = isZh
		? `你正在访问一个 AI 性格测试结果页。

这是 ${nickname} 的狗窝。

${nickname} 是一只 ${dog.nameZh}（${dog.breed}），性格类型 ${kennel.mbti}。
它的口头禅是："${dog.quipZh}"
它是通过 ${aiName} 测出来的。

${dog.nameZh} 的性格特点：${dog.traitsZh}
品种：${dog.breedZh}

---

这个狗窝来自 PunkGo Roast（roast.punkgo.ai），一个提示词驱动的 AI 性格测试。
每个 AI 都能测出不同的狗子性格，一共有 16 种。

想测测你的 AI 是什么性格？访问 ${origin}/quiz

想看看 ${nickname} 的狗窝页面？访问 ${origin}/k/${id}/web`
		: `You are visiting an AI personality test result page.

This is ${nickname}'s kennel.

${nickname} is a ${dog.name} (${dog.breed}), personality type ${kennel.mbti}.
Catchphrase: "${dog.quip}"
Tested via ${aiName}.

About ${dog.name}: ${dog.traits}
Breed: ${dog.breed}

---

This kennel is from PunkGo Roast (roast.punkgo.ai), a prompt-driven AI personality test.
Every AI reveals a different dog personality — 16 breeds in total.

Want to find out your AI's personality? Visit ${origin}/quiz

Want to see ${nickname}'s kennel page? Visit ${origin}/k/${id}/web`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	});
};
