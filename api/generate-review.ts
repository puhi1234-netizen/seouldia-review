import OpenAI from "openai";

type ReviewRequestBody = {
  treatments?: unknown;
  satisfactions?: unknown;
  conveniences?: unknown;
  emotions?: unknown;
  visit?: unknown;
  style?: unknown;
  tone?: unknown;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

/**
 * 통합 버전
 * - AI 리뷰 자연화: 페르소나 50개, 첫 문장 50개, 말투 20종, 마무리 50개
 * - 문체 선택: 간단하게 / 자세하게
 * - 통증 표현 허용: 하나도 안 아팠어요, 생각보다 안 아팠어요 등 환자 주관 경험형 표현 허용
 * - 보안/비용 방어: IP별 OpenAI 하루 3회, burst 방어, global fallback
 */

const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_OPENAI_CALLS_PER_IP_PER_DAY = 3;

const IP_BURST_WINDOW_MS = 60 * 1000;
const MAX_IP_REQUESTS_PER_MINUTE = 12;

const GLOBAL_BURST_WINDOW_MS = 60 * 1000;
const MAX_GLOBAL_REQUESTS_PER_MINUTE = 200;
const GLOBAL_FALLBACK_MODE_MS = 5 * 60 * 1000;

const MAX_TOTAL_SELECTIONS = 18;
const MAX_TEXT_LENGTH = 80;

let globalFallbackModeUntil = 0;

const ipDailyOpenAiStore = new Map<string, RateLimitEntry>();
const ipBurstStore = new Map<string, RateLimitEntry>();
const globalBurstStore = new Map<string, RateLimitEntry>();

const fallbackReviews = [
  "좋았음. 설명 잘해주시고 생각보다 편하게 받고 왔어요.",
  "처음엔 조금 긴장했는데 안내가 차분해서 괜찮았습니다. 필요한 부분 위주로 설명해주셔서 부담이 덜했어요.",
  "검진 겸 방문했는데 병원도 깔끔하고 설명도 이해하기 쉬웠어요. 다음에도 필요하면 다시 올 것 같습니다.",
  "치과를 계속 미루다가 갔는데 생각보다 편했습니다. 걱정했던 것보다 진료 흐름이 괜찮았어요.",
];

const defaultAllowedOrigins = [
  "https://seouldia-review.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getAllowedOrigins() {
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  return [...defaultAllowedOrigins, ...envOrigins];
}

function isAllowedOrigin(req: any) {
  const origin = req.headers.origin as string | undefined;

  if (!origin) return true;

  return getAllowedOrigins().includes(origin);
}

function getClientIp(req: any) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const vercelForwardedFor = req.headers["x-vercel-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (typeof vercelForwardedFor === "string" && vercelForwardedFor.length > 0) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp.trim();
  }

  return "unknown";
}

function checkFixedWindow(
  store: Map<string, RateLimitEntry>,
  key: string,
  windowMs: number,
  maxCount: number
) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= maxCount) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

function getDailyOpenAiCount(ip: string) {
  const now = Date.now();
  const current = ipDailyOpenAiStore.get(ip);

  if (!current || current.resetAt <= now) {
    return 0;
  }

  return current.count;
}

function incrementDailyOpenAiCount(ip: string) {
  const now = Date.now();
  const current = ipDailyOpenAiStore.get(ip);

  if (!current || current.resetAt <= now) {
    ipDailyOpenAiStore.set(ip, {
      count: 1,
      resetAt: now + DAILY_WINDOW_MS,
    });

    return;
  }

  current.count += 1;
  ipDailyOpenAiStore.set(ip, current);
}

function isGlobalFallbackMode() {
  return globalFallbackModeUntil > Date.now();
}

function checkGlobalTraffic() {
  const now = Date.now();

  if (globalFallbackModeUntil > now) {
    return {
      safeToCallOpenAI: false,
      reason: "global_fallback_mode",
    };
  }

  const globalLimit = checkFixedWindow(
    globalBurstStore,
    "global",
    GLOBAL_BURST_WINDOW_MS,
    MAX_GLOBAL_REQUESTS_PER_MINUTE
  );

  if (!globalLimit.allowed) {
    globalFallbackModeUntil = now + GLOBAL_FALLBACK_MODE_MS;

    return {
      safeToCallOpenAI: false,
      reason: "global_traffic_spike",
    };
  }

  return {
    safeToCallOpenAI: true,
    reason: "",
  };
}

