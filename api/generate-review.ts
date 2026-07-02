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

// Vercel 환경변수 OPENAI_MODEL을 따로 만들면 모델만 쉽게 바꿀 수 있습니다.
// 기본값은 mini 모델입니다.
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_REQUESTS_PER_WINDOW = 5; // 같은 IP 기준 10분에 5회

const MAX_TOTAL_SELECTIONS = 18;
const MAX_TEXT_LENGTH = 80;

const fallbackReviews = [
  "마곡역 근처에서 임플란트 상담을 알아보다가 서울디아치과에 방문했습니다. 상담부터 진료 안내까지 차분하게 진행되어 처음 방문했는데도 편하게 느껴졌습니다.",
  "처음에는 치과 진료가 조금 걱정됐지만 설명을 자세히 들을 수 있어서 좋았습니다. 병원 분위기도 깔끔하고 안내가 친절해서 전반적으로 만족스러운 방문이었습니다.",
  "마곡 치과를 찾다가 방문했는데 상담 과정이 차분하고 이해하기 쉬웠습니다. 필요한 부분을 단계별로 설명해주셔서 진료 방향을 결정하는 데 도움이 됐습니다.",
];

const defaultAllowedOrigins = [
  "https://seouldia-review.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const rateLimitStore = new Map<string, RateLimitEntry>();

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

  // 같은 도메인 직접 호출 또는 일부 서버 환경에서는 origin이 없을 수 있습니다.
  if (!origin) return true;

  return getAllowedOrigins().includes(origin);
}

function getClientIp(req: any) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp.trim();
  }

  return "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  rateLimitStore.set(ip, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
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

export default async function handler(req: any, res: any) {
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

    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));

      return res.status(429).json({
        error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        review: getRandomFallback(),
        fallback: true,
        reason: "missing_api_key",
      });
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

    const keywordCandidates = [
      "서울디아치과",
      "마곡역 치과",
      "마곡 치과",
      ...treatments,
      ...satisfactions,
      ...conveniences,
      ...emotions,
    ]
      .filter(Boolean)
      .slice(0, 16);

    const input = `
서울디아치과를 방문한 환자가 직접 남기는 느낌의 리뷰 초안을 작성해주세요.

[작성 목표]
- 실제 환자 후기처럼 자연스럽게 작성합니다.
- 선택한 치료명과 장점 키워드를 최대한 자연스럽게 포함합니다.
- 검색과 AI 노출에 도움이 되도록 "마곡역 치과", "마곡 치과", "서울디아치과" 같은 표현을 문맥상 어색하지 않게 활용합니다.
- 키워드를 나열하지 말고 경험담 안에 녹여서 작성합니다.
- 환자가 그대로 쓰거나 조금 수정해서 사용할 수 있는 리뷰 초안으로 작성합니다.

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

[문체]
${tone || style}

[자연스럽게 포함할 키워드 후보]
${keywordCandidates.join(", ")}

[작성 규칙]
- 한국어로 작성
- 최소 2문장 이상, 최대 4문장 이내
- 전체 길이는 220자 이상 420자 이하
- 선택한 치료명은 가능하면 1회 이상 포함
- 선택한 좋았던 점, 편의사항, 걱정 포인트 중 최소 3개 이상 반영
- "마곡역 치과" 또는 "마곡 치과" 중 하나는 자연스럽게 1회 포함
- "서울디아치과"는 자연스럽게 1회 포함
- 환자가 직접 경험한 것처럼 자연스럽게 작성
- 너무 광고 문구처럼 보이지 않게 작성
- 과장된 감정 표현은 가능하지만 부자연스러운 홍보 문구처럼 만들지 말 것
- "100% 보장", "완치 보장", "무조건"처럼 너무 단정적인 표현은 피할 것
- 따옴표 없이 리뷰 문장만 출력

[문체별 방향]
- 담백하게: 차분하고 신뢰감 있는 후기. 과장 없이 정돈된 느낌.
- 자세하게: 치료명, 지역명, 상담, 설명, 분위기, 대기, 걱정 포인트를 더 많이 녹인 후기. SEO와 AI 검색 노출을 조금 더 의식한 문장.
`;

    const response = await client.responses.create({
      model: MODEL,
      reasoning: {
        effort: "low",
      },
      instructions:
        "당신은 치과 방문 후기를 자연스럽게 정리하는 리뷰 초안 작성 도우미입니다. 환자가 직접 쓴 것처럼 구체적이고 자연스럽게 작성하되, 키워드는 문맥 안에 부드럽게 녹여주세요.",
      input,
      max_output_tokens: 420,
    });

    const review = cleanReview(response.output_text || "");

    if (!review) {
      return res.status(200).json({
        review: getRandomFallback(),
        fallback: true,
        reason: "empty_review",
      });
    }

    return res.status(200).json({
      review,
      source: "openai",
    });
  } catch (error) {
    console.error("Review generation error:", error);

    return res.status(200).json({
      review: getRandomFallback(),
      fallback: true,
      reason: "api_error",
    });
  }
}
