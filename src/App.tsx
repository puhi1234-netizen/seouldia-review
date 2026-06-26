import { useState, type ReactNode } from "react";

const NAVY = "#0D2461";
const BLUE = "#2563EB";
const LBLUE = "#EFF6FF";
const BORDER = "#E2E8F0";
const GOLD = "#F59E0B";
const BG = "#F8FAFC";

type Option = { id: string; icon: string; label: string; keyword?: string; phrases: string[] };

type SimpleOption = { id: string; icon: string; label: string; phrases: string[] };

const TREATMENTS: Option[] = [
  {
    id: "임플란트", icon: "🦷", label: "임플란트", keyword: "마곡 임플란트",
    phrases: [
      "임플란트 상담부터 치료 방향까지 차분하게 안내받을 수 있었습니다",
      "임플란트 진료에 대해 궁금했던 부분을 자세히 설명해주셔서 부담이 줄었습니다",
      "마곡 임플란트를 알아보다 방문했는데 설명이 꼼꼼해서 좋았습니다",
      "CT 촬영과 상담 과정을 통해 현재 상태를 이해하기 쉽게 안내받았습니다",
      "수술 전후 주의사항까지 차분하게 알려주셔서 마음이 한결 편했습니다",
      "잇몸 상태와 보철 계획을 함께 설명해주셔서 전체적인 흐름을 이해하기 좋았습니다",
      "임플란트가 처음이라 걱정이 있었는데 필요한 부분을 과하지 않게 안내받았습니다",
      "마곡역 근처에서 임플란트 상담을 받기 편한 치과라는 느낌이 들었습니다",
    ],
  },
  {
    id: "DIAnate 라미네이트", icon: "✨", label: "DIAnate 라미네이트", keyword: "마곡 라미네이트",
    phrases: [
      "라미네이트 상담에서 제 치아 상태와 원하는 방향을 함께 봐주셔서 신뢰가 갔습니다",
      "앞니 심미치료에 대해 과하지 않게 설명해주셔서 편하게 상담받았습니다",
      "마곡 라미네이트 상담을 알아보다 방문했는데 설명이 차분하고 이해하기 쉬웠습니다",
      "치아 색과 모양을 자연스럽게 맞추는 방향으로 상담해주셔서 좋았습니다",
      "무리한 변화보다 제 인상에 어울리는 방향을 설명해주셔서 신뢰가 갔습니다",
      "심미적인 부분뿐 아니라 치아 상태까지 함께 봐주셔서 상담이 만족스러웠습니다",
      "앞니 라인과 미소 느낌을 세심하게 상담해주셔서 편하게 결정할 수 있었습니다",
      "마곡 심미치료를 찾는 분들이 참고하기 좋은 상담 경험이었습니다",
    ],
  },
  {
    id: "치아미백", icon: "🌟", label: "치아미백", keyword: "마곡 치아미백",
    phrases: [
      "치아미백 진행 과정과 주의사항을 자세히 설명해주셔서 좋았습니다",
      "미백 진료 전에 궁금한 점을 잘 안내해주셔서 편하게 받을 수 있었습니다",
      "마곡 치아미백을 알아보다 방문했는데 안내가 깔끔하고 친절했습니다",
      "미백 후 관리 방법까지 설명해주셔서 집에서도 참고하기 좋았습니다",
      "중요한 일정을 앞두고 방문했는데 필요한 부분을 차분하게 안내받았습니다",
      "치아 상태를 먼저 확인하고 가능한 방향을 설명해주셔서 신뢰가 갔습니다",
      "과장된 설명보다 현실적인 안내를 받을 수 있어 만족스러웠습니다",
      "마곡역 근처에서 치아미백 상담을 받기 편한 곳이라는 느낌이었습니다",
    ],
  },
  {
    id: "투명교정", icon: "😁", label: "투명교정", keyword: "마곡 투명교정",
    phrases: [
      "투명교정 상담에서 치료 흐름과 예상 과정을 알기 쉽게 설명해주셔서 좋았습니다",
      "교정에 대해 궁금했던 점을 하나씩 확인해주셔서 상담이 편안했습니다",
      "마곡 투명교정을 알아보다 방문했는데 제 상황에 맞춰 차분히 설명해주셨습니다",
      "장치 착용과 관리 방법에 대해 자세히 들을 수 있어 도움이 됐습니다",
      "치아 배열 상태를 확인하고 가능한 방향을 현실적으로 안내받았습니다",
      "교정 기간과 과정에 대해 무리 없이 설명해주셔서 이해하기 쉬웠습니다",
      "외관이 부담스러운 교정을 고민 중이었는데 투명교정 상담이 편안했습니다",
      "마곡역 근처에서 투명교정 상담을 알아보는 분들에게 참고가 될 것 같습니다",
    ],
  },
  {
    id: "충치치료", icon: "⚡", label: "충치치료", keyword: "마곡 충치치료",
    phrases: [
      "충치치료 과정과 필요한 진료 방향을 자세히 설명해주셔서 이해하기 쉬웠습니다",
      "치료 중간중간 진행 상황을 알려주셔서 덜 긴장하고 받을 수 있었습니다",
      "마곡 충치치료를 알아보다 방문했는데 설명이 꼼꼼하고 진료가 편안했습니다",
      "충치 범위와 치료 방법을 차분하게 설명해주셔서 신뢰가 갔습니다",
      "필요한 치료와 지켜볼 부분을 구분해 안내해주셔서 좋았습니다",
      "치료 전후로 주의할 점을 알려주셔서 관리하기 수월했습니다",
      "인레이와 레진 등 가능한 방향을 이해하기 쉽게 설명받았습니다",
      "마곡역 근처에서 충치치료를 받기 편한 치과라는 느낌이 들었습니다",
    ],
  },
  {
    id: "신경치료", icon: "🔍", label: "신경치료", keyword: "마곡 신경치료",
    phrases: [
      "신경치료 과정이 걱정됐는데 단계별로 설명해주셔서 안심이 됐습니다",
      "치료 과정과 이후 주의사항을 꼼꼼하게 안내받아 도움이 됐습니다",
      "마곡 신경치료를 알아보다 방문했는데 설명이 자세해서 좋았습니다",
      "통증이 있었던 부위를 세심하게 확인해주셔서 신뢰가 갔습니다",
      "신경치료가 필요한 이유와 진행 과정을 차분히 들을 수 있었습니다",
      "치료 중 불편감이 없는지 확인해주셔서 부담이 줄었습니다",
      "치료 후 보철까지 이어지는 과정을 이해하기 쉽게 안내받았습니다",
      "마곡역 주변에서 신경치료 상담을 받기 좋은 곳이라는 느낌이었습니다",
    ],
  },
  {
    id: "턱관절 치료", icon: "💆", label: "턱관절 치료", keyword: "마곡 턱관절",
    phrases: [
      "턱관절 불편감에 대해 자세히 들어주시고 관리 방향을 설명해주셔서 도움이 됐습니다",
      "턱관절 진료가 처음이라 걱정했는데 차분하게 안내해주셔서 안심이 됐습니다",
      "마곡 턱관절 진료를 알아보다 방문했는데 설명이 자세하고 분위기가 편안했습니다",
      "입 벌릴 때 불편한 부분을 꼼꼼히 확인해주셔서 좋았습니다",
      "생활 습관과 관리 방법까지 함께 설명해주셔서 도움이 됐습니다",
      "턱관절 증상을 단순히 넘기지 않고 자세히 봐주셔서 신뢰가 갔습니다",
      "치료 방향을 과하지 않게 안내해주셔서 부담 없이 상담받을 수 있었습니다",
      "마곡역 근처에서 턱관절 진료를 알아보는 분들에게 참고가 될 것 같습니다",
    ],
  },
  {
    id: "스케일링", icon: "🪥", label: "스케일링", keyword: "마곡 스케일링",
    phrases: [
      "스케일링 과정이 깔끔했고 필요한 관리 방법도 안내받을 수 있었습니다",
      "구강 상태를 확인해주시면서 관리 방향을 설명해주셔서 도움이 됐습니다",
      "마곡 스케일링을 알아보다 방문했는데 친절하고 편안하게 받을 수 있었습니다",
      "정기검진과 스케일링을 함께 받기 편한 치과라는 느낌이 들었습니다",
      "잇몸 상태와 칫솔질 관리 방법까지 안내받아 도움이 됐습니다",
      "진료가 깔끔하게 진행되어 부담 없이 받을 수 있었습니다",
      "검진 결과를 차분히 설명해주셔서 현재 상태를 이해하기 좋았습니다",
      "마곡역 근처에서 정기적으로 다니기 좋은 치과라는 느낌이었습니다",
    ],
  },
  {
    id: "일반진료", icon: "🏥", label: "일반진료", keyword: "마곡 치과",
    phrases: [
      "마곡 치과를 찾다가 방문했는데 진료 전 설명이 자세해서 안심이 됐습니다",
      "전체적으로 안내가 친절하고 필요한 부분을 차분하게 설명해주셔서 좋았습니다",
      "치과 진료가 부담스러웠는데 직원분들과 원장님 모두 편안하게 응대해주셨습니다",
      "처음 방문했는데 진료 과정이 깔끔하고 설명도 이해하기 쉬웠습니다",
      "검진부터 상담까지 흐름이 체계적으로 느껴져서 신뢰가 갔습니다",
      "불편했던 부분을 꼼꼼히 확인해주셔서 만족스러운 방문이었습니다",
      "마곡역 근처에서 편하게 다닐 수 있는 치과를 찾다가 좋은 경험을 했습니다",
      "필요한 진료를 차분하게 안내받아 다음 방문도 부담이 적을 것 같습니다",
    ],
  },
];

