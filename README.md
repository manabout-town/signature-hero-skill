# signature-hero — 핵심 품목을 직접 만지는 인트로 + 히어로 (Claude Code 스킬)

웹사이트 첫 화면을 **"그 사이트의 심장 같은 품목을 직접 만져보는 장면"** 으로 만든다.
선·로딩바 장식 대신 배경과 상품이 주인공이고, 누르기·끌기·탭·타이핑에 반응한다.

- 인트로: 조작할수록 진행되고(가만히 있어도 자동 진행), 끝나면 물건이 움직이며 페이지가 열림
- 히어로: 같은 물건이 배경을 채우고 커서·탭·실제 입력에 계속 반응
- 레퍼런스 1호: 키보드몰 KEYFORGE — 키캡 8개 인트로 + 기울어진 입체 키보드 히어로 + 합성 타건음
- 업종별 설계표: 도자기(물레)·스킨케어(세럼 방울)·카페·꽃집·와인·패션·베이커리·치과·자동차·굿즈

## 설치
```bash
git clone https://github.com/manabout-town/signature-hero-skill.git
cd signature-hero-skill && ./install.sh     # → ~/.claude/skills/signature-hero
```
분위기형 배경(조작 없음)은 자매 스킬 [breathing-light](https://github.com/manabout-town/breathing-light-skill).

## 구성
```
skill/signature-hero/
├── SKILL.md                     심장 품목 찾기 → 장면 설계 → 구현 방식 → 검증
├── assets/keyboard/             레퍼런스 1호 코드 (css · js · markup)
├── references/
│   ├── archetypes.md            업종별 품목 · 인트로 조작 · 히어로 반응 표
│   ├── keyboard.md              레퍼런스 1호 해설
│   └── pitfalls.md              실제로 밟은 함정 13개
└── scripts/verify.mjs           폭별 인트로·히어로 · reduced-motion 검사 (playwright)
```
