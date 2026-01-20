# CLAUDE.md - Project Context for Claude Code

## 📌 프로젝트 개요

**프로젝트명:** Trend Radar (트렌드 레이더)  
**목적:** 스레드(Threads), 인스타그램, 구글 트렌드, 유튜브의 데이터를 분석하여 "지금 뜨는 트렌드"와 "떡상 조짐"이 보이는 키워드를 시각화하는 대시보드 서비스

**핵심 가치:**
- 급상승 키워드/콘텐츠 조기 탐지
- 직관적인 트렌드 시각화
- 실시간 데이터 기반 인사이트 제공

---

## 🛠 기술 스택

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| Framework | Next.js (App Router) | 16.1.1 |
| Language | TypeScript (Strict) | ^5 |
| React | React | 19.2.3 |
| Styling | Tailwind CSS | ^4 |
| UI Components | Shadcn/ui + Radix UI | latest |
| Charts | Recharts | 3.6.0 |
| AI/LLM | Google Generative AI (Gemini) | ^0.24.1 |
| Trends API | google-trends-api | 4.9.2 |
| RSS | rss-parser | 3.13.0 |

---

## 📁 디렉토리 구조

```
thread_trend_radar/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 메인 대시보드
│   ├── rising/            # 급상승 트렌드 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/
│   ├── ui/                # Shadcn/ui 컴포넌트 (button, card, badge 등)
│   ├── app-sidebar.tsx    # 사이드바 네비게이션
│   ├── mobile-nav.tsx     # 모바일 네비게이션
│   ├── trend-dashboard.tsx # 트렌드 대시보드 메인
│   └── rising-table.tsx   # 급상승 키워드 테이블
├── hooks/                 # Custom React Hooks
├── lib/
│   ├── utils.ts          # cn() 등 유틸리티 함수
│   └── [API 로직 파일들]
├── types/
│   └── trend.ts          # TrendItem 등 타입 정의
├── scripts/              # 크롤링/데이터 수집 스크립트
└── public/               # 정적 파일
```

---

## 🎯 핵심 기능 (MVP Scope)

### 1. 트렌드 대시보드
- 급상승 키워드 Top 10 표시
- 관련 게시글 요약 카드
- 실시간 업데이트 UI

### 2. 트렌드 스코어링 알고리즘
```typescript
// Velocity(속도) 기반 점수 계산
const velocity = (likes + comments) / timeSincePosted;
const trendScore = velocity * engagementRate * viralCoefficient;
```

### 3. 상세 분석 뷰
- 키워드별 긍/부정 감정 분석 (Gemini API)
- 원본 게시글 리스트
- 시간대별 트렌드 그래프

---

## 📜 코딩 컨벤션

### 필수 원칙
1. **Server Components 우선** - 클라이언트 컴포넌트는 `"use client"` 명시
2. **Server Actions 활용** - API 라우트 대신 Server Actions 사용
3. **TypeScript Strict** - any 타입 사용 금지, 명시적 타입 정의
4. **한국어 주석** - 복잡한 로직에는 한국어 주석 필수

### 네이밍 규칙
- 컴포넌트: PascalCase (`TrendDashboard.tsx`)
- 함수/변수: camelCase (`calculateVelocity`)
- 타입/인터페이스: PascalCase (`TrendItem`)
- 상수: UPPER_SNAKE_CASE (`API_RATE_LIMIT`)

### Import 순서
```typescript
// 1. React/Next.js
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. 외부 라이브러리
import { Flame } from "lucide-react";

// 3. 내부 컴포넌트 (@/ alias)
import { Button } from "@/components/ui/button";
import { TrendItem } from "@/types/trend";

// 4. 상대 경로
import { calculateScore } from "./utils";
```

---

## 🔧 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 린트 검사
npm run lint

# Shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]
```

---

## 🔌 API 연동 가이드

### Google Trends API
```typescript
import googleTrends from 'google-trends-api';

// 실시간 트렌드 조회
const trends = await googleTrends.dailyTrends({
  geo: 'KR',
  trendDate: new Date(),
});
```

### Google Gemini API
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// 감정 분석 예시
const result = await model.generateContent(`
  다음 텍스트의 감정을 분석해주세요: "${text}"
`);
```

### 환경 변수 (.env.local)
```env
GEMINI_API_KEY=your_gemini_api_key
# 추후 추가 예정
YOUTUBE_API_KEY=your_youtube_api_key
```

---

## ⚠️ 현재 이슈 및 TODO

### 🚨 긴급 (빌드 블로커)
- [x] `@/components/ui/progress` 누락 → ✅ 해결됨
- [x] `@/components/ui/table` 누락 → ✅ 해결됨
- [x] `useSearchParams()` Suspense boundary 에러 → ✅ app/page.tsx에 Suspense 추가

### 📋 단기 TODO
- [ ] 트렌드 스코어링 알고리즘 구현
- [ ] Google Trends API 실제 연동
- [ ] Mock Data → 실제 데이터 전환
- [ ] 에러 핸들링 강화 (API 실패 시 fallback)

### 🎯 중기 TODO
- [x] YouTube Data API 연동 → ✅ 완료 (lib/youtube.ts, app/actions/youtube.ts)
- [x] 떡상 조짐 탐지 알고리즘 고도화 → ✅ velocityScore, engagementRate, trendScore 구현
- [x] 캐싱 전략 수립 (API Rate Limit 대응) → ✅ lib/cache.ts (30분 TTL)
- [ ] 대시보드 UI/UX 개선

---

## 🧪 테스트 체크리스트

빌드/배포 전 확인:
```bash
# 1. 린트 통과
npm run lint

# 2. 빌드 성공
npm run build

# 3. 로컬 실행 확인
npm run dev
# → http://localhost:3000 접속하여 UI 확인
```

---

## 📝 Git 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 스타일/포맷팅 변경
docs: 문서 수정
chore: 빌드/설정 변경
```

예시:
```bash
git commit -m "feat: 트렌드 스코어링 알고리즘 구현"
git commit -m "fix: add missing shadcn/ui components (progress, table)"
```

---

## 🚀 배포 정보

- **배포 환경:** (추후 설정 - Vercel 권장)
- **브랜치 전략:** main (프로덕션)

---

## 💡 Claude Code 작업 시 주의사항

1. **Shadcn/ui 컴포넌트 추가 시** 반드시 `npx shadcn@latest add` 사용
2. **API 호출 로직**은 Server Actions 또는 `lib/` 폴더에 분리
3. **타입 정의**는 `types/` 폴더에 중앙 관리
4. **에러 발생 시** build_log 파일로 저장하여 디버깅
5. **작업 완료 후** 반드시 `npm run build` 테스트 후 commit/push

---

## 📞 참고 링크

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Google Trends API](https://www.npmjs.com/package/google-trends-api)
- [Gemini API](https://ai.google.dev/docs)