const SATISFACTIONS: SimpleOption[] = [
  {
    id: "설명이 자세했어요", icon: "💬", label: "자세한 설명",
    phrases: [
      "원장님께서 치료 과정을 자세히 설명해주셔서 이해하기 쉬웠습니다",
      "궁금한 점을 차분히 알려주셔서 안심하고 진료받을 수 있었습니다",
      "상담부터 진료까지 설명이 꼼꼼해서 신뢰가 갔습니다",
      "현재 상태와 필요한 치료를 구분해서 설명해주셔서 좋았습니다",
      "전문적인 내용도 어렵지 않게 풀어서 안내해주셔서 편했습니다",
      "질문에 하나씩 답해주셔서 치료 방향을 이해하는 데 도움이 됐습니다",
    ],
  },
  {
    id: "통증을 배려해줬어요", icon: "🤗", label: "통증 배려",
    phrases: [
      "진료 중 불편하지 않은지 계속 살펴봐주셔서 편안했습니다",
      "생각보다 불편감이 크지 않도록 세심하게 봐주셔서 좋았습니다",
      "치료에 대한 걱정이 있었는데 배려해주셔서 한결 편하게 받을 수 있었습니다",
      "중간중간 상태를 확인해주셔서 긴장이 많이 줄었습니다",
      "불편한 부분을 바로 말할 수 있는 분위기라 안심이 됐습니다",
      "치료 과정에서 세심하게 배려받는 느낌이 들어 좋았습니다",
    ],
  },
  {
    id: "친절했어요", icon: "✅", label: "친절함",
    phrases: [
      "직원분들도 친절하게 안내해주셔서 방문 내내 편안했습니다",
      "접수부터 진료까지 응대가 친절해서 기분 좋게 다녀왔습니다",
      "처음 방문했는데도 편하게 대해주셔서 부담이 적었습니다",
      "안내가 차분하고 친절해서 치과 방문에 대한 부담이 줄었습니다",
      "상담과 접수 과정이 부드러워서 전체적인 인상이 좋았습니다",
      "문의한 부분에도 친절하게 설명해주셔서 만족스러웠습니다",
    ],
  },
  {
    id: "시설이 깨끗했어요", icon: "🧹", label: "청결·위생",
    phrases: [
      "병원 내부가 깔끔하고 위생적으로 느껴져서 좋았습니다",
      "진료 공간이 깨끗하게 관리되는 느낌이라 안심이 됐습니다",
      "시설이 쾌적해서 대기하는 동안에도 편안했습니다",
      "전체적으로 정돈된 분위기라 신뢰감이 들었습니다",
      "깔끔한 진료 환경 덕분에 처음 방문했을 때부터 인상이 좋았습니다",
      "대기 공간과 진료 공간 모두 관리가 잘 되는 느낌이었습니다",
    ],
  },
  {
    id: "결과가 만족스러워요", icon: "💙", label: "결과 만족",
    phrases: [
      "제 상황에 맞춰 진료 방향을 잡아주셔서 만족스러웠습니다",
      "필요한 부분을 과하지 않게 설명해주셔서 결정하는 데 도움이 됐습니다",
      "진료 후 안내까지 꼼꼼해서 전체적으로 만족스러운 경험이었습니다",
      "무리한 권유 없이 제 상태에 맞는 방향을 안내받아 좋았습니다",
      "상담 내용과 진료 흐름이 잘 이어져서 신뢰가 갔습니다",
      "진료가 끝난 뒤에도 관리 방법을 알려주셔서 도움이 됐습니다",
    ],
  },
  {
    id: "대기시간이 짧았어요", icon: "😊", label: "빠른 진료",
    phrases: [
      "예약 안내와 진료 진행이 비교적 깔끔해서 편했습니다",
      "대기와 안내 과정이 정돈되어 있어 방문이 수월했습니다",
      "전체적인 진행이 매끄러워서 바쁜 일정 중에도 부담이 적었습니다",
      "예약 시간에 맞춰 비교적 원활하게 진료를 받을 수 있었습니다",
      "진료 흐름이 정리되어 있어 시간을 효율적으로 쓸 수 있었습니다",
      "방문부터 진료까지 과정이 복잡하지 않아 편했습니다",
    ],
  },
];

