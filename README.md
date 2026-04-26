# StoryForge

소설가, 웹소설 작가, OC 제작자 등 창작자를 위한 **올인원 설정집** 플랫폼.
백엔드가 필요 없는 순수 HTML/CSS/JS — **GitHub Pages** 에 그대로 올리면 작동합니다.

---

## 🚀 GitHub Pages 배포 방법 (초간단)

1. GitHub 에서 **새 저장소** 를 만듭니다 (예: `storyforge`).
2. 이 폴더(`storyforge`) **안의 파일들** 을 저장소 **루트** 에 업로드.
   * 즉, `index.html`, `dashboard.html`, `css/`, `js/`, `.nojekyll` 가 저장소 최상단에 보여야 합니다.
   * (`storyforge` 폴더째 올리면 URL 이 `/storyforge/index.html` 가 되어 동작은 하지만 한 단계 더 들어가게 됩니다.)
3. 저장소 → **Settings → Pages**
   * **Source: Deploy from a branch**
   * **Branch: `main` / `/ (root)`** → Save
4. 1~2 분 후 `https://<유저명>.github.io/<레포명>/` 으로 접속.

> `.nojekyll` 파일은 GitHub Pages 가 폴더/파일을 임의로 가리지 않도록 막아 줍니다. 꼭 같이 올리세요.

---

## 📦 들어 있는 파일

```
index.html          로그인 / 회원가입 (랜딩)
dashboard.html      내 프로젝트 목록
project.html        프로젝트 홈 (정보·장르·요약)
character.html      등장인물 카드 + 상세 편집
relations.html      인물 관계 그래프 (라이벌/동료/연인…)
family-tree.html    가계도 / 조직도 / 능력 트리 (드래그 & 연결)
world.html          세계관 설정 (지역·종족·체계…)
timeline.html       사건 타임라인
items.html          아이템 / 능력 도감
gallery.html        영감 / 이미지 보드
editor.html         마크다운 + HTML 에디터
settings.html       테마·폰트·색상·계정·백업
css/style.css       스타일 (다크/라이트/세피아 테마)
js/storage.js       데이터 계층 (localStorage)
js/sidebar.js       공용 사이드바 + 인증 가드
js/markdown.js      마크다운 렌더러 (표 / 임베드 지원)
.nojekyll           GitHub Pages 호환 설정
```

## ✨ 기능 한눈에 보기

* **계정 시스템** — 회원가입 / 로그인 (브라우저 로컬 저장)
* **다중 프로젝트** — 작품별로 데이터 완전 분리
* **등장인물** — 외모, 성격, 능력, 배경, 태그, 이미지 (URL 또는 업로드)
* **관계 그래프** — 인물끼리 라이벌/연인/멘토 등 라벨로 자유 연결
* **가계도/조직도** — 노드 드래그 + 클릭 연결, 가족·조직·능력트리 구분
* **세계관** — 자유 항목 (마크다운/HTML)
* **타임라인** — 사건·연표 정렬
* **아이템 도감** — 무기·스킬·유물 등 카드형 정리
* **영감 보드** — 참고 이미지 보드 (URL/업로드)
* **에디터** — 마크다운, HTML, 표, iframe 임베드, 이미지
* **자유 장르 태그** — 헌터물·능력물·로판 등 직접 추가
* **테마** — 다크 / 라이트 / 세피아
* **폰트** — Noto Sans KR · Serif · Gowun Dodum · Gaegu · Nanum 펜·명조 · Black Han Sans (모두 무료)
* **JSON 백업/복원** — 다른 브라우저로 옮길 때

## ⚠️ 중요 안내

* 모든 데이터는 **사용자 브라우저의 localStorage** 에 저장됩니다.
* 브라우저 데이터 삭제 / 시크릿 모드 종료 시 사라질 수 있어요. **설정 → 백업** 으로 자주 내보내세요.
* 진짜 다중 사용자 서비스(서버 인증)가 아닌, 1인용 / 개인 작업실 용도입니다.
