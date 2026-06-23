import { useState } from "react";

const TREATMENTS = [
  "임플란트",
  "DIAnate 라미네이트",
  "Wedding Glow",
  "투명교정",
  "원데이 인레이",
  "치아미백",
  "턱관절 치료",
  "일반진료",
];

const SATISFACTIONS = [
  "설명이 자세했어요",
  "통증이 적었어요",
  "친절했어요",
  "시설이 깨끗했어요",
  "결과가 만족스러워요",
  "대기시간이 짧아요",
];

const VISIT_TYPES = ["첫 방문", "재방문"];
const REVIEW_STYLES = ["짧게", "자연스럽게", "자세하게"];

// ─── 하단 고정 버튼 설정 ──────────────────────────────
// 실제 URL / 전화번호로 변경해주세요
const BOTTOM_BUTTONS = [
  {
    label: "네이버\n리뷰",
    bg: "#03C75A",
    text: "N",
    url: "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC",
  },
  {
    label: "구글\n리뷰",
    bg: "#4285F4",
    text: "G",
    url: "https://www.google.com/maps/search/%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC",
  },
  {
    label: "전화\n하기",
    bg: "#0F2356",
    text: "📞",
    url: "tel:02-000-0000",
  },
  {
    label: "길\n찾기",
    bg: "#FF6B35",
    text: "📍",
    url: "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC",
  },
];

// ─── 색상 상수 ─────────────────────────────────────────
const NAVY = "#0F2356";
const NAVY_LIGHT = "#1a3a7c";
const SKY = "#4A90D9";
const LIGHT_BLUE = "#EBF4FF";
const MID_BLUE = "#B8D4F8";