const CONVENIENCES: SimpleOption[] = [
  {
    id: "마곡역 근처라 편했어요", icon: "🚇", label: "마곡역 근처",
    phrases: [
      "마곡역 근처라 찾아가기 편했습니다",
      "위치가 좋아서 방문하기 수월했습니다",
      "마곡역 주변에서 치과를 찾는 분들에게 접근성이 괜찮다고 느꼈습니다",
      "마곡역에서 이동하기 편해서 일정 중 방문하기 좋았습니다",
      "마곡 근처에서 치과를 찾다가 방문하기 좋은 위치라고 느꼈습니다",
      "대중교통으로 방문하기에도 부담이 적었습니다",
    ],
  },
  {
    id: "예약이 편했어요", icon: "📅", label: "예약 편의",
    phrases: [
      "예약과 안내가 깔끔해서 방문 전부터 편했습니다",
      "일정에 맞춰 안내받을 수 있어 부담이 적었습니다",
      "예약 후 진료까지 흐름이 비교적 매끄러웠습니다",
      "방문 전 안내가 정리되어 있어 처음 가는 길도 어렵지 않았습니다",
      "예약 확인과 진료 안내가 친절해서 편하게 방문했습니다",
      "바쁜 일정 중에도 시간을 맞추기 수월했습니다",
    ],
  },
  {
    id: "상담이 부담스럽지 않았어요", icon: "🧾", label: "부담 없는 상담",
    phrases: [
      "상담이 부담스럽지 않고 필요한 부분 위주로 설명해주셔서 좋았습니다",
      "과하게 권유하는 느낌보다 제 상황에 맞춰 안내해주셔서 편했습니다",
      "진료 방향을 차분하게 설명해주셔서 결정하는 데 도움이 됐습니다",
      "선택 가능한 방법을 비교해서 설명해주셔서 이해하기 쉬웠습니다",
      "필요한 치료와 선택적인 부분을 구분해서 안내받아 좋았습니다",
      "상담 분위기가 편안해서 궁금한 점을 물어보기 좋았습니다",
    ],
  },
  {
    id: "분위기가 편안했어요", icon: "🌿", label: "편안한 분위기",
    phrases: [
      "병원 분위기가 편안해서 긴장이 조금 풀렸습니다",
      "전체적인 분위기가 차분해서 진료받기 편했습니다",
      "대기부터 진료까지 편안한 느낌이라 만족스러웠습니다",
      "깔끔하면서도 부담스럽지 않은 분위기라 좋았습니다",
      "처음 방문했는데도 차분한 분위기 덕분에 편하게 느껴졌습니다",
      "진료 공간의 분위기가 안정적이라 긴장이 덜했습니다",
    ],
  },
  {
    id: "진료 시스템이 체계적이었어요", icon: "🖥️", label: "체계적 시스템",
    phrases: [
      "검사와 설명 과정이 체계적으로 느껴져서 신뢰가 갔습니다",
      "진료 전 확인 과정이 꼼꼼해서 안심이 됐습니다",
      "상태를 확인하고 설명해주는 과정이 체계적으로 느껴졌습니다",
      "진료 전후 안내가 정돈되어 있어 믿음이 갔습니다",
      "검진 결과를 바탕으로 설명해주는 과정이 이해하기 쉬웠습니다",
      "상담과 진료가 연결되는 흐름이 깔끔했습니다",
    ],
  },
  {
    id: "일요일 진료가 도움됐어요", icon: "☀️", label: "일요일 진료",
    phrases: [
      "일정상 평일 방문이 어려웠는데 진료 시간을 맞추기 수월했습니다",
      "바쁜 일정 중에도 방문할 수 있어 편했습니다",
      "진료 시간 선택지가 있어 이용하기 좋았습니다",
      "평일에 시간을 내기 어려웠는데 방문 선택지가 있어 도움이 됐습니다",
      "주말 일정 중에도 진료를 볼 수 있어 편리했습니다",
      "시간을 맞추기 어려운 분들에게 도움이 되는 진료 일정이라고 느꼈습니다",
    ],
  },
];

const EMOTIONS: SimpleOption[] = [
  {
    id: "치과가 무서웠어요", icon: "😟", label: "치과 공포",
    phrases: [
      "치과 진료가 걱정됐지만 차분한 안내 덕분에 부담이 줄었습니다",
      "처음에는 긴장했는데 설명을 듣고 나니 마음이 한결 편해졌습니다",
      "진료 전 걱정이 있었지만 세심하게 봐주셔서 안심이 됐습니다",
      "치과 방문이 늘 부담스러웠는데 이번에는 비교적 편하게 느껴졌습니다",
      "긴장한 상태로 방문했지만 차분한 분위기 덕분에 마음이 놓였습니다",
      "걱정했던 부분을 먼저 물어봐주셔서 편하게 진료받을 수 있었습니다",
    ],
  },
  {
    id: "비용이 걱정됐어요", icon: "💳", label: "비용 걱정",
    phrases: [
      "필요한 진료와 선택 가능한 방향을 함께 설명해주셔서 이해하기 쉬웠습니다",
      "비용과 치료 방향에 대해 차분히 안내받아 결정하는 데 도움이 됐습니다",
      "제 상황에 맞춰 설명해주셔서 부담을 줄이고 상담받을 수 있었습니다",
      "여러 선택지를 비교해서 설명해주셔서 판단하기 좋았습니다",
      "과한 권유보다 필요한 부분을 중심으로 안내해주셔서 신뢰가 갔습니다",
      "치료 계획을 단계별로 들을 수 있어 부담이 줄었습니다",
    ],
  },
  {
    id: "시간이 부족했어요", icon: "⏱️", label: "바쁜 일정",
    phrases: [
      "바쁜 일정 중에도 진료 흐름이 깔끔해서 이용하기 편했습니다",
      "대기와 안내가 정돈되어 있어 시간을 효율적으로 쓸 수 있었습니다",
      "일정에 맞춰 방문하기 편한 점이 좋았습니다",
      "짧은 시간 안에서도 필요한 설명을 들을 수 있어 만족스러웠습니다",
      "진료 진행이 매끄러워서 일정 부담이 덜했습니다",
      "방문 전 안내가 잘 되어 있어 시간을 아낄 수 있었습니다",
    ],
  },
  {
    id: "자연스러운 결과를 원했어요", icon: "😊", label: "자연스러움",
    phrases: [
      "자연스러운 방향으로 상담해주셔서 만족스러웠습니다",
      "제 치아 상태에 맞춰 무리하지 않는 방향으로 설명해주셔서 좋았습니다",
      "과하지 않게 자연스러운 방향을 함께 고민해주셔서 신뢰가 갔습니다",
      "심미적인 부분도 제 얼굴과 분위기에 맞춰 설명해주셔서 좋았습니다",
      "자연스러운 결과를 중요하게 봐주시는 느낌이라 상담이 편했습니다",
      "원하는 느낌을 듣고 현실적인 방향을 제안해주셔서 도움이 됐습니다",
    ],
  },
];

