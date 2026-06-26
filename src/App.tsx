import { useState } from "react";

/* ── 전역 리셋 (모바일 overflow 방지) ───────────────── */
const GlobalStyle = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root {
      width: 100%; max-width: 100vw;
      overflow-x: hidden;
      background: #F8FAFC;
      -webkit-text-size-adjust: 100%;
    }
    button { font-family: inherit; -webkit-tap-highlight-color: transparent; }
    a      { font-family: inherit; -webkit-tap-highlight-color: transparent; }
    textarea, input { font-family: inherit; }
    @keyframes _spin { to { transform: rotate(360deg); } }
    @keyframes _pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  `}</style>
);

/* ── 데이터 ─────────────────────────────────────────── */
const TREATMENTS = [
  { id: "임플란트",           icon: "🦷", label: "임플란트" },
  { id: "DIAnate 라미네이트", icon: "✨", label: "DIAnate\n라미네이트" },
  { id: "Wedding Glow",      icon: "💍", label: "Wedding\nGlow" },
  { id: "투명교정",            icon: "😁", label: "투명교정" },
  { id: "원데이 인레이",       icon: "⚡", label: "원데이\n인레이" },
  { id: "치아미백",            icon: "🌟", label: "치아미백" },
  { id: "턱관절 치료",         icon: "💆", label: "턱관절\n치료" },
  { id: "일반진료",            icon: "🏥", label: "일반진료" },
];

const SATISFACTIONS = [
  { id: "설명이 자세했어요",   icon: "💬", label: "자세한 설명" },
  { id: "통증이 적었어요",     icon: "🤗", label: "통증 배려" },
  { id: "친절했어요",          icon: "✅", label: "친절함" },
  { id: "시설이 깨끗했어요",   icon: "🧹", label: "청결·위생" },
  { id: "결과가 만족스러워요", icon: "💰", label: "결과 만족" },
  { id: "대기시간이 짧아요",   icon: "😊", label: "빠른 진료" },
];

const TREATMENT_KEYWORDS: Record<string, string> = {
  "임플란트": "마곡 임플란트",
  "DIAnate 라미네이트": "마곡 라미네이트",
  "Wedding Glow": "마곡 치아미백",
  "투명교정": "마곡 투명교정",
  "원데이 인레이": "마곡 충치치료",
  "치아미백": "마곡 치아미백",
  "턱관절 치료": "마곡 턱관절",
  "일반진료": "마곡 치과",
};

const TREATMENT_PHRASES: Record<string, string[]> = {
  "임플란트": [
    "임플란트 상담부터 치료 과정까지 차분하게 안내받아 안심이 됐습니다",
    "임플란트 진료에 대해 궁금했던 부분을 자세히 설명해주셔서 부담이 줄었습니다",
    "마곡에서 임플란트 진료를 알아보다 방문했는데 설명이 꼼꼼해서 좋았습니다",
  ],
  "DIAnate 라미네이트": [
    "라미네이트 상담 때 제 치아 상태와 원하는 방향을 함께 봐주셔서 신뢰가 갔습니다",
    "앞니 심미치료에 대해 과하지 않게 설명해주셔서 편하게 상담받았습니다",
    "마곡 라미네이트 상담을 알아보다 방문했는데 설명이 차분하고 이해하기 쉬웠습니다",
  ],
  "Wedding Glow": [
    "치아미백과 심미 상담을 함께 받을 수 있어 준비 과정이 편했습니다",
    "중요한 일정을 앞두고 필요한 부분을 현실적으로 안내해주셔서 좋았습니다",
    "마곡 치아미백 상담을 알아보다 방문했는데 분위기도 편안하고 설명도 자세했습니다",
  ],
  "투명교정": [
    "투명교정 상담에서 치료 흐름과 예상 과정을 알기 쉽게 설명해주셔서 좋았습니다",
    "교정에 대해 궁금했던 점을 하나씩 확인해주셔서 상담이 편안했습니다",
    "마곡 투명교정을 알아보다 방문했는데 제 상황에 맞춰 차분히 설명해주셨습니다",
  ],
  "원데이 인레이": [
    "충치치료 과정과 보철 치료 방향을 자세히 설명해주셔서 이해하기 쉬웠습니다",
    "원데이 인레이 진료가 가능한 부분을 안내받아 시간을 효율적으로 쓸 수 있었습니다",
    "마곡 충치치료를 알아보다 방문했는데 설명이 꼼꼼하고 진료가 편안했습니다",
  ],
  "치아미백": [
    "치아미백 상담에서 주의사항과 진행 과정을 자세히 설명해주셔서 좋았습니다",
    "미백 진료 전에 궁금한 점을 잘 안내해주셔서 편하게 받을 수 있었습니다",
    "마곡 치아미백을 알아보다 방문했는데 직원분들도 친절하고 안내가 깔끔했습니다",
  ],
  "턱관절 치료": [
    "턱관절 불편감에 대해 자세히 들어주시고 관리 방향을 설명해주셔서 도움이 됐습니다",
    "턱관절 진료가 처음이라 걱정했는데 차분하게 안내해주셔서 안심이 됐습니다",
    "마곡 턱관절 진료를 알아보다 방문했는데 설명이 자세하고 분위기가 편안했습니다",
  ],
  "일반진료": [
    "마곡 치과를 찾다가 방문했는데 진료 전 설명이 자세해서 안심이 됐습니다",
    "전체적으로 안내가 친절하고 필요한 부분을 차분하게 설명해주셔서 좋았습니다",
    "치과 진료가 부담스러웠는데 직원분들과 원장님 모두 편안하게 응대해주셨습니다",
  ],
};

const SAT_PHRASES: Record<string, string[]> = {
  "설명이 자세했어요": ["원장님께서 치료 과정을 자세히 설명해주셔서 이해하기 쉬웠습니다", "궁금한 점을 차분히 알려주셔서 안심하고 진료받을 수 있었습니다"],
  "통증이 적었어요": ["생각보다 불편감이 크지 않도록 세심하게 봐주셔서 좋았습니다", "진료 중 불편하지 않은지 계속 살펴봐주셔서 편안했습니다"],
  "친절했어요": ["직원분들도 친절하게 안내해주셔서 방문 내내 편안했습니다", "접수부터 진료까지 응대가 친절해서 기분 좋게 다녀왔습니다"],
  "시설이 깨끗했어요": ["병원 내부가 깔끔하고 위생적으로 느껴져서 좋았습니다", "진료 공간이 깨끗하게 관리되는 느낌이라 안심이 됐습니다"],
  "결과가 만족스러워요": ["제 상황에 맞춰 진료 방향을 잡아주셔서 만족스러웠습니다", "진료 후 안내까지 꼼꼼해서 전체적으로 만족스러운 경험이었습니다"],
  "대기시간이 짧아요": ["예약 안내와 진료 진행이 비교적 깔끔해서 편했습니다", "전체적인 진행이 매끄러워서 바쁜 일정 중에도 부담이 적었습니다"],
};

function hashText(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = Math.imul(31, h) + text.charCodeAt(i) | 0;
  return Math.abs(h);
}
function pick<T>(arr: T[], seed: number): T { return arr[Math.abs(seed) % arr.length]; }
function cleanFeeling(text: string) {
  let t = text.trim().replace(/\s+/g, " ").replace(/[ㅋㅎㅠㅜ]+/g, "").slice(0, 120);
  t = t.replace(/안아팠/g, "불편감이 크지 않았").replace(/안 아팠/g, "불편감이 크지 않았").replace(/무통/g, "불편감이 적은 편").replace(/완벽/g, "만족스러운").replace(/최고/g, "좋은").replace(/확실히/g, "").replace(/100%/g, "");
  if (t && !/[.!?。]$/.test(t)) t += ".";
  return t;
}
function joinParts(parts: string[]) {
  return parts.filter(Boolean).map(p => /[.!?。]$/.test(p.trim()) ? p.trim() : p.trim() + ".").join(" ").replace(/\s+/g, " ").trim();
}
function trimByStyle(text: string, style: string) {
  const max = style === "짧게" ? 125 : style === "자세하게" ? 240 : 190;
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?。]+[.!?。]/g) || [];
  let out = "";
  for (const sent of sentences) if ((out + " " + sent).trim().length <= max) out = (out + " " + sent).trim();
  return out || text.slice(0, max).trim();
}
function createReview(treats: string[], sats: string[], visit: string, style: string, feeling: string) {
  const seed = hashText(`${treats.join(",")}-${sats.join(",")}-${visit}-${style}-${feeling}-${Date.now()}`);
  const main = treats[0] || "일반진료";
  const keyword = TREATMENT_KEYWORDS[main] || "마곡 치과";
  const openers = [
    `마곡역 근처 서울디아치과에서 ${main} 진료를 받고 왔습니다`,
    `${keyword}를 알아보다가 서울디아치과에 방문했습니다`,
    `마곡 치과를 찾다가 서울디아치과에서 ${main} 상담과 진료를 받았습니다`,
    `서울디아치과에서 ${main} 관련 진료를 받았는데 전반적으로 편안했습니다`,
  ];
  const visitPhrases: Record<string,string[]> = {
    "처음 방문": ["처음 방문이라 긴장했지만 안내가 차분해서 부담이 줄었습니다", "첫 방문이었는데 접수부터 상담까지 흐름이 깔끔했습니다"],
    "재방문": ["재방문했는데 이번에도 안내와 진료 과정이 안정적으로 느껴졌습니다", "이전 방문 때의 좋은 기억이 있어 다시 찾았고 이번에도 만족스러웠습니다"],
  };
  const closings = [
    "마곡역 근처에서 치과를 찾는 분들이라면 참고하기 좋은 곳이라고 느꼈습니다",
    "전체적으로 설명과 응대가 좋아서 다음 진료도 편하게 받을 수 있을 것 같습니다",
    "과하지 않은 안내와 편안한 분위기 덕분에 만족스러운 방문이었습니다",
  ];
  const parts: string[] = [pick(openers, seed), pick(visitPhrases[visit] || visitPhrases["처음 방문"], seed + 3), pick(TREATMENT_PHRASES[main] || TREATMENT_PHRASES["일반진료"], seed + 7)];
  const maxSat = style === "짧게" ? 1 : style === "자세하게" ? 3 : 2;
  sats.slice(0, maxSat).forEach((id, i) => parts.push(pick(SAT_PHRASES[id] || [], seed + 11 + i) || ""));
  const user = cleanFeeling(feeling);
  if (user) parts.push(pick([`개인적으로는 ${user}`, `직접 느낀 점은 ${user}`, user], seed + 20));
  if (style !== "짧게") parts.push(pick(closings, seed + 30));
  return trimByStyle(joinParts(parts), style);
}

/* ── 색상 ────────────────────────────────────────────── */
const NAVY   = "#0D2461";
const BLUE   = "#2563EB";
const LBLUE  = "#EFF6FF";
const BORDER = "#E2E8F0";
const GOLD   = "#F59E0B";
const BG     = "#F8FAFC";

/* ── 하단 버튼 — URL / 전화번호 수정 ────────────────── */
const NAV_BTNS = [
  { label: "네이버\n리뷰", bg: "#03C75A", icon: "N",  url: "https://m.place.naver.com/hospital/1834256204/review/visitor?bk_query=%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90&entry=pll" },
  { label: "구글\n리뷰",   bg: "#4285F4", icon: "G",  url: "https://www.google.com/search?client=ms-android-samsung-ss&hs=047p&sca_esv=8d74949394e43b3b&sxsrf=APpeQnvnSUe_bVf3HIkRTUim3ZQGEz_AJg:1782212255763&q=%5B+%EB%A7%88%EA%B3%A1+l+%EB%B0%9C%EC%82%B0+%5D+%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90+%EA%B0%95%EC%84%9C%EA%B5%AC+%EB%A6%AC%EB%B7%B0&uds=AJ5uw1_qit-Q5ymRbxuR6EvNnFNi6d-Q4BT1tabh5L0Z-La-vamN-DnRW2Rpz5JKhBoZcwJijzVC7pbh--cn3EK5hWKgjp1lcGboMSkUMkAMLB05GKSzjOGQYnINBof0WD-oTP1C1C7Jm8OelSyvabGWoTsosnkF3bFNyrbEikUhCL0qtl1c8zQ7eUVGlEtKv4CGc1bNdaXtnIRgXUVch0JdX16SYgiDGXlmQ823j80Djtabs_ZH3aRDCFy4qeqYe5ifjqhl1X0GZpr_hOIvSC3Q4VA3-gJjDU357YuVaynb_7h4-UrKqa8B4PPLG05ggEI5Z1UwT52n8g72cCjPh50kE6SAJJwr9_jBHa04QTnHhyWo1lYGMy2Pq-7B9h1bK1zItbvpkz6Hj00tHwR4-rsvzGLX_N7E62-5S--NLjyjqa7ULJ7XOE6nBmoVtd87TRry3MWOkqo1TJn5b23TSh2QpGTC1uK2eC8gEhSHa3hrbuvLHoNSuT9flfWKhVy4ZsfQnpJHkDLqQDgoZLF7cxnIeGcI956o2zfYPkVKVnAzFSc-x4iEIjCwPlbLpsWMAjQrTsmliV4rRZD7vfwP_5D0d5t0mu2pkLp2nmaVo0b6AMFOVuAU8mkOeu8afCOVICncZcipS9ZGyHIZzO7dulQ269kziVtmShqcWr7bs54kIkxzgaE89zE&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_61b8s-s8YyCT7p8__3ow9OveM-Zx1bgynRcTASfORz1hSSJqlRK785BteRzoRaZDdNwnVpiK6OivtbKuQa1Y2RuhjtlEJbdtcYJ_5QWbX8hjjyQdJauejzmL0lOYzUJs6F1u4sHbvIlrD1qY2Cfg_vhWogj&sa=X&sqi=2&ved=2ahUKEwjo5KuDmp2VAxWoW-sIHZqKLmEQk8gLegQIHhAB&ictx=1&biw=435&bih=869&dpr=2.48#ebo=1" },
  { label: "전화\n하기",   bg: NAVY,      icon: "📞", url: "tel:02-2039-2872" },
  { label: "길\n찾기",     bg: "#FF6B35", icon: "📍", url: "https://m.place.naver.com/hospital/1834256204/home?entry=pll&bk_query=%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90" },
];

/* ── 섹션 헤더 ───────────────────────────────────────── */
function SectionHeader({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
      <span style={{
        width: 24, height: 24, borderRadius: "50%",
        background: BLUE, color: "white",
        fontSize: 12, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: BLUE }}>{label}</span>
    </div>
  );
}

/* ── 카드 래퍼 ───────────────────────────────────────── */
function Card({ children, mb = 12 }: { children: React.ReactNode; mb?: number }) {
  return (
    <div style={{
      background: "white", borderRadius: 16,
      padding: "16px 14px", marginBottom: mb,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {children}
    </div>
  );
}

/* ── 2열 토글 버튼 ───────────────────────────────────── */
function Toggle2({ options, value, onChange }: {
  options: { id: string; label: string; sub?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {options.map(o => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            padding: "13px 10px",
            border: `2px solid ${on ? BLUE : BORDER}`,
            borderRadius: 12, background: on ? LBLUE : "white",
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            width: "100%",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: on ? BLUE : "#1E293B", marginBottom: o.sub ? 3 : 0 }}>
              {o.label}
            </div>
            {o.sub && <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────── */
export default function App() {
  const [mode, setMode]         = useState<"AI"|"SELF">("AI");
  const [visit, setVisit]       = useState("처음 방문");
  const [style, setStyle]       = useState("자연스럽게");
  const [treats, setTreats]     = useState<string[]>([]);
  const [sats, setSats]         = useState<string[]>([]);
  const [feeling, setFeeling]   = useState("");
  const [selfTxt, setSelfTxt]   = useState("");
  const [review, setReview]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [err, setErr]           = useState("");

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const generate = () => {
    if (treats.length === 0) { setErr("치료 항목을 하나 이상 선택해주세요."); return; }
    if (feeling.trim().length < 5) { setErr("느낀 점을 5글자 이상 간단히 적어주세요."); return; }

    setErr("");
    setLoading(true);
    setReview("");

    window.setTimeout(() => {
      const result = createReview(treats, sats, visit, style, feeling);
      setReview(result);
      setLoading(false);
    }, 450);
  };

  const copy = async () => {
    const t = mode === "SELF" ? selfTxt : review;
    if (!t) return;
    await navigator.clipboard.writeText(t);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const displayText = mode === "SELF" ? selfTxt : review;

  return (
    <>
      <GlobalStyle />
      <div style={{
        fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
        background: BG, minHeight: "100vh",
        width: "100%", maxWidth: 430,
        margin: "0 auto", paddingBottom: 90,
      }}>

        {/* ── 헤더 ────────────────────────────────────── */}
        <div style={{
          background: "white", textAlign: "center",
          padding: "28px 20px 22px",
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <div style={{
            width: 64, height: 64, background: LBLUE,
            borderRadius: "50%", fontSize: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>🦷</div>
          <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.5 }}>
            서울디아치과
          </h1>
          <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.65 }}>
            짧게 적어주신 방문 경험을<br />자연스러운 리뷰 문장으로 다듬어 드립니다
          </p>
        </div>

        {/* ── 본문 ─────────────────────────────────────── */}
        <div style={{ padding: "16px 12px 0" }}>

          {/* ① 작성방식 */}
          <Card>
            <SectionHeader n={1} label="작성방식" />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>
              리뷰를 어떻게 작성할까요?
            </p>
            <Toggle2
              options={[
                { id:"AI",   label:"문장 다듬기",  sub:"선택값 기반 자연 작성" },
                { id:"SELF", label:"직접 입력",      sub:"내가 직접 작성" },
              ]}
              value={mode} onChange={v => setMode(v as "AI"|"SELF")}
            />
          </Card>

          {/* ② 방문유형 */}
          <Card>
            <SectionHeader n={2} label="방문유형" />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>
              이번 방문은 어떤 형태였나요?
            </p>
            <Toggle2
              options={[
                { id:"처음 방문", label:"처음 방문", sub:"첫 진료·상담" },
                { id:"재방문",    label:"재방문",    sub:"다시 방문" },
              ]}
              value={visit} onChange={setVisit}
            />
          </Card>

          {/* ③ 문장 길이 (AI 모드) */}
          {mode === "AI" && (
            <Card>
              <SectionHeader n={3} label="문장 길이" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>
                어느 정도 길이로 다듬을까요?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {["짧게","자연스럽게","자세하게"].map(s => {
                  const on = style === s;
                  return (
                    <button key={s} onClick={() => setStyle(s)} style={{
                      padding: "12px 4px",
                      border: `2px solid ${on ? BLUE : BORDER}`,
                      borderRadius: 12, background: on ? LBLUE : "white",
                      color: on ? BLUE : "#1E293B",
                      fontSize: 13, fontWeight: on ? 700 : 500,
                      cursor: "pointer", transition: "all 0.15s", width: "100%",
                    }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ④ 치료선택 (AI 모드) */}
          {mode === "AI" && (
            <Card>
              <SectionHeader n={4} label="치료선택" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>
                어떤 치료를 받으셨나요?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {TREATMENTS.map(t => {
                  const on = treats.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggle(treats, setTreats, t.id)} style={{
                      padding: "12px 6px 10px",
                      border: `2px solid ${on ? BLUE : BORDER}`,
                      borderRadius: 12, background: on ? LBLUE : "white",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 6, transition: "all 0.15s",
                      width: "100%", minWidth: 0,
                    }}>
                      <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
                      <span style={{
                        fontSize: 11.5, fontWeight: on ? 700 : 500,
                        color: on ? BLUE : "#374151",
                        whiteSpace: "pre-line", lineHeight: 1.3, textAlign: "center",
                        width: "100%", wordBreak: "keep-all",
                      }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ⑤ 경험선택 (AI 모드) */}
          {mode === "AI" && (
            <Card>
              <SectionHeader n={5} label="경험선택" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>
                어떤 점이 좋으셨나요?
              </p>
              <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>하나만 선택해도 됩니다</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SATISFACTIONS.map(s => {
                  const on = sats.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggle(sats, setSats, s.id)} style={{
                      padding: "12px 10px",
                      border: `2px solid ${on ? BLUE : BORDER}`,
                      borderRadius: 12, background: on ? LBLUE : "white",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      gap: 8, transition: "all 0.15s", width: "100%",
                    }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? BLUE : "#374151" }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ⑥ 방문 경험 입력 (AI 모드) */}
          {mode === "AI" && (
            <Card>
              <SectionHeader n={6} label="방문 경험 입력" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
                느낀 점을 짧게 적어주세요
              </p>
              <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10, lineHeight: 1.55 }}>
                예: 설명을 잘해주셔서 안심됐고, 생각보다 불편감이 적었어요.
              </p>
              <textarea
                value={feeling}
                onChange={e => setFeeling(e.target.value)}
                placeholder="방문 경험을 한두 줄로 적어주세요..."
                style={{
                  width: "100%", minHeight: 96,
                  border: `1px solid ${BORDER}`, borderRadius: 10,
                  padding: "11px 12px", fontSize: 14, lineHeight: 1.7,
                  color: "#1E293B", resize: "vertical", outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box", display: "block",
                }}
              />
              <p style={{ textAlign: "right", fontSize: 11.5, color: "#94A3B8", marginTop: 4 }}>
                {feeling.replace(/\s/g, "").length}자
              </p>
            </Card>
          )}

          {/* 에러 */}
          {err && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 12, padding: "10px 14px",
              color: "#DC2626", fontSize: 13, marginBottom: 12,
            }}>⚠️ {err}</div>
          )}

          {/* AI 생성 버튼 */}
          {mode === "AI" && (
            <button onClick={generate} disabled={loading} style={{
              width: "100%", padding: "16px 0",
              background: loading ? "#93C5FD" : `linear-gradient(135deg,${NAVY} 0%,${BLUE} 100%)`,
              color: "white", border: "none", borderRadius: 16,
              fontSize: 16, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 12, letterSpacing: -0.3,
              boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading ? <><Spinner /> 문장 다듬는 중...</> : "✨  자연스러운 리뷰로 다듬기"}
            </button>
          )}

          {/* 리뷰 결과 / 직접 입력 */}
          {(mode === "SELF" || review || loading) && (
            <div style={{
              background: "white", borderRadius: 16,
              padding: "16px 14px", marginBottom: 12,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 22, color: GOLD }}>★</span>)}
              </div>

              {mode === "SELF" ? (
                <>
                  <p style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 8 }}>
                    실제 방문 경험을 바탕으로 직접 입력해 주세요.
                  </p>
                  <textarea
                    value={selfTxt} onChange={e => setSelfTxt(e.target.value)}
                    placeholder="방문 경험을 자유롭게 작성해주세요..."
                    style={{
                      width: "100%", minHeight: 120,
                      border: `1px solid ${BORDER}`, borderRadius: 10,
                      padding: "11px 12px", fontSize: 14, lineHeight: 1.7,
                      color: "#1E293B", resize: "vertical", outline: "none",
                      fontFamily: "inherit", boxSizing: "border-box", display: "block",
                    }}
                  />
                  {selfTxt && (
                    <p style={{ textAlign: "right", fontSize: 11.5, color: "#94A3B8", marginTop: 4 }}>
                      {selfTxt.replace(/\s/g, "").length}자
                    </p>
                  )}
                </>
              ) : loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 14, minHeight: 60 }}>
                  <Spinner color="#94A3B8" /> 리뷰 문장을 자연스럽게 다듬고 있어요...
                </div>
              ) : review ? (
                <>
                  <div style={{
                    background: "#F1F5F9", borderRadius: 8,
                    padding: "5px 10px", display: "inline-flex",
                    alignItems: "center", gap: 5, marginBottom: 10,
                  }}>
                    <span style={{ fontSize: 11, color: BLUE, fontWeight: 600 }}>✨ 다듬은 리뷰 문장</span>
                  </div>
                  <p style={{ color: "#1E293B", fontSize: 14.5, lineHeight: 1.85, wordBreak: "keep-all", whiteSpace: "pre-wrap" }}>
                    {review}
                  </p>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginTop: 12, paddingTop: 10, borderTop: `1px solid ${BORDER}`,
                  }}>
                    <span style={{ fontSize: 11.5, color: "#94A3B8" }}>{review.replace(/\s/g,"").length}자</span>
                    <button onClick={generate} style={{
                      background: "none", border: `1px solid ${BORDER}`,
                      borderRadius: 8, padding: "5px 12px",
                      fontSize: 12, color: "#64748B", cursor: "pointer", fontWeight: 500,
                    }}>🔄 다시 다듬기</button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* 복사 버튼 */}
          {displayText && (
            <button onClick={copy} style={{
              width: "100%", padding: "16px 0",
              background: copied ? "#16A34A" : `linear-gradient(135deg,${NAVY} 0%,${BLUE} 100%)`,
              color: "white", border: "none", borderRadius: 16,
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              marginBottom: 10, letterSpacing: -0.3,
              boxShadow: "0 4px 16px rgba(37,99,235,0.28)",
              transition: "background 0.25s",
            }}>
              {copied ? "✓  복사되었습니다!" : "📋  문구 복사하기"}
            </button>
          )}

          <p style={{ fontSize: 11.5, color: "#94A3B8", textAlign: "center", lineHeight: 1.6, padding: "4px 0 8px" }}>
            ※ 생성된 문장은 참고용 예시입니다. 실제 경험에 맞게 수정 후 사용해주세요.
          </p>
        </div>

        {/* ── 하단 고정 네비 ───────────────────────────── */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "white", borderTop: `1px solid ${BORDER}`,
          padding: "10px 12px 20px",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.07)", zIndex: 999,
          maxWidth: 430, margin: "0 auto",
          /* 모바일에서 safe-area 대응 */
          paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        }}>
          {NAV_BTNS.map(b => (
            <a key={b.label} href={b.url}
              target={b.url.startsWith("tel") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "8px 4px", background: BG, borderRadius: 12, textDecoration: "none",
              }}>
              <div style={{
                width: 38, height: 38, background: b.bg, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 16, fontWeight: 800,
              }}>{b.icon}</div>
              <span style={{ color: "#374151", fontSize: 11, fontWeight: 500, textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-line" }}>
                {b.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

/* ── 스피너 ──────────────────────────────────────────── */
function Spinner({ color = "white" }: { color?: string }) {
  return (
    <span style={{
      width: 16, height: 16, borderRadius: "50%",
      border: `2.5px solid ${color === "white" ? "rgba(255,255,255,0.3)" : "#E2E8F0"}`,
      borderTopColor: color,
      animation: "_spin 0.7s linear infinite",
      display: "inline-block", flexShrink: 0,
    }} />
  );
}
