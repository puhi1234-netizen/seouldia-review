import { useState } from "react";

// ─── 데이터 ────────────────────────────────────────────
const TREATMENTS = [
  { id: "임플란트",        icon: "🦷", label: "임플란트" },
  { id: "DIAnate 라미네이트", icon: "✨", label: "DIAnate\n라미네이트" },
  { id: "Wedding Glow",  icon: "💍", label: "Wedding\nGlow" },
  { id: "투명교정",        icon: "😁", label: "투명교정" },
  { id: "원데이 인레이",   icon: "⚡", label: "원데이\n인레이" },
  { id: "치아미백",        icon: "🌟", label: "치아미백" },
  { id: "턱관절 치료",     icon: "💆", label: "턱관절\n치료" },
  { id: "일반진료",        icon: "🏥", label: "일반진료" },
];

const SATISFACTIONS = [
  { id: "설명이 자세했어요", icon: "💬", label: "자세한 설명" },
  { id: "통증이 적었어요",   icon: "🤗", label: "통증 배려" },
  { id: "친절했어요",        icon: "✅", label: "친절함" },
  { id: "시설이 깨끗했어요", icon: "🧹", label: "청결·위생" },
  { id: "결과가 만족스러워요",icon: "💰", label: "결과 만족" },
  { id: "대기시간이 짧아요", icon: "😊", label: "빠른 진료" },
];

const VISIT_TYPES = [
  { id: "처음 방문", sub: "첫 진료·상담" },
  { id: "재방문",   sub: "다시 방문" },
];

const WRITE_MODES = [
  { id: "AI",   label: "AI 문구 생성",  sub: "선택값 기반 자동 작성" },
  { id: "SELF", label: "직접 입력",      sub: "내가 직접 작성" },
];

const REVIEW_STYLES = [
  { id: "짧게",       label: "짧게" },
  { id: "자연스럽게", label: "자연스럽게" },
  { id: "자세하게",   label: "자세하게" },
];

// ─── 색상 ──────────────────────────────────────────────
const NAVY   = "#0D2461";
const BLUE   = "#2563EB";
const LBLUE  = "#EFF6FF";
const BORDER = "#E2E8F0";
const GOLD   = "#F59E0B";

// ─── 하단 버튼 (URL/전화번호 수정) ────────────────────
const NAV_BUTTONS = [
  { label: "네이버\n리뷰", bg: "#03C75A", icon: "N",  url: "https://m.place.naver.com/hospital/1834256204/review/visitor?bk_query=%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90&entry=pll" },
  { label: "구글\n리뷰",   bg: "#4285F4", icon: "G",  url: "https://www.google.com/search?client=ms-android-samsung-ss&hs=047p&sca_esv=8d74949394e43b3b&sxsrf=APpeQnvnSUe_bVf3HIkRTUim3ZQGEz_AJg:1782212255763&q=%5B+%EB%A7%88%EA%B3%A1+l+%EB%B0%9C%EC%82%B0+%5D+%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90+%EA%B0%95%EC%84%9C%EA%B5%AC+%EB%A6%AC%EB%B7%B0&uds=AJ5uw1_qit-Q5ymRbxuR6EvNnFNi6d-Q4BT1tabh5L0Z-La-vamN-DnRW2Rpz5JKhBoZcwJijzVC7pbh--cn3EK5hWKgjp1lcGboMSkUMkAMLB05GKSzjOGQYnINBof0WD-oTP1C1C7Jm8OelSyvabGWoTsosnkF3bFNyrbEikUhCL0qtl1c8zQ7eUVGlEtKv4CGc1bNdaXtnIRgXUVch0JdX16SYgiDGXlmQ823j80Djtabs_ZH3aRDCFy4qeqYe5ifjqhl1X0GZpr_hOIvSC3Q4VA3-gJjDU357YuVaynb_7h4-UrKqa8B4PPLG05ggEI5Z1UwT52n8g72cCjPh50kE6SAJJwr9_jBHa04QTnHhyWo1lYGMy2Pq-7B9h1bK1zItbvpkz6Hj00tHwR4-rsvzGLX_N7E62-5S--NLjyjqa7ULJ7XOE6nBmoVtd87TRry3MWOkqo1TJn5b23TSh2QpGTC1uK2eC8gEhSHa3hrbuvLHoNSuT9flfWKhVy4ZsfQnpJHkDLqQDgoZLF7cxnIeGcI956o2zfYPkVKVnAzFSc-x4iEIjCwPlbLpsWMAjQrTsmliV4rRZD7vfwP_5D0d5t0mu2pkLp2nmaVo0b6AMFOVuAU8mkOeu8afCOVICncZcipS9ZGyHIZzO7dulQ269kziVtmShqcWr7bs54kIkxzgaE89zE&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_61b8s-s8YyCT7p8__3ow9OveM-Zx1bgynRcTASfORz1hSSJqlRK785BteRzoRaZDdNwnVpiK6OivtbKuQa1Y2RuhjtlEJbdtcYJ_5QWbX8hjjyQdJauejzmL0lOYzUJs6F1u4sHbvIlrD1qY2Cfg_vhWogj&sa=X&sqi=2&ved=2ahUKEwjo5KuDmp2VAxWoW-sIHZqKLmEQk8gLegQIHhAB&ictx=1&biw=435&bih=869&dpr=2.48#ebo=1" },
  { label: "전화\n하기",   bg: NAVY,      icon: "📞", url: "tel:02-2039-2872" },
  { label: "길\n찾기",     bg: "#FF6B35", icon: "📍", url: "https://m.place.naver.com/hospital/1834256204/home?entry=pll&bk_query=%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90" },
];