const BRAND_PHRASES = [
  "상담부터 진료까지 차분하고 정돈된 분위기라 신뢰가 갔습니다",
  "프리미엄한 느낌은 있으면서도 설명은 어렵지 않아 편하게 느껴졌습니다",
  "세심하게 확인하고 안내해주는 과정이 서울디아치과의 장점처럼 느껴졌습니다",
  "과한 표현보다 필요한 부분을 정확히 안내해주는 점이 좋았습니다",
  "진료 과정 전반이 깔끔하고 체계적으로 느껴져 만족스러웠습니다",
  "환자 입장에서 이해하기 쉽게 설명해주는 점이 인상적이었습니다",
  "편안한 분위기와 섬세한 상담이 함께 느껴져 좋은 경험이었습니다",
  "마곡역 근처에서 세심하게 진료받고 싶을 때 떠올릴 수 있는 치과라는 느낌이었습니다",
];


/* ── 문장 조각 4배 확장: API 없이도 다양하게 조합 ───────── */
const TREATMENT_EXTRA_TEMPLATES = [
  "{keyword}를 알아보다 방문했는데 {treatment} 상담이 차분하고 이해하기 쉬웠습니다",
  "서울디아치과에서 {treatment} 관련 설명을 들으면서 제 상태를 더 잘 이해할 수 있었습니다",
  "마곡역 근처에서 {treatment} 진료를 알아보는 분들에게 참고가 될 만한 경험이었습니다",
  "{treatment} 진료 전 걱정이 있었지만 설명을 듣고 나니 부담이 줄었습니다",
  "{treatment} 과정과 주의사항을 단계별로 안내받아 결정하는 데 도움이 됐습니다",
  "마곡 치과를 찾다가 방문했는데 {treatment} 상담 흐름이 정돈되어 있어 좋았습니다",
  "{treatment}에 대해 필요한 부분과 선택할 수 있는 방향을 구분해서 설명해주셨습니다",
  "서울디아치과의 {treatment} 상담은 과하게 느껴지지 않고 차분해서 편했습니다",
  "{keyword} 관련해서 궁금했던 점을 하나씩 확인할 수 있어 만족스러웠습니다",
  "{treatment} 진료가 처음이라 긴장했는데 세심한 안내 덕분에 안심이 됐습니다",
  "현재 상태를 먼저 확인하고 {treatment} 방향을 설명해주셔서 신뢰가 갔습니다",
  "마곡역 치과를 알아보다가 방문했는데 {treatment} 설명이 꼼꼼하게 느껴졌습니다",
  "{treatment} 상담 중 제 상황에 맞는 방향을 함께 고민해주셔서 좋았습니다",
  "필요한 검사와 상담을 거쳐 {treatment} 방향을 차분히 들을 수 있었습니다",
  "{keyword}를 찾던 중 방문했는데 진료 전 안내가 체계적으로 느껴졌습니다",
  "{treatment} 전후로 확인해야 할 부분을 알려주셔서 마음이 한결 편했습니다",
  "서울디아치과에서 {treatment} 상담을 받으며 편안하고 정돈된 분위기를 느꼈습니다",
  "마곡역 근처라 방문이 편했고 {treatment} 상담도 자세해서 좋았습니다",
  "{treatment}에 대해 어렵게 느껴졌던 부분을 쉽게 풀어 설명해주셨습니다",
  "상담부터 진료 안내까지 이어지는 흐름이 깔끔해서 {treatment}에 대한 부담이 줄었습니다",
  "{keyword}를 고민하던 중 서울디아치과에서 세심하게 상담받을 수 있었습니다",
  "{treatment} 관련 선택지를 무리 없이 설명해주셔서 편하게 판단할 수 있었습니다",
  "치료 전 걱정했던 부분을 먼저 확인해주셔서 {treatment} 상담이 편안했습니다",
  "마곡에서 {treatment} 진료를 알아보다 방문했는데 전체적으로 안정적인 느낌이었습니다",
];

const SATISFACTION_EXTRA_TEMPLATES = [
  "{label} 부분이 특히 기억에 남았고 전반적으로 상담이 차분했습니다",
  "{label} 덕분에 진료 과정이 더 편안하게 느껴졌습니다",
  "서울디아치과에서 느낀 {label}이 만족스러운 방문으로 이어졌습니다",
  "{label} 면에서 세심하게 신경 써주는 느낌을 받을 수 있었습니다",
  "처음부터 끝까지 {label}이 잘 느껴져서 부담이 적었습니다",
  "마곡 치과를 찾는 분들이 중요하게 볼 만한 {label}이 좋았습니다",
  "{label}이 잘 갖춰진 느낌이라 진료받는 동안 안심이 됐습니다",
  "상담과 진료 과정에서 {label}이 자연스럽게 느껴졌습니다",
  "{label} 때문에 치과 방문에 대한 긴장이 조금 줄었습니다",
  "전체적인 경험에서 {label}이 가장 만족스러운 부분이었습니다",
  "마곡역 근처 치과 중에서도 {label}이 인상적으로 느껴졌습니다",
  "{label}을 중요하게 생각하는 분들에게 참고가 될 만한 방문이었습니다",
  "진료 전후로 {label}을 느낄 수 있어 만족스러웠습니다",
  "서울디아치과의 정돈된 분위기와 함께 {label}이 좋게 느껴졌습니다",
  "{label} 부분이 자연스럽게 전달되어 신뢰가 갔습니다",
  "치료를 받는 동안 {label}이 있어서 마음이 편했습니다",
  "{label} 덕분에 다음 방문도 부담이 덜할 것 같습니다",
  "전체적으로 {label}이 잘 느껴지는 치과라는 인상을 받았습니다",
];

