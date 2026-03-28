import type { APIRoute } from 'astro';

// Empathetic response engine — pattern-matched for now, ready for Claude API integration
const reflections: { patterns: RegExp[]; responses: string[] }[] = [
  {
    patterns: [/lonely|alone|no one|nobody|isolat/i],
    responses: [
      "That feeling of being alone even when people are around — it's one of the heaviest things a person can carry. You're not broken for feeling it. You're human.",
      "Loneliness isn't about being physically alone. It's about feeling unseen. And right now, I see you.",
      "The thing about loneliness is it lies to you. It tells you nobody cares. But you showed up here tonight, which means some part of you knows that's not true.",
    ],
  },
  {
    patterns: [/married|wife|partner|spouse|relationship/i],
    responses: [
      "Being lonely inside a relationship is a particular kind of pain — because you're supposed to have someone, and yet the distance feels infinite. That's not failure. That's real.",
      "You can love someone and still feel completely unseen by them. That disconnect doesn't make you ungrateful. It makes you honest.",
      "The hardest loneliness is the kind you can't explain to the person sleeping next to you. You're allowed to name that.",
    ],
  },
  {
    patterns: [/breakup|broke up|ex |she left|he left|dumped|separated|divorce/i],
    responses: [
      "A breakup doesn't just end a relationship — it rearranges your whole identity. Give yourself time to figure out who you are now. There's no deadline.",
      "The silence after someone leaves is deafening. You're not weak for struggling with it. You're grieving something real.",
      "Right now it probably feels like the world kept moving while yours stopped. That's not dramatic — that's loss. And loss takes time.",
    ],
  },
  {
    patterns: [/depress|hopeless|pointless|no point|give up|can't go on|empty|numb/i],
    responses: [
      "When everything feels flat and nothing has colour — that's not laziness, that's not weakness. That's your mind telling you it's carrying too much. You showed up here. That matters.",
      "The numbness is your brain's way of protecting you from feeling too much at once. It doesn't mean you're broken. It means you've been strong for too long.",
      "I'm not going to tell you it gets better, because you've probably heard that. What I will say is: you're here, right now, and that takes more courage than people realise.",
    ],
  },
  {
    patterns: [/sleep|can't sleep|insomnia|awake|3am|2am|middle of the night|up late/i],
    responses: [
      "The nights are the hardest, aren't they? When the world goes quiet, the mind gets loud. You don't need to solve anything right now. Just let it out.",
      "There's something about 2am that strips away all the armour. It's just you and the truth. That's not a bad thing — it means you're ready to face it.",
      "Can't sleep because the thoughts won't stop. I get it. You don't need to fight them. Just write them down. Get them out of your head and into this box.",
    ],
  },
  {
    patterns: [/work|job|career|boss|fired|laid off|burnout|burnt out/i],
    responses: [
      "When your identity is tied to your work and the work starts crumbling — it shakes everything. You are more than your job title. Way more.",
      "Burnout isn't about being tired. It's about being tired of pretending you're fine. You don't have to pretend here.",
      "Losing a job — or hating the one you have — hits differently when you're supposed to be 'the provider.' That pressure is real. And it's okay to say it's too much.",
    ],
  },
  {
    patterns: [/angry|furious|rage|pissed|frustrated|mad/i],
    responses: [
      "Anger usually means something underneath it needs attention. Pain, fear, betrayal — anger is just the bodyguard. What's it protecting?",
      "You're allowed to be angry. Society tells men to be calm, rational, collected. But sometimes the right response is fury. Just don't let it drive.",
      "The anger makes sense. Whatever caused it — it mattered to you. That's not weakness, that's caring about something deeply.",
    ],
  },
  {
    patterns: [/father|dad|parent|kid|children|son|daughter|family/i],
    responses: [
      "The weight of fatherhood — of wanting to get it right while questioning everything — is something most men carry silently. You're not failing. You're showing up.",
      "Family can be the source of your greatest joy and your deepest exhaustion, sometimes in the same hour. That contradiction is normal.",
      "Worrying about your kids, about being enough for them — that's not anxiety, that's love. And it means you're a better parent than you think.",
    ],
  },
  {
    patterns: [/midlife|middle age|getting old|40s|turning 40|crisis|stuck|what am i doing/i],
    responses: [
      "That moment where you look at your life and think 'is this it?' — that's not a crisis. That's clarity. You're finally seeing what's missing.",
      "Midlife isn't about the sports car or the breakdown. It's about realising the script you followed wasn't yours. It's okay to rewrite it.",
      "Feeling stuck at this stage doesn't mean you wasted the first half. It means you're finally honest enough to want more from the second.",
    ],
  },
  {
    patterns: [/cry|tears|weep|sobbing|breaking down/i],
    responses: [
      "Crying isn't weakness. It's your body releasing what your mind can't hold anymore. Let it happen.",
      "Men are taught to hold it in until they crack. You don't have to do that here. This is your space.",
      "The tears mean you still feel. In a world that tries to numb you — that's actually a kind of strength.",
    ],
  },
  {
    patterns: [/thank|helped|better|grateful/i],
    responses: [
      "You did the hard part — you showed up and said what was real. That's all you. I'm just the wall you're bouncing it off of.",
      "You don't need to thank me. You needed to be heard, and you were. Come back whenever.",
      "Glad you feel a bit lighter. That's what this place is for. No judgement, no fixing. Just space.",
    ],
  },
];

// Fallback responses when no pattern matches
const fallbacks = [
  "I hear you. You don't need to explain more than you want to. Whatever you're carrying right now — it's real, and it matters.",
  "Sometimes the hardest thing is just putting it into words. You did that. That's more than most people manage.",
  "There's no right way to feel. Whatever's going on in your head — you don't need to justify it to anyone. Least of all here.",
  "You came here because something needed to come out. Trust that instinct. Say as much or as little as you need.",
  "I'm not going to pretend I have answers. But I'm here, and I'm listening. That's what this space is for.",
  "The fact that you're writing this — even at this hour — means you haven't given up. Hold onto that.",
];

// Named feelings detection
const feelings: { pattern: RegExp; name: string }[] = [
  { pattern: /lonely|alone|isolated|no friends/i, name: "loneliness" },
  { pattern: /married.*lonely|relationship.*alone|partner.*distant/i, name: "quiet disconnection" },
  { pattern: /breakup|broke up|ex |left me/i, name: "grief from loss" },
  { pattern: /depress|hopeless|empty|numb|flat/i, name: "emotional exhaustion" },
  { pattern: /angry|rage|furious|frustrated/i, name: "buried frustration" },
  { pattern: /anxious|worry|panic|scared|fear/i, name: "anxiety" },
  { pattern: /stuck|trapped|no way out|dead end/i, name: "feeling trapped" },
  { pattern: /sleep|insomnia|awake|2am|3am/i, name: "restless unease" },
  { pattern: /fail|failure|not good enough|worthless/i, name: "self-doubt" },
  { pattern: /midlife|crisis|what am i doing|is this it/i, name: "quiet questioning" },
  { pattern: /cry|tears|breaking down/i, name: "emotional release" },
  { pattern: /miss |missing /i, name: "longing" },
];

function detectFeeling(text: string): string | null {
  for (const f of feelings) {
    if (f.pattern.test(text)) return f.name;
  }
  return null;
}

function getResponse(text: string): string {
  // Try pattern-matched reflections first
  for (const group of reflections) {
    for (const pattern of group.patterns) {
      if (pattern.test(text)) {
        const pool = group.responses;
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }
  // Fallback
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const message = body.message?.trim();

    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const echo = getResponse(message);
    const feeling = detectFeeling(message);

    return new Response(
      JSON.stringify({ echo, feeling }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Something went wrong' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
