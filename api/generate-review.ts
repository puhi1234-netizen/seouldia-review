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

const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_REQUESTS_PER_WINDOW = 5; // 같은 IP 기준 10분에 5회

const MAX_TOTAL_SELECTIONS = 18;
const MAX_TEXT_LENGTH = 60;

const fallbackReviews = [
  "진료 과정에서 설명을 차분히 들을 수 있어서 안심하고 치료받을 수 있었습니다.",
  "처음에는 걱정이 있었지만 필요한 부분을 잘 설명해주셔서 편하게 진료받았습니다.",
  "병원 분위기가 깔끔하고 안내가 친절해서 부담 없이 진료를 받을 수 있었습니다.",
  "필요한 부분을 자세히 안내받을 수 있어서 진료 전 걱정을 덜 수 있었습니다.",
];

const blockedExpressions = [
  "최고",
  "유일",
  "완벽",
  "100%",
  "보장",
  "무조건",
  "완치",
  "통증 없음",
  "통증이 하나도",
  "전혀 아프지",
  "다른 병원보다",
  "무통",
];

const defaultAllowedOrigins = [
  "https://seouldia-review.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const rateLimitStore = new Map<string, RateLimitEntry>();

function getAllowedOrigins() {
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];

  return [...defaultAllowedOrigins, ...envOrigins];
}

function isAllowedOrigin(req: any) {
  const origin = req.headers.origin as string | undefined;

  // 같은 도메인에서 직접 호출되거나 일부 서버 환경에서는 origin이 없을 수 있음
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

function hasBlockedExpression(text: string) {
  return blockedExpressions.some((expression) => text.includes(expression));
}

function isSelectionTooLarge(
  treatments: string[],
  satisfactions: string[],
  conveniences: string[],
  emotions: string[]
) {
  return treatments.length + satisfactions.length + conveniences.length + emotions.length > MAX_TOTAL_SELECTIONS;
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
    const style = toSafeString(body.style, "자연스럽게");
    const tone = toSafeString(body.tone, "담백하게");

    const input = `
서울디아치과를 이용한 환자가 직접 남길 수 있는 리뷰 초안을 작성해주세요.

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

[문장 스타일]
${style}

[문장 톤]
${tone}

작성 규칙:
- 한국어로 작성
- 실제 환자가 직접 쓴 것처럼 자연스럽게 작성
- 1문장 또는 2문장 이내
- 너무 광고처럼 보이지 않게 작성
- 병원이 대신 써준 느낌이 나지 않게 작성
- 선택한 내용을 바탕으로 쓰되, 사실에 없는 치료 결과를 추가하지 말 것
- 치료 효과를 단정하지 말 것
- 통증 없음, 완치, 보장, 최고, 유일, 100%, 무조건 추천 같은 과장 표현 금지
- 다른 병원과 비교하는 표현 금지
- 의료진의 전문성은 과장하지 말고 부드럽게 표현
- 환자가 자유롭게 수정해서 사용할 수 있는 초안처럼 작성
- 병원명은 필요할 때만 자연스럽게 1회 이하로 사용
- 따옴표 없이 리뷰 문장만 출력
`;

    const response = await client.responses.create({
      model: MODEL,
      reasoning: {
        effort: "low",
      },
      instructions:
        "당신은 치과 리뷰 초안을 자연스럽고 안전하게 다듬는 도우미입니다. 의료광고처럼 보이는 과장 표현은 피하고, 환자의 실제 경험을 담백하게 정리합니다.",
      input,
      max_output_tokens: 220,
    });

    const review = cleanReview(response.output_text || "");

    if (!review || hasBlockedExpression(review)) {
      return res.status(200).json({
        review: getRandomFallback(),
        fallback: true,
        reason: "blocked_or_empty_review",
      });
    }

    return res.status(200).json({
      review,
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