const CONVENIENCE_EXTRA_TEMPLATES = [
  "{label} 덕분에 방문 전후 과정이 더 편하게 느껴졌습니다",
  "서울디아치과는 {label} 면에서도 만족스러운 편이었습니다",
  "마곡역 근처에서 치과를 찾을 때 {label}은 확실히 장점으로 느껴졌습니다",
  "{label} 때문에 바쁜 일정 중에도 방문 부담이 적었습니다",
  "처음 방문했는데도 {label}이 좋아서 이용하기 편했습니다",
  "진료 외적인 부분에서도 {label}이 잘 갖춰진 느낌이었습니다",
  "{label} 덕분에 치과 방문 과정이 복잡하지 않았습니다",
  "마곡 치과를 알아보는 분들이라면 {label}도 참고할 만하다고 느꼈습니다",
  "상담과 진료 흐름뿐 아니라 {label}도 만족스러웠습니다",
  "{label} 덕분에 전체적인 방문 경험이 더 좋게 느껴졌습니다",
  "서울디아치과는 {label}이 자연스럽게 느껴져서 편했습니다",
  "진료 전후 안내와 함께 {label}도 인상적이었습니다",
  "{label}을 중요하게 생각하는 분들에게도 괜찮은 선택지라고 느꼈습니다",
  "마곡역 주변에서 {label}이 좋은 치과를 찾는다면 참고할 만했습니다",
  "{label}이 있어 첫 방문의 부담이 줄었습니다",
  "대기부터 귀가까지 {label}이 잘 느껴졌습니다",
  "전체적으로 {label}이 방문 만족도를 높여주는 요소였습니다",
  "{label}과 차분한 진료 분위기가 함께 느껴져 좋았습니다",
];

const EMOTION_EXTRA_TEMPLATES = [
  "{label}이 있었지만 상담을 받고 나니 부담이 줄었습니다",
  "{label} 때문에 망설였는데 차분한 설명 덕분에 편안해졌습니다",
  "서울디아치과에서 상담받으면서 {label}에 대한 걱정이 조금 덜어졌습니다",
  "{label}을 먼저 이해해주고 설명해주는 느낌이라 좋았습니다",
  "진료 전에는 {label}이 있었지만 안내가 세심해서 안심이 됐습니다",
  "{label}을 가진 분들도 부담 없이 상담받기 좋은 분위기였습니다",
  "마곡 치과를 고민하면서 {label}이 있었는데 방문 후에는 마음이 편해졌습니다",
  "{label} 때문에 긴장했지만 필요한 내용을 차근차근 들을 수 있었습니다",
  "처음에는 {label}이 컸지만 진료 흐름이 정돈되어 있어 괜찮았습니다",
  "{label}이 있는 상태에서도 편하게 질문할 수 있는 분위기였습니다",
  "서울디아치과의 차분한 상담 덕분에 {label}이 줄어드는 느낌이었습니다",
  "{label}을 과하게 자극하지 않고 필요한 부분을 설명해주셔서 좋았습니다",
  "{label} 때문에 고민하던 부분을 현실적으로 안내받을 수 있었습니다",
  "마곡역 근처에서 상담받으며 {label}에 대해 차분히 정리할 수 있었습니다",
  "{label}이 있었지만 전반적인 응대가 편안해서 만족스러웠습니다",
  "처음 상담부터 {label}을 배려해주는 느낌이 들어 신뢰가 갔습니다",
  "진료를 받기 전 {label}이 있었는데 설명을 듣고 방향을 이해할 수 있었습니다",
  "{label}이 있는 분들에게도 편안한 상담 경험이 될 것 같았습니다",
];

const BRAND_EXTRA_PHRASES = [
  "서울디아치과는 상담의 밀도와 진료 흐름이 차분하게 느껴졌습니다",
  "마곡역 근처에서 세심한 상담을 받을 수 있는 치과라는 인상이 남았습니다",
  "브랜드 느낌은 깔끔하지만 설명은 편안해서 부담이 적었습니다",
  "진료 전 설명과 안내가 정돈되어 있어 프리미엄한 안정감이 느껴졌습니다",
  "환자 입장에서 이해하기 쉽게 설명해주는 점이 서울디아치과의 장점처럼 느껴졌습니다",
  "마곡 치과를 찾는 분들이 중요하게 볼 만한 상담의 세심함이 있었습니다",
  "시설과 상담 분위기가 모두 정돈되어 있어 첫인상이 좋았습니다",
  "필요한 부분을 차분하게 짚어주는 진료 흐름이 신뢰감을 줬습니다",
  "과한 표현보다 현실적인 안내가 중심이라 편안하게 느껴졌습니다",
  "상담부터 진료 후 안내까지 전체 흐름이 깔끔하게 이어졌습니다",
  "마곡역 주변에서 다니기 좋은 치과라는 느낌이 자연스럽게 들었습니다",
  "설명, 응대, 공간 분위기가 전체적으로 균형 있게 느껴졌습니다",
  "세심한 상담과 편안한 안내가 함께 느껴져 만족스러운 방문이었습니다",
  "서울디아치과의 차분하고 정돈된 진료 분위기가 기억에 남았습니다",
  "필요한 설명을 빠뜨리지 않고 해주는 점이 좋았습니다",
  "처음 방문해도 긴장이 덜하도록 안내해주는 분위기가 인상적이었습니다",
  "마곡 치과를 고민하는 분들에게 참고가 될 만한 안정적인 방문 경험이었습니다",
  "상담 과정에서 제 상황을 충분히 들어주는 느낌이라 신뢰가 갔습니다",
  "진료 공간과 응대가 깔끔하게 정리되어 있어 편안했습니다",
  "치과 특유의 부담을 줄여주는 차분한 분위기가 좋았습니다",
  "마곡역 인근에서 접근성과 상담의 세심함을 함께 느낄 수 있었습니다",
  "방문 전 걱정보다 실제 상담과 진료 과정이 훨씬 편안하게 느껴졌습니다",
  "정돈된 시스템과 친절한 안내가 함께 느껴지는 치과였습니다",
  "다음 진료도 부담 없이 예약할 수 있을 것 같은 안정감이 있었습니다",
];

TREATMENTS.forEach(item => {
  item.phrases = [
    ...item.phrases,
    ...TREATMENT_EXTRA_TEMPLATES.map(template =>
      template
        .replaceAll("{treatment}", item.id)
        .replaceAll("{keyword}", item.keyword || "마곡 치과")
    ),
  ];
});

SATISFACTIONS.forEach(item => {
  item.phrases = [
    ...item.phrases,
    ...SATISFACTION_EXTRA_TEMPLATES.map(template => template.replaceAll("{label}", item.label)),
  ];
});

CONVENIENCES.forEach(item => {
  item.phrases = [
    ...item.phrases,
    ...CONVENIENCE_EXTRA_TEMPLATES.map(template => template.replaceAll("{label}", item.label)),
  ];
});

EMOTIONS.forEach(item => {
  item.phrases = [
    ...item.phrases,
    ...EMOTION_EXTRA_TEMPLATES.map(template => template.replaceAll("{label}", item.label)),
  ];
});

BRAND_PHRASES.push(...BRAND_EXTRA_PHRASES);