export default function App() {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [selectedSatisfactions, setSelectedSatisfactions] = useState<string[]>([]);
  const [visitType, setVisitType] = useState<string>("");
  const [reviewStyle, setReviewStyle] = useState<string>("자연스럽게");
  const [generatedReview, setGeneratedReview] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const toggleTreatment = (t: string) =>
    setSelectedTreatments((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const toggleSatisfaction = (s: string) =>
    setSelectedSatisfactions((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const generateReview = async () => {
    if (selectedTreatments.length === 0) {
      setError("치료 항목을 하나 이상 선택해주세요.");
      return;
    }
    setError("");
    setIsLoading(true);
    setGeneratedReview("");

    const lengthGuide =
      reviewStyle === "짧게"
        ? "80~100자"
        : reviewStyle === "자연스럽게"
        ? "100~130자"
        : "130~180자";

    const prompt = `서울디아치과 환자 리뷰를 작성해줘.

조건:
- 병원명: 서울디아치과
- 치료 항목: ${selectedTreatments.join(", ")}
- 만족한 점: ${
      selectedSatisfactions.length > 0
        ? selectedSatisfactions.join(", ")
        : "전반적으로 만족"
    }
- 방문 유형: ${visitType || "병원 방문"}
- 목표 글자 수: ${lengthGuide}
- 문체: ${
      reviewStyle === "짧게"
        ? "간결하고 핵심만 담아서"
        : reviewStyle === "자연스럽게"
        ? "자연스럽고 솔직한 말투로"
        : "경험을 구체적으로 상세히"
    }

반드시 지켜야 할 규칙:
1. 다음 단어·표현은 절대 사용 금지: 최고, 최선, 유일, 보장, 완치, 무통, 반드시, 확실히, 놀라운, 기적, 완벽, 탁월한, 압도적인, 특효, 획기적
2. 의료광고법에 위반되는 과장·비교·치료 효과 단정 표현 금지
3. 한국어로만 작성
4. 리뷰 텍스트만 출력 (따옴표, 설명, 머릿말 없이 바로 본문만)
5. 실제 환자가 직접 쓴 것처럼 자연스럽게`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text =
        data.content?.map((i: { type: string; text?: string }) => i.text ?? "").join("") ?? "";
      setGeneratedReview(text.trim());
    } catch {
      setGeneratedReview("리뷰 생성 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyReview = async () => {
    if (!generatedReview) return;
    await navigator.clipboard.writeText(generatedReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        fontFamily:
          "'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
        backgroundColor: "#F4F8FD",
        minHeight: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        paddingBottom: 88,
        position: "relative",
      }}
    >
      {/* ─── 헤더 ───────────────────────────────────── */}
      <header
        style={{
          background: NAVY,
          padding: "18px 20px 14px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              background: SKY,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
              fontWeight: 800,
              color: "white",
              letterSpacing: -1,
            }}
          >
            D
          </div>
          <div>
            <div
              style={{
                color: "white",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              서울디아치과
            </div>
            <div style={{ color: MID_BLUE, fontSize: 11, marginTop: 1 }}>
              AI 리뷰 작성 도우미
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.12)",
              padding: "4px 10px",
              borderRadius: 20,
              color: "white",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            ✨ AI 생성
          </div>
        </div>
      </header>

      {/* ─── 본문 ───────────────────────────────────── */}
      <main style={{ padding: "14px 14px 0" }}>
        {/* 안내 배너 */}
        <div
          style={{
            background: LIGHT_BLUE,
            border: `1px solid ${MID_BLUE}`,
            borderRadius: 12,
            padding: "11px 14px",
            marginBottom: 12,
            fontSize: 12.5,
            color: NAVY_LIGHT,
            lineHeight: 1.6,
          }}
        >
          🦷 치료 항목과 만족한 점을 선택하면, AI가 자연스러운 리뷰를 만들어
          드려요.
        </div>

        {/* 치료 항목 */}
        <Section title="치료 항목" subtitle="해당하는 치료를 모두 선택해주세요">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {TREATMENTS.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={selectedTreatments.includes(t)}
                onClick={() => toggleTreatment(t)}
              />
            ))}
          </div>
        </Section>

        {/* 만족한 점 */}
        <Section title="만족했던 점" subtitle="해당하는 항목을 모두 선택해주세요">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {SATISFACTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={selectedSatisfactions.includes(s)}
                onClick={() => toggleSatisfaction(s)}
              />
            ))}
          </div>
        </Section>

        {/* 방문 유형 */}
        <Section title="방문 유형">
          <div style={{ display: "flex", gap: 9 }}>
            {VISIT_TYPES.map((v) => (
              <SelectButton
                key={v}
                label={v}
                selected={visitType === v}
                onClick={() => setVisitType(v === visitType ? "" : v)}
              />
            ))}
          </div>
        </Section>

        {/* 리뷰 스타일 */}
        <Section title="리뷰 스타일">
          <div style={{ display: "flex", gap: 9 }}>
            {REVIEW_STYLES.map((s) => (
              <SelectButton
                key={s}
                label={s}
                selected={reviewStyle === s}
                onClick={() => setReviewStyle(s)}
              />
            ))}
          </div>
        </Section>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              background: "#FFF0F0",
              border: "1px solid #FFB8B8",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 12,
              color: "#CC3333",
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* 생성 버튼 */}
        <button
          onClick={generateReview}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "15px 0",
            background: isLoading
              ? "#9ABDE8"
              : `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 15.5,
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginBottom: 14,
            letterSpacing: -0.3,
            transition: "all 0.2s",
          }}
        >
          {isLoading ? "✨  리뷰 작성 중..." : "✨  AI 리뷰 생성하기"}
        </button>

        {/* 생성된 리뷰 */}
        {(generatedReview || isLoading) && (
          <div
            style={{
              background: "white",
              border: `1.5px solid ${MID_BLUE}`,
              borderRadius: 16,
              padding: "18px 16px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span style={{ color: NAVY, fontWeight: 700, fontSize: 13.5 }}>
                📝 생성된 리뷰
              </span>
              {generatedReview && !isLoading && (
                <button
                  onClick={copyReview}
                  style={{
                    padding: "6px 14px",
                    background: copied ? "#22C55E" : SKY,
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {copied ? "✓ 복사됨" : "복사하기"}
                </button>
              )}
            </div>

            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#888",
                  fontSize: 13.5,
                }}
              >
                <LoadingDots />
                리뷰를 작성하고 있어요...
              </div>
            ) : (
              <p
                style={{
                  color: "#2C3E50",
                  fontSize: 14.5,
                  lineHeight: 1.8,
                  margin: 0,
                  wordBreak: "keep-all",
                }}
              >
                {generatedReview}
              </p>
            )}

            {generatedReview && !isLoading && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px solid #EEF4FB",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11.5, color: "#AAB" }}>
                  {generatedReview.replace(/\s/g, "").length}자
                </span>
                <button
                  onClick={generateReview}
                  style={{
                    background: "none",
                    border: `1px solid ${MID_BLUE}`,
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontSize: 12,
                    color: NAVY_LIGHT,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  🔄 다시 생성
                </button>
              </div>
            )}
          </div>
        )}

        {/* 저작권 안내 */}
        <p
          style={{
            fontSize: 11,
            color: "#AAB",
            textAlign: "center",
            lineHeight: 1.6,
            padding: "4px 0 8px",
          }}
        >
          ※ 생성된 리뷰는 참고용이며 실제 경험에 맞게 수정 후 사용해주세요.
        </p>
      </main>

      {/* ─── 하단 고정 버튼 ─────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: "white",
          borderTop: `1px solid ${MID_BLUE}`,
          padding: "10px 12px 16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 8,
          boxShadow: "0 -4px 20px rgba(15,35,86,0.09)",
          zIndex: 200,
        }}
      >
        {BOTTOM_BUTTONS.map((btn) => (
          <a
            key={btn.label}
            href={btn.url}
            target={btn.url.startsWith("tel") ? "_self" : "_blank"}
            rel="noopener noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "7px 4px",
              background: "#F4F8FD",
              borderRadius: 11,
              textDecoration: "none",
              gap: 5,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: btn.bg,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              {btn.text}
            </div>
            <span
              style={{
                color: "#333",
                fontSize: 10,
                fontWeight: 500,
                textAlign: "center",
                lineHeight: 1.35,
                whiteSpace: "pre-line",
              }}
            >
              {btn.label}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}

// ─── 하위 컴포넌트 ───────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "14px 14px 16px",
        marginBottom: 11,
        boxShadow: "0 1px 6px rgba(15,35,86,0.06)",
      }}
    >
      <div style={{ marginBottom: 11 }}>
        <p
          style={{
            color: NAVY,
            fontSize: 14.5,
            fontWeight: 700,
            margin: 0,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p style={{ color: "#8899AA", fontSize: 11.5, margin: "2px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 13px",
        border: `1.5px solid ${selected ? SKY : "#D0DFF0"}`,
        borderRadius: 20,
        background: selected ? LIGHT_BLUE : "#FAFCFF",
        color: selected ? NAVY : "#667",
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        letterSpacing: -0.2,
      }}
    >
      {selected ? "✓ " : ""}
      {label}
    </button>
  );
}

function SelectButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "11px 8px",
        border: `2px solid ${selected ? SKY : "#D0DFF0"}`,
        borderRadius: 12,
        background: selected ? LIGHT_BLUE : "#FAFCFF",
        color: selected ? NAVY : "#667",
        fontWeight: selected ? 700 : 400,
        fontSize: 13.5,
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: -0.2,
      }}
    >
      {selected ? "✓ " : ""}
      {label}
    </button>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            background: "#9ABDE8",
            borderRadius: "50%",
            animation: `_dia_bounce 0.9s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes _dia_bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </span>
  );
}