// ─── 섹션 번호 배지 ────────────────────────────────────
function NumBadge({ n }: { n: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 22, height: 22, borderRadius: "50%",
      background: BLUE, color: "white",
      fontSize: 11, fontWeight: 700, marginRight: 6, flexShrink: 0,
    }}>
      {n}
    </span>
  );
}

// ─── 섹션 래퍼 ────────────────────────────────────────
function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10, paddingLeft: 2 }}>
        <NumBadge n={n} />
        <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, letterSpacing: -0.2 }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────
export default function App() {
  const [writeMode, setWriteMode] = useState<"AI" | "SELF">("AI");
  const [visitType, setVisitType] = useState<string>("처음 방문");
  const [reviewStyle, setReviewStyle] = useState<string>("자연스럽게");
  const [treatments, setTreatments] = useState<string[]>([]);
  const [satisfactions, setSatisfactions] = useState<string[]>([]);
  const [selfText, setSelfText] = useState<string>("");
  const [review, setReview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const toggleArr = (arr: string[], set: React.Dispatch<React.SetStateAction<string[]>>, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const generateReview = async () => {
    if (writeMode === "AI" && treatments.length === 0) {
      setErr("치료 항목을 하나 이상 선택해주세요."); return;
    }
    setErr(""); setLoading(true); setReview("");

    const lenMap: Record<string, string> = { "짧게": "80~100자", "자연스럽게": "100~130자", "자세하게": "130~180자" };
    const styleMap: Record<string, string> = { "짧게": "간결하게", "자연스럽게": "자연스럽고 솔직하게", "자세하게": "구체적으로 상세히" };

    const prompt = `서울디아치과 환자 리뷰를 작성해줘.

치료 항목: ${treatments.join(", ")}
만족한 점: ${satisfactions.length ? satisfactions.join(", ") : "전반적으로 만족"}
방문 유형: ${visitType}
목표 글자 수: ${lenMap[reviewStyle]}
문체: ${styleMap[reviewStyle]}

반드시 지켜야 할 규칙:
1. 절대 사용 금지: 최고, 유일, 보장, 완치, 무통, 반드시, 확실히, 놀라운, 기적, 완벽, 탁월한, 압도적인, 특효, 획기적
2. 의료광고법 위반 과장·비교 표현 금지
3. 한국어만, 리뷰 텍스트만 출력 (따옴표·머릿말 없이 바로 본문)`;

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
      const d = await res.json();
      setReview(d.content?.map((i: { type: string; text?: string }) => i.text ?? "").join("").trim() || "오류가 발생했어요.");
    } catch {
      setReview("오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    const text = writeMode === "SELF" ? selfText : review;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const displayText = writeMode === "SELF" ? selfText : review;

  return (
    <div style={{
      fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
      background: "#F8FAFC",
      minHeight: "100vh",
      maxWidth: 430,
      margin: "0 auto",
      paddingBottom: 100,
    }}>

      {/* ── 헤더 ── */}
      <div style={{
        background: "white",
        textAlign: "center",
        padding: "28px 20px 22px",
        borderBottom: `1px solid ${BORDER}`,
        position: "relative",
      }}>
        <div style={{
          width: 64, height: 64,
          background: LBLUE,
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, margin: "0 auto 12px",
        }}>
          🦷
        </div>
        <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.5 }}>
          서울디아치과
        </h1>
        <p style={{ color: "#64748B", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
          치료와 경험을 선택하면<br />
          리뷰 작성 문구를 만들어 드립니다
        </p>
      </div>

      {/* ── 본문 ── */}
      <div style={{ padding: "18px 14px 0" }}>

        {/* ① 작성방식 */}
        <Section n={1} title="작성방식">
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", margin: "0 0 10px" }}>
            리뷰를 어떻게 작성할까요?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {WRITE_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setWriteMode(m.id as "AI" | "SELF")}
                style={{
                  padding: "14px 10px",
                  border: `2px solid ${writeMode === m.id ? BLUE : BORDER}`,
                  borderRadius: 14,
                  background: writeMode === m.id ? LBLUE : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: writeMode === m.id ? BLUE : "#1E293B", marginBottom: 3 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{m.sub}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ② 방문유형 */}
        <Section n={2} title="방문유형">
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", margin: "0 0 10px" }}>
            이번 방문은 어떤 형태였나요?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {VISIT_TYPES.map(v => (
              <button
                key={v.id}
                onClick={() => setVisitType(v.id)}
                style={{
                  padding: "14px 10px",
                  border: `2px solid ${visitType === v.id ? BLUE : BORDER}`,
                  borderRadius: 14,
                  background: visitType === v.id ? LBLUE : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: visitType === v.id ? BLUE : "#1E293B", marginBottom: 3 }}>
                  {v.id}
                </div>
                <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{v.sub}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ③ 리뷰 스타일 (AI 모드일 때만) */}
        {writeMode === "AI" && (
          <Section n={3} title="리뷰 스타일">
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", margin: "0 0 10px" }}>
              어떤 스타일로 작성할까요?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
              {REVIEW_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setReviewStyle(s.id)}
                  style={{
                    padding: "12px 6px",
                    border: `2px solid ${reviewStyle === s.id ? BLUE : BORDER}`,
                    borderRadius: 14,
                    background: reviewStyle === s.id ? LBLUE : "white",
                    color: reviewStyle === s.id ? BLUE : "#1E293B",
                    fontSize: 13.5,
                    fontWeight: reviewStyle === s.id ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* ④ 치료선택 (AI 모드) */}
        {writeMode === "AI" && (
          <Section n={4} title="치료선택">
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", margin: "0 0 10px" }}>
              어떤 치료를 받으셨나요?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
              {TREATMENTS.map(t => {
                const on = treatments.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleArr(treatments, setTreatments, t.id)}
                    style={{
                      padding: "14px 6px 12px",
                      border: `2px solid ${on ? BLUE : BORDER}`,
                      borderRadius: 14,
                      background: on ? LBLUE : "white",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: on ? 700 : 500,
                      color: on ? BLUE : "#374151",
                      whiteSpace: "pre-line",
                      lineHeight: 1.3,
                      textAlign: "center",
                    }}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* ⑤ 경험선택 (AI 모드) */}
        {writeMode === "AI" && (
          <Section n={5} title="경험선택">
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}>
              어떤 점이 좋으셨나요?
            </p>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 10px" }}>
              하나만 선택해도 됩니다
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {SATISFACTIONS.map(s => {
                const on = satisfactions.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleArr(satisfactions, setSatisfactions, s.id)}
                    style={{
                      padding: "13px 12px",
                      border: `2px solid ${on ? BLUE : BORDER}`,
                      borderRadius: 14,
                      background: on ? LBLUE : "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.15s",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: on ? 700 : 500,
                      color: on ? BLUE : "#374151",
                    }}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* 에러 */}
        {err && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA",
            borderRadius: 12, padding: "10px 14px",
            color: "#DC2626", fontSize: 13, marginBottom: 12,
          }}>
            ⚠️ {err}
          </div>
        )}

        {/* AI 생성 버튼 */}
        {writeMode === "AI" && (
          <button
            onClick={generateReview}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 0",
              background: loading
                ? "#93C5FD"
                : `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
              color: "white",
              border: "none",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 14,
              letterSpacing: -0.3,
              boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Spinner /> 리뷰 작성 중...
              </span>
            ) : "✨  AI 리뷰 생성하기"}
          </button>
        )}

        {/* ── 리뷰 결과 / 직접입력 박스 ── */}
        {(writeMode === "SELF" || review || loading) && (
          <div style={{
            background: "white",
            borderRadius: 18,
            padding: "18px 16px",
            marginBottom: 14,
            border: `1px solid ${BORDER}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}>
            {/* 별점 */}
            <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ fontSize: 22, color: GOLD }}>★</span>
              ))}
            </div>

            {writeMode === "SELF" ? (
              <>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 8px" }}>
                  실제 방문 경험을 바탕으로 리뷰를 직접 입력해 주세요.
                </p>
                <textarea
                  value={selfText}
                  onChange={e => setSelfText(e.target.value)}
                  placeholder="방문 경험을 자유롭게 작성해주세요..."
                  style={{
                    width: "100%",
                    minHeight: 120,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: "11px 12px",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#1E293B",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {selfText && (
                  <div style={{ textAlign: "right", fontSize: 11.5, color: "#94A3B8", marginTop: 4 }}>
                    {selfText.replace(/\s/g, "").length}자
                  </div>
                )}
              </>
            ) : loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 14, minHeight: 80 }}>
                <Spinner /> 리뷰를 작성하고 있어요...
              </div>
            ) : review ? (
              <>
                <div style={{
                  background: "#F1F5F9",
                  borderRadius: 8,
                  padding: "6px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 10,
                }}>
                  <span style={{ fontSize: 11, color: BLUE, fontWeight: 600 }}>✨ AI 생성 문구</span>
                </div>
                <p style={{
                  color: "#1E293B", fontSize: 14.5, lineHeight: 1.85,
                  margin: 0, wordBreak: "keep-all",
                }}>
                  {review}
                </p>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: 12, paddingTop: 10, borderTop: `1px solid ${BORDER}`,
                }}>
                  <span style={{ fontSize: 11.5, color: "#94A3B8" }}>
                    {review.replace(/\s/g, "").length}자
                  </span>
                  <button
                    onClick={generateReview}
                    style={{
                      background: "none", border: `1px solid ${BORDER}`,
                      borderRadius: 8, padding: "5px 12px",
                      fontSize: 12, color: "#64748B",
                      cursor: "pointer", fontWeight: 500,
                    }}
                  >
                    🔄 다시 생성
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* 복사 버튼 */}
        {displayText && (
          <button
            onClick={copyText}
            style={{
              width: "100%",
              padding: "17px 0",
              background: copied
                ? "#16A34A"
                : `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
              color: "white",
              border: "none",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 10,
              letterSpacing: -0.3,
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              transition: "background 0.2s",
            }}
          >
            {copied ? "✓  복사되었습니다!" : "📋  문구 복사하기"}
          </button>
        )}

        {/* 안내 문구 */}
        <p style={{
          fontSize: 11.5, color: "#94A3B8",
          textAlign: "center", lineHeight: 1.6,
          padding: "4px 0 8px",
        }}>
          ※ 생성된 리뷰는 참고용이며 실제 경험에 맞게 수정 후 사용해주세요.
        </p>

      </div>

      {/* ── 하단 고정 네비 ── */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: "white",
        borderTop: `1px solid ${BORDER}`,
        padding: "10px 12px 18px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 8,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.07)",
        zIndex: 999,
      }}>
        {NAV_BUTTONS.map(b => (
          <a
            key={b.label}
            href={b.url}
            target={b.url.startsWith("tel") ? "_self" : "_blank"}
            rel="noopener noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "8px 4px",
              background: "#F8FAFC",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            <div style={{
              width: 36, height: 36,
              background: b.bg,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 15,
              fontWeight: 800,
            }}>
              {b.icon}
            </div>
            <span style={{
              color: "#374151",
              fontSize: 10.5,
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.3,
              whiteSpace: "pre-line",
            }}>
              {b.label}
            </span>
          </a>
        ))}
      </nav>

    </div>
  );
}

// ─── 로딩 스피너 ───────────────────────────────────────
function Spinner() {
  return (
    <>
      <span style={{
        display: "inline-block",
        width: 16, height: 16,
        border: "2.5px solid rgba(255,255,255,0.35)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "_spin 0.7s linear infinite",
        flexShrink: 0,
      }} />
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
