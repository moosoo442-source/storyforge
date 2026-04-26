# StoryForge

창작자(소설/웹소설 작가, OC 제작자 등)를 위한 올인원 설정집 플랫폼.
순수 HTML/CSS/JS 로 만들어졌으며 **GitHub Pages** 에 그대로 올리면 동작합니다.

## 주요 기능
- 로컬 계정 시스템 (localStorage 기반, 백엔드 불필요)
- 다중 프로젝트 관리 (작품별로 설정 분리)
- 등장인물 카드 + 상세 설정 + 이미지 업로드
- 가계도 / 조직도 (드래그 & 드롭, 자유 연결)
- 세계관 설정 (장르 자유 생성: 판타지/헌터물/능력물 등)
- 타임라인 (사건·연표)
- 마크다운 + HTML + 표 에디터
- 테마 / 폰트 / 색상 커스터마이즈 (저작권 프리 Google Fonts)
- 외부 사이트 / 이미지 / 영상 임베드
- JSON 백업 & 복원

## 배포 방법 (GitHub Pages)
1. 새 GitHub 저장소를 만들고 이 폴더의 모든 파일을 업로드합니다.
2. 저장소 **Settings → Pages → Branch: `main` / root** 선택 후 저장.
3. 잠시 후 `https://<유저이름>.github.io/<레포이름>/` 으로 접속.

## 파일 구조
```
index.html          랜딩 / 로그인 / 회원가입
dashboard.html      내 프로젝트 목록
project.html        프로젝트 메인 (모든 하위 메뉴)
character.html      등장인물 상세 편집
family-tree.html    가계도 / 조직도 / 능력 트리
world.html          세계관 설정
timeline.html       타임라인
editor.html         마크다운 / HTML 에디터
settings.html       계정 / 테마 / 백업
css/                스타일
js/                 로직
```

## 주의
- 모든 데이터는 사용자 브라우저의 localStorage 에 저장됩니다.
- 다른 기기에서 보려면 `설정 → 백업` 으로 JSON 을 내보낸 뒤 가져오세요.