const NAV_BTNS = [
  { label: "네이버\n리뷰", bg: "#03C75A", icon: "N",  url: "https://m.place.naver.com/hospital/1834256204/review/visitor?bk_query=%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90&entry=pll" },
  { label: "구글\n리뷰",   bg: "#4285F4", icon: "G",  url: "https://www.google.com/search?client=ms-android-samsung-ss&hs=047p&sca_esv=8d74949394e43b3b&sxsrf=APpeQnvnSUe_bVf3HIkRTUim3ZQGEz_AJg:1782212255763&q=%5B+%EB%A7%88%EA%B3%A1+l+%EB%B0%9C%EC%82%B0+%5D+%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90+%EA%B0%95%EC%84%9C%EA%B5%AC+%EB%A6%AC%EB%B7%B0&uds=AJ5uw1_qit-Q5ymRbxuR6EvNnFNi6d-Q4BT1tabh5L0Z-La-vamN-DnRW2Rpz5JKhBoZcwJijzVC7pbh--cn3EK5hWKgjp1lcGboMSkUMkAMLB05GKSzjOGQYnINBof0WD-oTP1C1C7Jm8OelSyvabGWoTsosnkF3bFNyrbEikUhCL0qtl1c8zQ7eUVGlEtKv4CGc1bNdaXtnIRgXUVch0JdX16SYgiDGXlmQ823j80Djtabs_ZH3aRDCFy4qeqYe5ifjqhl1X0GZpr_hOIvSC3Q4VA3-gJjDU357YuVaynb_7h4-UrKqa8B4PPLG05ggEI5Z1UwT52n8g72cCjPh50kE6SAJJwr9_jBHa04QTnHhyWo1lYGMy2Pq-7B9h1bK1zItbvpkz6Hj00tHwR4-rsvzGLX_N7E62-5S--NLjyjqa7ULJ7XOE6nBmoVtd87TRry3MWOkqo1TJn5b23TSh2QpGTC1uK2eC8gEhSHa3hrbuvLHoNSuT9flfWKhVy4ZsfQnpJHkDLqQDgoZLF7cxnIeGcI956o2zfYPkVKVnAzFSc-x4iEIjCwPlbLpsWMAjQrTsmliV4rRZD7vfwP_5D0d5t0mu2pkLp2nmaVo0b6AMFOVuAU8mkOeu8afCOVICncZcipS9ZGyHIZzO7dulQ269kziVtmShqcWr7bs54kIkxzgaE89zE&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_61b8s-s8YyCT7p8__3ow9OveM-Zx1bgynRcTASfORz1hSSJqlRK785BteRzoRaZDdNwnVpiK6OivtbKuQa1Y2RuhjtlEJbdtcYJ_5QWbX8hjjyQdJauejzmL0lOYzUJs6F1u4sHbvIlrD1qY2Cfg_vhWogj&sa=X&sqi=2&ved=2ahUKEwjo5KuDmp2VAxWoW-sIHZqKLmEQk8gLegQIHhAB&ictx=1&biw=435&bih=869&dpr=2.48#ebo=1" },
  { label: "전화\n하기",   bg: NAVY,      icon: "📞", url: "tel:02-2039-2872" },
  { label: "길\n찾기",     bg: "#FF6B35", icon: "📍", url: "https://m.place.naver.com/hospital/1834256204/home?entry=pll&bk_query=%EC%84%9C%EC%9A%B8%EB%94%94%EC%95%84%EC%B9%98%EA%B3%BC%EC%9D%98%EC%9B%90" },
];

function hashText(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = Math.imul(31, h) + text.charCodeAt(i) | 0;
  return Math.abs(h);
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function joinSentences(parts: string[]) {
  return parts
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => /[.!?。]$/.test(p) ? p : `${p}.`)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/서울디아치과 서울디아치과/g, "서울디아치과")
    .trim();
}

function trimByStyle(text: string, style: string) {
  const max = style === "짧게" ? 130 : style === "자세하게" ? 260 : 195;
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?。]+[.!?。]/g);
  if (!sentences) return text.slice(0, max).trim();
  let out = "";
  for (const sentence of sentences) {
    const next = `${out} ${sentence}`.trim();
    if (next.length <= max) out = next;
  }
  return out || text.slice(0, max).trim();
}

function findById<T extends { id: string }>(items: T[], ids: string[]) {
  return ids.map(id => items.find(item => item.id === id)).filter(Boolean) as T[];
}

function createKeywordReview({ treats, sats, conveniences, emotions, visit, style }: {
  treats: string[];
  sats: string[];
  conveniences: string[];
  emotions: string[];
  visit: string;
  style: string;
}) {
  const seed = hashText(`${treats.join(",")}-${sats.join(",")}-${conveniences.join(",")}-${emotions.join(",")}-${visit}-${style}-${Date.now()}`);
  const selectedTreatments = findById(TREATMENTS, treats);
  const selectedSats = findById(SATISFACTIONS, sats);
  const selectedConvs = findById(CONVENIENCES, conveniences);
  const selectedEmos = findById(EMOTIONS, emotions);
  const main = selectedTreatments[0] || TREATMENTS[TREATMENTS.length - 1];
  const second = selectedTreatments[1];

  const openers = [
    `마곡역 근처 서울디아치과에서 ${main.id} 진료를 받고 왔습니다`,
    `${main.keyword || "마곡 치과"}를 알아보다가 서울디아치과에 방문했습니다`,
    `마곡 치과를 찾다가 서울디아치과에서 ${main.id} 상담과 진료를 받았습니다`,
    `서울디아치과에서 ${main.id} 관련 진료를 받았는데 전반적으로 편안했습니다`,
    `마곡역 치과를 알아보다 서울디아치과에서 ${main.id} 상담을 받았습니다`,
    `마곡에서 치과를 찾던 중 서울디아치과의 ${main.id} 진료를 경험했습니다`,
  ];

  const visitPhrases: Record<string, string[]> = {
    "처음 방문": [
      "처음 방문이라 긴장했지만 안내가 차분해서 부담이 줄었습니다",
      "첫 방문이었는데 접수부터 상담까지 흐름이 깔끔했습니다",
      "처음 가본 치과였지만 설명을 잘해주셔서 편하게 느껴졌습니다",
      "첫 상담부터 분위기가 차분해서 궁금한 점을 묻기 좋았습니다",
      "처음 방문했는데도 안내가 정돈되어 있어 편안했습니다",
    ],
    "재방문": [
      "재방문했는데 이번에도 안내와 진료 과정이 안정적으로 느껴졌습니다",
      "이전 방문 때의 좋은 기억이 있어 다시 찾았고 이번에도 만족스러웠습니다",
      "재방문이라 더 편하게 진료받을 수 있었고 설명도 꼼꼼했습니다",
      "다시 방문해도 상담과 진료 흐름이 일관되어 신뢰가 갔습니다",
      "재방문하면서도 필요한 부분을 다시 확인해주셔서 좋았습니다",
    ],
  };

  const closings = [
    "마곡역 근처에서 치과를 찾는 분들이라면 참고하기 좋은 곳이라고 느꼈습니다",
    "전체적으로 설명과 응대가 좋아서 다음 진료도 편하게 받을 수 있을 것 같습니다",
    "과하지 않은 안내와 편안한 분위기 덕분에 만족스러운 방문이었습니다",
    "치료 전 걱정이 있었는데 상담과 안내가 꼼꼼해서 좋은 경험으로 남았습니다",
    "마곡 치과를 고민하는 분들에게 자연스럽게 추천하고 싶은 방문이었습니다",
    "설명과 진료 분위기가 안정적이라 앞으로도 편하게 다닐 수 있을 것 같습니다",
    "세심한 상담과 깔끔한 진료 흐름 덕분에 기억에 남는 방문이었습니다",
    "마곡역 주변에서 신뢰감 있는 치과를 찾는 분들에게 도움이 될 것 같습니다",
  ];

  const parts: string[] = [
    pick(openers, seed),
    pick(visitPhrases[visit] || visitPhrases["처음 방문"], seed + 2),
    pick(main.phrases, seed + 5),
  ];

  if (second && style !== "짧게") parts.push(`${second.id} 부분도 함께 상담받을 수 있어 도움이 됐습니다`);

  const brandLimit = style === "짧게" ? 0 : style === "자세하게" ? 2 : 1;
  for (let i = 0; i < brandLimit; i++) {
    parts.push(pick(BRAND_PHRASES, seed + 7 + i));
  }

  const satLimit = style === "짧게" ? 1 : style === "자세하게" ? 3 : 2;
  const convLimit = style === "짧게" ? 1 : style === "자세하게" ? 2 : 1;
  const emoLimit = style === "짧게" ? 1 : style === "자세하게" ? 2 : 1;

  selectedSats.slice(0, satLimit).forEach((item, index) => parts.push(pick(item.phrases, seed + 10 + index)));
  selectedConvs.slice(0, convLimit).forEach((item, index) => parts.push(pick(item.phrases, seed + 20 + index)));
  selectedEmos.slice(0, emoLimit).forEach((item, index) => parts.push(pick(item.phrases, seed + 30 + index)));
  if (style !== "짧게") parts.push(pick(closings, seed + 40));

  return trimByStyle(joinSentences(parts), style);
}

