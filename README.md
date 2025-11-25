# VersionFlow

문서 **버전·승인·이력**을 한 번에 관리하는 웹 기반 형상관리 시스템입니다.  
코드만 버전관리하지 않습니다. **요구사항, 설계서, 보고서**까지 품질과 추적성을 확보하세요.

- **Live**: https://versionflow.org
- **Project type**: 네트워크 프로그래밍 팀 프로젝트 (2인, 4주)


---

## 핵심 기능

- **프로젝트 단위 문서 관리**: 프로젝트 생성 시 관리자 설정/버전 규칙 템플릿 자동 부여  
- **문서 업로드 & 웹 편집**: DOCX/HWP 등 업로드, 웹 에디터 연동(저장 시 자동 버전 생성)  
- **버전 관리 & Diff 비교**: 커밋 메시지, 과거 버전 복원(Rollback)
- **승인 워크플로우**: *팀장 → 부장* 다단계 승인/반려, 의견 및 서명 기록  
- **로그 & 알림**: 커밋/승인/반려/복원 전 과정의 활동 로그, 알림센터 제공  
- **권한 제어 & 검색**: 역할 기반 접근제어, 작성자/상태/버전 필터 검색

---

## 아키텍처 개요

Three-tier 구조로 구성됩니다.

```
[Client (React + Tailwind)]
        ⇅ REST API / OAuth
[Server (Node.js + Express)]
        ⇅ Mongoose
[MongoDB (Atlas)]
      ↘ LibreOffice (CLI 변환: HWP/DOCX → PDF)
      ↘ Google OAuth 2.0 (로그인)
```

- 클라이언트: 문서 편집/업로드/승인 요청 및 이력/알림 UI  
- 서버: 인증(JWT+Google OAuth), 버전 생성·Diff·승인 로직, 로그/알림  
- 데이터베이스: users/projects/documents/versions/logs/notifications

---


## Tech Stack

- **Frontend**: React, Tailwind, React Router, Axios
- **Backend**: Node.js, Express, Mongoose, Multer, JWT, Google OAuth 2.0  
- **DB**: MongoDB
- **Docs 변환**: LibreOffice (headless CLI)  
- **Ops/Tools**: GitHub, GitAction, Postman, NGINX

---

## API 개요(요약)

[VersionFlow API](https://www.postman.com/versionflow/versionflow/api/c99d82ee-7721-4f6a-b70a-f7d9c1c107b9)


---

## 빠른 시작

### 1) 요구사항
- Node.js ≥ 18, npm  
- MongoDB (Atlas 또는 로컬)  
- LibreOffice 설치(헤드리스 변환 지원)

### 2) 환경 변수
**Server (.env)**
```
PORT=8080
MONGODB_URI=...
JWT_SECRET=...
SESSION_SECRET=...
CLIENT_URL=http://localhost:8080
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
FILE_STORAGE_DIR=./uploads
```

**Client (.env)**
```
VITE_API_BASE_URL=http://localhost:443
VITE_KAKAO_CLIENT_ID=...
```

### 3) 설치 & 실행
```bash
# client
cd frontend
npm install
npm run dev

# backend
cd backend
npm install
npm run dev

```

---

## 문서 변환(LibreOffice)

서버는 업로드된 문서를 필요 시 다음과 같이 변환합니다.
```bash
libreoffice --headless --convert-to pdf ./uploads/input.hwp --outdir ./converted
```
Node.js에서는 `child_process.exec`로 호출합니다.