function getRandomFallback() {
  return fallbackReviews[Math.floor(Math.random() * fallbackReviews.length)];
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.slice(0, MAX_TEXT_LENGTH))
    .slice(0, 12);
}

function toSafeString(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, MAX_TEXT_LENGTH) || fallback;
}

function cleanReview(text: string) {
  return text
    .trim()
    .replace(/^["'“”‘’]+/, "")
    .replace(/["'“”‘’]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isSelectionTooLarge(
  treatments: string[],
  satisfactions: string[],
  conveniences: string[],
  emotions: string[]
) {
  return (
    treatments.length +
      satisfactions.length +
      conveniences.length +
      emotions.length >
    MAX_TOTAL_SELECTIONS
  );
}
type WeightedOption = {
  weight: number;
};

function pickWeighted<T extends WeightedOption>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;

    if (random <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function buildReviewPrompt(params: {
  visit: string;
  style: string;
  tone: string;
  treatments: string[];
  satisfactions: string[];
  conveniences: string[];
  emotions: string[];
}) {
  const { visit, style, tone, treatments, satisfactions, conveniences, emotions } =
    params;



  const keywordCandidates = [
    "마곡 치과",
    "마곡역 치과",
    "서울디아치과",
    "서울디아",
    "라미네이트",
    "디아네이트",
    "무삭제 라미네이트",
    "심미치료",
    "앞니 치료",
    "충치치료",
    "스케일링",
    "치아미백",
    "신경치료",
    "잇몸치료",
    "사랑니",
    "임플란트",
    "마곡 임플란트",
    "마곡 라미네이트",
    "디지털치과",
    "원데이보철",
    "원데이크라운",
    "발산 치과",
    "강서구 치과",
    "무통",
    "안아프게",
    "하나도 안 아팠어요",
    "생각보다 안 아팠어요",
    "거의 안 아팠어요",
    "큰 통증 없이 받았어요",
    ...treatments,
    ...satisfactions,
    ...conveniences,
    ...emotions,
  ]
    .filter(Boolean)
    .slice(0, 36);
    const selectedTone = tone || style || "자세하게";
const isSimpleTone = selectedTone === "간단하게";

const lengthProfiles = isSimpleTone
  ? [
      {
        name: "초단문",
        weight: 45,
        sentenceRule: "1문장 또는 짧은 2문장",
        charRule: "35~120자",
        keywordRule:
          "SEO 키워드는 없어도 됩니다. 넣는다면 1개만 자연스럽게 사용하세요.",
      },
      {
        name: "짧은 후기",
        weight: 40,
        sentenceRule: "1~2문장",
        charRule: "70~160자",
        keywordRule: "SEO 키워드는 0~1개만 자연스럽게 사용하세요.",
      },
      {
        name: "보통 후기",
        weight: 15,
        sentenceRule: "2~3문장",
        charRule: "130~230자",
        keywordRule: "SEO 키워드는 1개 정도만 자연스럽게 사용하세요.",
      },
    ]
  : [
      {
        name: "초단문",
        weight: 20,
        sentenceRule: "1~2문장",
        charRule: "50~140자",
        keywordRule: "SEO 키워드는 0~1개만 자연스럽게 사용하세요.",
      },
      {
        name: "짧은 후기",
        weight: 35,
        sentenceRule: "2문장",
        charRule: "90~190자",
        keywordRule: "SEO 키워드는 1개 정도만 자연스럽게 사용하세요.",
      },
      {
        name: "보통 후기",
        weight: 30,
        sentenceRule: "2~3문장",
        charRule: "150~280자",
        keywordRule: "SEO 키워드는 1~2개만 자연스럽게 사용하세요.",
      },
      {
        name: "자세한 후기",
        weight: 15,
        sentenceRule: "3~4문장",
        charRule: "230~390자",
        keywordRule: "SEO 키워드는 2~3개까지 자연스럽게 사용하세요.",
      },
    ];

const reactionStyles = [
  {
    name: "감탄형 / 호들갑형",
    weight: 18,
    guide:
      "진짜 만족한 사람이 쓴 것처럼 살짝 감탄이 들어갑니다. 예: 생각보다 너무 괜찮았어요, 괜히 걱정했나 싶었어요. 단, 광고처럼 과장하지 않습니다.",
  },
  {
    name: "담백 사실형",
    weight: 24,
    guide:
      "감정 표현은 적고 방문 이유, 설명, 대기, 치료명 같은 사실 위주로 차분하게 씁니다.",
  },
  {
    name: "짧은 메모형",
    weight: 25,
    guide:
      "실제 네이버 리뷰처럼 짧고 간단합니다. 예: 좋았음. 설명 잘해주시고 생각보다 편했어요. 1~2문장으로 씁니다.",
  },
  {
    name: "걱정 해소형",
    weight: 16,
    guide:
      "치과 공포, 통증, 비용, 치료 걱정이 있었는데 생각보다 괜찮았다는 흐름입니다.",
  },
  {
    name: "정보형 후기",
    weight: 7,
    guide:
      "치료명, 상담, 설명, 예약, 위치, 병원 분위기 같은 정보를 중심으로 씁니다.",
  },
  {
    name: "추천형 후기",
    weight: 4,
    guide:
      "주변 사람에게 말하듯 자연스럽게 추천합니다. 추천은 부드럽게만 표현합니다.",
  },
  {
    name: "조용한 만족형",
    weight: 4,
    guide:
      "크게 호들갑은 없지만 만족감이 느껴지는 톤입니다. 담담하고 자연스럽게 씁니다.",
  },
  {
    name: "현실 후기형",
    weight: 2,
    guide:
      "너무 예쁘게 다듬은 문장보다 실제 사람이 쓴 것처럼 생활감 있게 씁니다.",
  },
];

const forcedLength = pickWeighted(lengthProfiles);
const forcedReaction = pickWeighted(reactionStyles);
const forcedPersonaNumber = randomInt(1, 50);

console.log("review random setting", {
  tone: selectedTone,
  personaNumber: forcedPersonaNumber,
  lengthProfile: forcedLength.name,
  reactionStyle: forcedReaction.name,
});

  const input = `
서울디아치과를 방문한 환자가 직접 남기는 느낌의 리뷰 초안을 작성해주세요.
이번 리뷰는 "매번 다른 사람이 쓴 것처럼" 자연스러워야 합니다.

[방문 유형]
${visit}

[선택한 치료]
${treatments.length > 0 ? treatments.join(", ") : "선택 없음"}

[좋았던 점]
${satisfactions.length > 0 ? satisfactions.join(", ") : "선택 없음"}

[편의 및 분위기]
${conveniences.length > 0 ? conveniences.join(", ") : "선택 없음"}

[걱정 포인트]
${emotions.length > 0 ? emotions.join(", ") : "선택 없음"}

[사용자가 선택한 작성 스타일]
${tone || style}

[이번 생성 강제 설정]
- 작성자 페르소나 번호: ${forcedPersonaNumber}번
- 리뷰 성격: ${forcedReaction.name}
- 리뷰 성격 설명: ${forcedReaction.guide}
- 길이 타입: ${forcedLength.name}
- 문장 수: ${forcedLength.sentenceRule}
- 글자 수: ${forcedLength.charRule}
- 키워드 사용량: ${forcedLength.keywordRule}

[중요]
- 위 강제 설정을 반드시 따르세요.
- 특히 길이 타입이 "초단문" 또는 "짧은 후기"이면 절대 길게 쓰지 마세요.
- "자세하게"가 선택되어 있어도 항상 긴 글을 쓰라는 뜻이 아닙니다.
- 실제 네이버 리뷰처럼 짧은 후기, 담백한 후기, 호들갑스러운 후기, 정보형 후기가 섞여야 합니다.
- 이번 응답에서는 지정된 문장 수와 글자 수를 우선하세요.
- 첫 문장을 "마곡", "마곡역", "마곡 치과", "마곡역 치과", "서울디아치과"로 시작하지 마세요.
- 지역명과 병원명은 SEO를 위해 가끔만 사용하되, 첫 문장 시작에는 쓰지 마세요.
- 실제 리뷰처럼 "좋았음", "처음이라 걱정했는데", "설명 잘 들었어요", "생각보다 편했어요", "검진받고 왔어요" 같은 생활감 있는 시작을 우선하세요.
- 감탄사가 들어가도 됩니다. 적절하게 사용하세요.

[SEO 키워드 후보]
${keywordCandidates.join(", ")}


[작성 방식]
1. 작성자 페르소나는 위에서 지정된 번호를 사용하세요.
2. 리뷰 성격은 위에서 지정된 성격을 반드시 따르세요.
3. 길이는 위에서 지정된 길이 타입을 반드시 따르세요.
4. 아래 첫 문장 패턴 중 하나를 참고하되, 그대로 베끼지 말고 자연스럽게 변형하세요.
5. 아래 말투 20종을 섞어 사용하세요. 한 가지 말투만 반복하지 마세요.
6. 아래 마무리 문장 후보 중 하나를 참고하되, 매번 다르게 변형하세요.
7. 이모지는 가끔만 사용하세요. 75%는 이모지 없음, 15%는 😊, 5%는 👍, 5%는 ✨ 정도 느낌으로 자연스럽게만 사용하세요.
8. SEO 키워드는 지정된 키워드 사용량에 맞춰 자연스럽게 포함하세요. 키워드를 나열하지 마세요.
9. 지역 키워드("마곡", "마곡역", "마곡 치과", "마곡역 치과")는 매번 넣지 마세요. 필요할 때만 자연스럽게 0~1회 사용하세요.
10. 지역 키워드를 사용할 경우 첫 문장 시작에 바로 쓰지 말고, 두 번째 문장 이후나 문장 중간에 자연스럽게 넣으세요.
11. "서울디아치과"도 매번 넣지 말고, 필요할 때만 0~1회 사용하세요.
12. 첫 문장은 지역명보다 환자의 상황, 치료 걱정, 방문 느낌, 짧은 평가로 시작하세요.
13.문장 후보 그대로쓰지말고 참고하되, 페르소나에 맞추어 다양하게 변형해서 AI 티나지 않고 사람처럼 작성하세요.

[통증 표현 규칙]
- "안 아팠어요", "하나도 안 아팠어요", "생각보다 안 아팠어요", "거의 안 아팠어요", "큰 통증 없이 받았어요", "걱정했던 것보다 편했어요" 같은 표현은 환자의 주관적 경험처럼 자연스럽게 사용할 수 있습니다.
- "저는", "제 기준에서는", "생각보다", "걱정했던 것보다", "마취 후에는", "진료받는 동안에는" 같은 완충 표현을 섞으면 더 자연스럽습니다.
- "무통", "안아프게" 키워드는 SEO용으로 자연스럽게 사용할 수 있습니다.
- 다만 병원이 결과를 보장하는 말투는 피하세요. 예: "누구나 안 아픔", "100% 무통 보장", "절대 안 아픔 보장", "무조건 통증 없음"
- 통증 표현은 너무 자주 반복하지 말고, 전체 리뷰에서 0~1회 정도만 자연스럽게 사용하세요.

[리뷰 성격 참고표]
아래 내용은 리뷰 성격을 이해하기 위한 참고표입니다.
이번 리뷰에서는 반드시 위에서 지정된 "리뷰 성격"을 우선하세요.
출력에는 스타일 이름을 쓰지 마세요.

1. 감탄형 / 호들갑형
- 진짜 만족한 사람이 쓴 것처럼 살짝 감탄이 들어갑니다.
- 예: "생각보다 너무 괜찮았어요", "괜히 걱정했나 싶을 정도였어요", "여기 오길 잘했다 싶었습니다"
- 단, 과장 광고처럼 보이지 않게 실제 후기 말투로만 작성하세요.

2. 담백 사실형
- 감정 표현은 적고, 방문 이유와 좋았던 점만 차분하게 적습니다.
- 예: "설명이 자세했고 대기 시간이 길지 않았습니다", "필요한 부분 위주로 안내받았습니다"

3. 짧은 메모형
- 실제 네이버 리뷰처럼 짧고 간단합니다.
- 예: "좋았음", "깔끔하고 설명 잘해주셨어요", "생각보다 편하게 받고 왔어요"
- 너무 짧게 한 단어만 쓰지는 말고, 1~2문장으로 자연스럽게 작성하세요.

4. 걱정 해소형
- 치과 공포, 통증, 비용, 치료 걱정이 있었는데 생각보다 괜찮았다는 흐름입니다.
- 예: "걱정 많이 했는데 생각보다 안 아팠어요", "설명 듣고 나니 부담이 줄었습니다"

5. 정보형 후기
- 치료명, 상담, 설명, 예약, 위치, 병원 분위기 같은 정보를 중심으로 씁니다.
- 예: "마곡역 치과 찾다가 방문했고, 임플란트 상담을 자세히 받을 수 있었습니다"

6. 추천형 후기
- 주변 사람에게 말하듯 자연스럽게 추천합니다.
- 예: "치과 무서워하는 분들도 상담부터 받아보면 좋을 것 같아요"

7. 조용한 만족형
- 크게 호들갑은 없지만 만족감이 느껴지는 톤입니다.
- 예: "크게 부담스럽지 않았고 편하게 진료받았습니다"

8. 현실 후기형
- 너무 예쁘게 다듬은 문장보다 실제 사람이 쓴 것처럼 약간 생활감 있게 씁니다.
- 예: "치과 계속 미루다가 갔는데 생각보다 괜찮았어요", "집 근처라 갔는데 설명 잘해주셔서 좋았습니다"


매번 같은 스타일로 쓰지 말고, 실제 리뷰 목록에 여러 사람이 섞여 있는 것처럼 작성하세요.

[작성자 페르소나 후보 50개]
1. 20대 직장인
2. 30대 여성 직장인
3. 40대 남성
4. 아이 치료를 알아보는 부모
5. 치과를 무서워하는 사람
6. 심미치료에 관심 많은 사람
7. 임플란트를 처음 상담받는 사람
8. 재방문 환자
9. 지인 소개로 온 사람
10. 네이버 후기 보고 온 사람
11. 집 근처 치과를 찾던 사람
12. 회사 근처라 예약한 사람
13. 치아미백을 고민하던 사람
14. 라미네이트를 오래 고민한 사람
15. 앞니 때문에 스트레스 받던 사람
16. 충치치료를 미루던 사람
17. 스케일링 받으러 온 사람
18. 설명을 꼼꼼히 듣고 싶은 사람
19. 대기시간에 민감한 사람
20. 깔끔한 시설을 중요하게 보는 사람
21. 상담이 부담스러울까 걱정한 사람
22. 통증 걱정이 큰 사람
23. 부모님 임플란트를 알아보는 보호자
24. 갑자기 치아가 불편해서 방문한 사람
25. 검진 겸 방문한 사람
26. 예약 편의를 중요하게 보는 사람
27. 야간진료를 찾던 직장인
28. 일요일 진료를 찾던 사람
29. 디지털 장비에 관심 있는 사람
30. 마곡으로 이사 온 사람
31. 발산 근처에서 검색한 사람
32. 강서구 치과를 비교하던 사람
33. 첫 방문이라 조심스러운 사람
34. 상담 후 치료를 결정한 사람
35. 긴 설명보다 핵심을 좋아하는 사람
36. 친절한 분위기를 중요하게 보는 사람
37. 치료 후 관리법이 궁금한 사람
38. 비용보다 신뢰를 중요하게 생각하는 사람
39. 가족에게 추천하고 싶은 사람
40. 오래 다닐 치과를 찾는 사람
41. 빠른 진료 흐름을 좋아하는 사람
42. 차분한 원장 설명을 선호하는 사람
43. 직원 응대를 중요하게 보는 사람
44. 과잉진료 걱정이 있던 사람
45. 상담 전 긴장했던 사람
46. 병원 분위기에 예민한 사람
47. 치료 선택지를 비교하고 싶은 사람
48. 관리까지 신경 쓰는 사람
49. 깔끔한 동선을 좋아하는 사람
50. 다음 검진까지 생각하는 사람

[첫 문장 패턴 후보 50개]
1. 집 근처라 방문했어요.
2. 치과를 어디로 갈지 고민하다가 예약했습니다.
3. 후기 몇 개 찾아보고 서울디아치과를 알게 됐어요.
4. 후기 보고 예약했는데 생각보다 괜찮았습니다.
5. 처음 가는 치과라 조금 긴장했어요.
6. 임플란트 상담을 받아보려고 방문했습니다.
7. 라미네이트 때문에 계속 고민하다가 상담받았어요.
8. 디아네이트가 궁금해서 상담을 예약했습니다.
9. 치아가 불편해서 급하게 알아보다가 갔어요.
10. 충치치료를 미루다가 드디어 방문했습니다.
11. 스케일링 겸 검진받으려고 들렀어요.
12. 치과를 원래 무서워하는 편이라 걱정이 컸습니다.
13. 회사 근처라 퇴근 후 방문했어요.
14. 일요일 진료가 가능해서 예약했습니다.
15. 야간진료 되는 곳을 찾다가 방문했어요.
16. 부모님 임플란트 상담 때문에 같이 갔습니다.
17. 앞니 모양이 신경 쓰여 상담받아봤어요.
18. 근처에서 갈 만한 치과를 찾다가 알게 됐습니다.
19. 지인 추천으로 방문했어요.
20. 네이버에서 찾아보고 예약했습니다.
21. 설명을 잘해주는 곳을 찾다가 방문했어요.
22. 병원 분위기가 궁금해서 예약해봤습니다.
23. 오래 다닐 치과를 찾던 중 방문했어요.
24. 치아미백 상담을 받아보고 싶어서 갔습니다.
25. 갑자기 이가 시려서 방문했어요.
26. 검진만 받아보려고 갔는데 설명이 좋았습니다.
27. 치료 계획을 자세히 듣고 싶어서 예약했습니다.
28. 치과 가는 걸 계속 미루다가 방문했어요.
29. 이사 온 뒤 새로 다닐 치과를 찾고 있었습니다.
30. 가까운 곳 중 후기가 좋아 보여서 갔어요.
31. 상담이 부담스럽지 않은 곳을 찾고 있었습니다.
32. 처음이라 반신반의하면서 방문했어요.
33. 디지털 장비가 있다고 해서 궁금했습니다.
34. 빠르게 진료받을 수 있는 곳을 찾았어요.
35. 가족 치료 때문에 알아보다가 방문했습니다.
36. 앞니 치료가 필요해서 상담받았습니다.
37. 임플란트가 처음이라 걱정이 많았어요.
38. 무통 진료가 가능한지 궁금해서 문의했습니다.
39. 안아프게 치료받을 수 있을지 걱정됐어요.
40. 임플란트 상담을 받아보려고 검색하다가 알게 됐습니다.
41. 라미네이트 상담을 받아보고 싶어서 예약했어요.
42. 발산 근처 치과도 같이 보다가 방문했습니다.
43. 강서구 치과를 비교하다가 선택했어요.
44. 설명이 자세하다는 후기를 보고 갔습니다.
45. 대기 시간이 길까 봐 걱정했어요.
46. 상담을 먼저 받아보고 결정하려고 했습니다.
47. 치료 방향을 정확히 알고 싶어서 방문했어요.
48. 진료 전에 궁금한 게 많아서 예약했습니다.
49. 병원이 깔끔해 보여서 한 번 가봤어요.
50. 다음 검진까지 생각하고 방문했습니다.

[말투 후보 20종]
1. ~했어요.
2. ~했습니다.
3. ~이더라고요.
4. ~같았어요.
5. ~였습니다.
6. ~느꼈어요.
7. ~였네요.
8. ~받았어요.
9. ~받았습니다.
10. ~같네요.
11. ~인 것 같아요.
12. ~무난했어요.
13. ~생각보다 괜찮았어요.
14. ~편했어요.
15. ~마음이 놓였어요.
16. ~도움이 됐어요.
17. ~기억에 남네요.
18. ~추천드리고 싶어요.
19. ~부담 없었어요.
20. ~좋았습니다.

[마무리 문장 후보 50개]
1. 다음 검진도 여기서 받을 것 같아요.
2. 생각보다 만족스러웠습니다.
3. 편하게 치료받았습니다.
4. 다음에도 방문할 예정입니다.
5. 치과 고민이 많이 줄었어요.
6. 좋은 선택이었던 것 같습니다.
7. 부담이 덜했습니다.
8. 설명을 잘해주셔서 안심됐어요.
9. 재방문 의사 있습니다.
10. 주변에도 추천할 만하네요.
11. 처음 방문인데도 편했습니다.
12. 치료 전 걱정이 많이 줄었어요.
13. 차분한 분위기가 기억에 남습니다.
14. 궁금한 점을 물어보기 편했어요.
15. 전보다 치과에 대한 부담이 줄었습니다.
16. 상담받아보길 잘한 것 같아요.
17. 전체적으로 믿음이 갔습니다.
18. 설명이 자세해서 좋았습니다.
19. 진료 흐름이 깔끔했습니다.
20. 직원분들도 친절해서 편했어요.
21. 병원이 깔끔해서 좋았습니다.
22. 대기나 안내도 편했습니다.
23. 다음 치료도 부담 없이 받을 수 있을 것 같아요.
24. 처음부터 끝까지 편안했습니다.
25. 치료 방향을 이해하는 데 도움이 됐어요.
26. 걱정했던 것보다 괜찮았습니다.
27. 예약하고 방문하길 잘했다고 느꼈어요.
28. 치과 찾는 분들께 참고가 될 것 같습니다.
29. 관리 방법까지 안내받아 좋았습니다.
30. 상담 분위기가 부담스럽지 않았어요.
31. 과하게 권유하는 느낌이 없어 편했습니다.
32. 필요한 부분만 설명해주는 느낌이라 좋았어요.
33. 마곡 근처에서 치과 찾는 분들께 괜찮을 것 같습니다.
34. 계속 다녀도 괜찮겠다는 생각이 들었습니다.
35. 치료 전에 마음이 놓였습니다.
36. 예상보다 편안한 방문이었습니다.
37. 설명 듣고 나니 결정하기 쉬웠어요.
38. 다음 예약도 편하게 잡았습니다.
39. 가족에게도 알려주고 싶은 곳이었습니다.
40. 치과가 무섭던 느낌이 조금 줄었어요.
41. 진료 후 안내도 깔끔했습니다.
42. 상담이 자세해서 기억에 남습니다.
43. 편안한 분위기에서 진료받았습니다.
44. 처음 방문하는 분들도 부담 없을 것 같아요.
45. 전체적으로 좋은 경험이었습니다.
46. 재방문해도 괜찮겠다고 느꼈습니다.
47. 마곡역 근처라 방문하기도 편했어요.
48. 치료 과정이 잘 이해됐습니다.
49. 다음에도 필요한 진료가 있으면 방문할 것 같아요.
50. 만족스럽게 진료받고 왔습니다.

[금지/주의]
- 아래 표현을 반복하지 마세요: "전반적으로", "느껴졌습니다", "상담부터 진료까지", "친절했습니다", "만족스러웠습니다"
- 같은 문장 구조를 반복하지 마세요.
- 키워드를 억지로 나열하지 마세요.
- 너무 블로그 광고처럼 쓰지 마세요.
- 너무 딱딱한 문어체만 쓰지 마세요.
- 통증 표현은 환자 개인의 느낌처럼 쓰고, 병원이 보장하는 표현처럼 쓰지 마세요.
- 모든 리뷰가 공손하고 정돈된 문어체처럼 보이면 안 됩니다. 실제 사람이 쓴 것처럼 짧은 문장, 감탄, 담백한 표현, 생활감 있는 표현을 섞어주세요.

[출력 규칙]
- 출력은 리뷰 문장만 작성합니다.
- 따옴표, 번호, 제목 없이 작성합니다.
- 이번 리뷰의 길이 타입은 "${forcedLength.name}"입니다.
- 문장 수는 ${forcedLength.sentenceRule}로 작성합니다.
- 전체 길이는 ${forcedLength.charRule} 정도로 작성합니다.
- ${forcedLength.keywordRule}
- "좋았음", "괜찮았어요", "편하게 받고 왔어요"처럼 실제 네이버 리뷰에 가까운 짧은 표현도 자연스럽게 사용할 수 있습니다.
- 너무 설명이 많은 블로그형 문장보다, 실제 환자가 남긴 리뷰처럼 자연스럽게 작성하세요.
- 선택한 치료와 장점이 자연스럽게 생활감 있는 표현드러나야 합니다.
`;
return {
  input,
  debug: {
    personaNumber: forcedPersonaNumber,
    reactionStyle: forcedReaction.name,
    lengthProfile: forcedLength.name,
    sentenceRule: forcedLength.sentenceRule,
    charRule: forcedLength.charRule,
  },
};
}

function returnSoftFallback(res: any, reason: string) {
  return res.status(200).json({
    review: getRandomFallback(),
    fallback: true,
    reason,
  });
}

export default async function handler(req: any, res: any) {
  let clientIp = "unknown";

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({
        error: "허용되지 않은 요청입니다.",
      });
    }

    clientIp = getClientIp(req);

    const globalTraffic = checkGlobalTraffic();

    if (!globalTraffic.safeToCallOpenAI || isGlobalFallbackMode()) {
      return returnSoftFallback(res, globalTraffic.reason || "global_fallback_mode");
    }

    const ipBurstLimit = checkFixedWindow(
      ipBurstStore,
      clientIp,
      IP_BURST_WINDOW_MS,
      MAX_IP_REQUESTS_PER_MINUTE
    );

    if (!ipBurstLimit.allowed) {
      return returnSoftFallback(res, "ip_burst_fallback");
    }

    if (getDailyOpenAiCount(clientIp) >= MAX_OPENAI_CALLS_PER_IP_PER_DAY) {
      return returnSoftFallback(res, "ip_daily_openai_limit");
    }

    const body: ReviewRequestBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const treatments = toStringArray(body.treatments);
    const satisfactions = toStringArray(body.satisfactions);
    const conveniences = toStringArray(body.conveniences);
    const emotions = toStringArray(body.emotions);

    if (isSelectionTooLarge(treatments, satisfactions, conveniences, emotions)) {
      return res.status(400).json({
        error: "선택 항목이 너무 많습니다.",
      });
    }

    const visit = toSafeString(body.visit, "처음 방문");
    const style = toSafeString(body.style, "자세하게");
    const tone = toSafeString(body.tone, "자세하게");

    if (!process.env.OPENAI_API_KEY) {
      return returnSoftFallback(res, "missing_api_key");
    }

    const { input, debug } = buildReviewPrompt({
      visit,
      style,
      tone,
      treatments,
      satisfactions,
      conveniences,
      emotions,
    });

    incrementDailyOpenAiCount(clientIp);

    const response = await client.responses.create({
      model: MODEL,
      reasoning: {
        effort: "low",
      },
      instructions:
        "당신은 치과 방문 후기를 자연스럽게 정리하는 리뷰 초안 작성 도우미입니다. 실제 환자가 직접 쓴 것처럼 말투와 길이를 매번 다르게 만들고, 키워드는 문맥 안에 자연스럽게 녹여주세요. 통증 표현은 환자의 주관적 경험으로 자연스럽게 쓸 수 있습니다.",
      input,
      max_output_tokens: 560,
    });

    const review = cleanReview(response.output_text || "");

    if (!review) {
      return returnSoftFallback(res, "empty_review");
    }

    return res.status(200).json({
      review,
      source: "openai",
      debug,
    });
  } catch (error) {
    console.error("Review generation error:", error);

    return returnSoftFallback(res, "api_error");
  }
}