function SectionHeader({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: BLUE, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: BLUE }}>{label}</span>
    </div>
  );
}

function Card({ children, mb = 12 }: { children: ReactNode; mb?: number }) {
  return <div style={{ background: "white", borderRadius: 16, padding: "16px 14px", marginBottom: mb, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>{children}</div>;
}

function Toggle2({ options, value, onChange }: { options: { id: string; label: string; sub?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {options.map(option => {
        const on = value === option.id;
        return (
          <button key={option.id} onClick={() => onChange(option.id)} style={{ padding: "13px 10px", border: `2px solid ${on ? BLUE : BORDER}`, borderRadius: 12, background: on ? LBLUE : "white", cursor: "pointer", textAlign: "left", transition: "all 0.15s", width: "100%" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: on ? BLUE : "#1E293B", marginBottom: option.sub ? 3 : 0 }}>{option.label}</div>
            {option.sub && <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{option.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

function OptionGrid({ options, values, onToggle, columns = 2 }: { options: { id: string; icon: string; label: string }[]; values: string[]; onToggle: (id: string) => void; columns?: 2 | 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns === 3 ? "repeat(3, 1fr)" : "1fr 1fr", gap: 8 }}>
      {options.map(option => {
        const on = values.includes(option.id);
        return (
          <button key={option.id} onClick={() => onToggle(option.id)} style={{ padding: columns === 3 ? "12px 6px 10px" : "12px 10px", border: `2px solid ${on ? BLUE : BORDER}`, borderRadius: 12, background: on ? LBLUE : "white", cursor: "pointer", display: "flex", flexDirection: columns === 3 ? "column" : "row", alignItems: "center", justifyContent: columns === 3 ? "center" : "flex-start", gap: columns === 3 ? 6 : 8, transition: "all 0.15s", width: "100%", minWidth: 0 }}>
            <span style={{ fontSize: columns === 3 ? 22 : 18, lineHeight: 1, flexShrink: 0 }}>{option.icon}</span>
            <span style={{ fontSize: columns === 3 ? 11.5 : 13, fontWeight: on ? 700 : 500, color: on ? BLUE : "#374151", whiteSpace: "pre-line", lineHeight: 1.3, textAlign: columns === 3 ? "center" : "left", width: "100%", wordBreak: "keep-all" }}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Spinner({ color = "white" }: { color?: string }) {
  return <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2.5px solid ${color === "white" ? "rgba(255,255,255,0.3)" : "#E2E8F0"}`, borderTopColor: color, animation: "_spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />;
}

export default function App() {
  const [mode, setMode] = useState<"AUTO" | "SELF">("AUTO");
  const [visit, setVisit] = useState("처음 방문");
  const [style, setStyle] = useState("자연스럽게");
  const [treats, setTreats] = useState<string[]>([]);
  const [sats, setSats] = useState<string[]>([]);
  const [convs, setConvs] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [selfTxt, setSelfTxt] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");

  const toggle = (arr: string[], set: (v: string[]) => void, value: string) => set(arr.includes(value) ? arr.filter(item => item !== value) : [...arr, value]);

  const generate = () => {
    if (treats.length === 0) { setErr("치료 항목을 하나 이상 선택해주세요."); return; }
    if (sats.length + convs.length + emotions.length === 0) { setErr("좋았던 점, 편의사항, 걱정 포인트 중 하나 이상 선택해주세요."); return; }
    setErr("");
    setLoading(true);
    setReview("");
    window.setTimeout(() => {
      setReview(createKeywordReview({ treats, sats, conveniences: convs, emotions, visit, style }));
      setLoading(false);
    }, 350);
  };

  const copy = async () => {
    const text = mode === "SELF" ? selfTxt : review;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const displayText = mode === "SELF" ? selfTxt : review;

  return (
    <>
      <GlobalStyle />
      <div style={{ fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif", background: BG, minHeight: "100vh", width: "100%", maxWidth: 430, margin: "0 auto", paddingBottom: 90 }}>
        <div style={{ background: "white", textAlign: "center", padding: "28px 20px 22px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 64, height: 64, background: LBLUE, borderRadius: "50%", fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>🦷</div>
          <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.5 }}>서울디아치과</h1>
          <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.65 }}>선택만 하면<br />더 다양한 리뷰 문장을 만들어 드립니다</p>
        </div>

        <div style={{ padding: "16px 12px 0" }}>
          <Card>
            <SectionHeader n={1} label="작성방식" />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>리뷰를 어떻게 작성할까요?</p>
            <Toggle2 options={[{ id: "AUTO", label: "키워드 조합", sub: "선택만으로 자동 작성" }, { id: "SELF", label: "직접 입력", sub: "내가 직접 작성" }]} value={mode} onChange={v => setMode(v as "AUTO" | "SELF")} />
          </Card>

          <Card>
            <SectionHeader n={2} label="방문유형" />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>이번 방문은 어떤 형태였나요?</p>
            <Toggle2 options={[{ id: "처음 방문", label: "처음 방문", sub: "첫 진료·상담" }, { id: "재방문", label: "재방문", sub: "다시 방문" }]} value={visit} onChange={setVisit} />
          </Card>

          {mode === "AUTO" && (
            <>
              <Card>
                <SectionHeader n={3} label="문장 길이" />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>어느 정도 길이로 만들까요?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {["짧게", "자연스럽게", "자세하게"].map(item => {
                    const on = style === item;
                    return <button key={item} onClick={() => setStyle(item)} style={{ padding: "12px 4px", border: `2px solid ${on ? BLUE : BORDER}`, borderRadius: 12, background: on ? LBLUE : "white", color: on ? BLUE : "#1E293B", fontSize: 13, fontWeight: on ? 700 : 500, cursor: "pointer", width: "100%" }}>{item}</button>;
                  })}
                </div>
              </Card>

              <Card>
                <SectionHeader n={4} label="치료선택" />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 10 }}>어떤 치료를 받으셨나요?</p>
                <OptionGrid options={TREATMENTS} values={treats} onToggle={id => toggle(treats, setTreats, id)} columns={3} />
              </Card>

              <Card>
                <SectionHeader n={5} label="좋았던 점" />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>어떤 점이 좋으셨나요?</p>
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>1~3개 정도 선택하면 자연스럽습니다</p>
                <OptionGrid options={SATISFACTIONS} values={sats} onToggle={id => toggle(sats, setSats, id)} columns={2} />
              </Card>

              <Card>
                <SectionHeader n={6} label="편의·분위기" />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>방문하면서 좋았던 부분은요?</p>
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>위치, 예약, 분위기 관련 키워드입니다</p>
                <OptionGrid options={CONVENIENCES} values={convs} onToggle={id => toggle(convs, setConvs, id)} columns={2} />
              </Card>

              <Card>
                <SectionHeader n={7} label="걱정 포인트" />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>진료 전 어떤 점이 걱정되셨나요?</p>
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>선택하면 더 실제 후기처럼 자연스러워집니다</p>
                <OptionGrid options={EMOTIONS} values={emotions} onToggle={id => toggle(emotions, setEmotions, id)} columns={2} />
              </Card>
            </>
          )}

          {err && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "10px 14px", color: "#DC2626", fontSize: 13, marginBottom: 12 }}>⚠️ {err}</div>}

          {mode === "AUTO" && <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "16px 0", background: loading ? "#93C5FD" : `linear-gradient(135deg,${NAVY} 0%,${BLUE} 100%)`, color: "white", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 12, letterSpacing: -0.3, boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.28)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{loading ? <><Spinner /> 리뷰 만드는 중...</> : "✨ 자연스러운 리뷰 만들기"}</button>}

          {(mode === "SELF" || review || loading) && (
            <div style={{ background: "white", borderRadius: 16, padding: "16px 14px", marginBottom: 12, border: `1px solid ${BORDER}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>{[1, 2, 3, 4, 5].map(i => <span key={i} style={{ fontSize: 22, color: GOLD }}>★</span>)}</div>
              {mode === "SELF" ? (
                <>
                  <p style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 8 }}>실제 방문 경험을 바탕으로 직접 입력해 주세요.</p>
                  <textarea value={selfTxt} onChange={e => setSelfTxt(e.target.value)} placeholder="방문 경험을 자유롭게 작성해주세요..." style={{ width: "100%", minHeight: 120, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, lineHeight: 1.7, color: "#1E293B", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box", display: "block" }} />
                  {selfTxt && <p style={{ textAlign: "right", fontSize: 11.5, color: "#94A3B8", marginTop: 4 }}>{selfTxt.replace(/\s/g, "").length}자</p>}
                </>
              ) : loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 14, minHeight: 60 }}><Spinner color="#94A3B8" /> 리뷰 문장을 만들고 있어요...</div>
              ) : review ? (
                <>
                  <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "5px 10px", display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 10 }}><span style={{ fontSize: 11, color: BLUE, fontWeight: 600 }}>✨ 생성된 리뷰 문장</span></div>
                  <p style={{ color: "#1E293B", fontSize: 14.5, lineHeight: 1.85, wordBreak: "keep-all", whiteSpace: "pre-wrap" }}>{review}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 11.5, color: "#94A3B8" }}>{review.replace(/\s/g, "").length}자</span>
                    <button onClick={generate} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#64748B", cursor: "pointer", fontWeight: 500 }}>🔄 다시 만들기</button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {displayText && <button onClick={copy} style={{ width: "100%", padding: "16px 0", background: copied ? "#16A34A" : `linear-gradient(135deg,${NAVY} 0%,${BLUE} 100%)`, color: "white", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10, letterSpacing: -0.3, boxShadow: "0 4px 16px rgba(37,99,235,0.28)", transition: "background 0.25s" }}>{copied ? "✓ 복사되었습니다!" : "📋 문구 복사하기"}</button>}

          <p style={{ fontSize: 11.5, color: "#94A3B8", textAlign: "center", lineHeight: 1.6, padding: "4px 0 8px" }}>※ 생성된 문장은 참고용 예시입니다. 실제 경험에 맞게 수정 후 사용해주세요.</p>
        </div>

        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: `1px solid ${BORDER}`, padding: "10px 12px 20px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, boxShadow: "0 -4px 20px rgba(0,0,0,0.07)", zIndex: 999, maxWidth: 430, margin: "0 auto", paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}>
          {NAV_BTNS.map(button => <a key={button.label} href={button.url} target={button.url.startsWith("tel") ? "_self" : "_blank"} rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 4px", background: BG, borderRadius: 12, textDecoration: "none" }}><div style={{ width: 38, height: 38, background: button.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 800 }}>{button.icon}</div><span style={{ color: "#374151", fontSize: 11, fontWeight: 500, textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-line" }}>{button.label}</span></a>)}
        </nav>
      </div>
    </>
  );
}

function GlobalStyle() {
  return <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; max-width: 100vw; overflow-x: hidden; background: #F8FAFC; -webkit-text-size-adjust: 100%; }
    button, a, textarea, input { font-family: inherit; -webkit-tap-highlight-color: transparent; }
    @keyframes _spin { to { transform: rotate(360deg); } }
  `}</style>;
}
