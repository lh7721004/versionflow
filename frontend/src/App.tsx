import { useEffect, useMemo, useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectDetail } from './components/ProjectDetail';
import { DocumentEditor } from './components/DocumentEditor';
import { ApprovalProcess } from './components/ApprovalProcess';
import { VersionHistory } from './components/VersionHistory';
import { AdminSettings } from './components/AdminSettings';
import { VersionPolicy } from './components/VersionPolicy';
import { DocumentVersions } from './components/DocumentVersions';
import { FileUpload } from './components/FileUpload';
import { GlobalFileUpload } from './components/GlobalFileUpload';
import { ApprovalManagement } from './components/ApprovalManagement';
import { Toaster } from './components/ui/sonner';
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useMe } from "./queries/useMe";

type Page = 
  | 'login'
  | 'dashboard' 
  | 'project-detail'
  | 'editor'
  | 'approval'
  | 'history'
  | 'projects'
  | 'approvals'
  | 'logs'
  | 'settings'
  | string;
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userName] = useState('김철수');
  const [selectedDocument, setSelectedDocument] = useState<{ name: string; id: string } | null>(null);
  const [uploadFolder, setUploadFolder] = useState<{ name: string; id: string } | null>(null);
  const [isGlobalUploadOpen, setIsGlobalUploadOpen] = useState(false);
  const [isApprovalManagementOpen, setIsApprovalManagementOpen] = useState(false);
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useMe();
  // -----------------------
  // 로그인 / 로그아웃
  // -----------------------
  const handleLogin = () => {
    const clientId = (import.meta as any).env?.VITE_KAKAO_CLIENT_ID;
    const redirectUri = (import.meta as any).env?.VITE_KAKAO_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      console.error('Kakao env is missing');
      return;
    }
    const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;
    // window.location.href = kakaoAuthUrl;
    window.open(kakaoAuthUrl);
  };
  
  const handleGoogleLogin = () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = (import.meta as any).env?.VITE_GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      console.error('Google env is missing');
      return;
    }
    const scope = encodeURIComponent('openid profile email');
    const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=${scope}`;
    window.location.href = googleAuthUrl;
  };
  
  const handleLogout = () => {
    setSelectedDocument(null);
    setUploadFolder(null);
    navigate('/login');
  };
  useEffect(()=>{
    console.log(userData);
  },[userData])
  
  // -----------------------
  // 사이드바에서 페이지 이동
  // page 인자로 'projects', 'approvals' 같은 문자열이 온다고 가정
  // -----------------------
  const handleNavigate = (page: string) => {
    const path = page.startsWith('/') ? page : `/${page}`;
    navigate(path);
  };

  // -----------------------
  // 각 컴포넌트에서 호출하는 이동 함수들
  // -----------------------
  const handleNavigateToProject = (projectId: string) => {
    // 나중에 /projects/:projectId 로 바꾸고 싶으면 여기서 처리
    navigate('/project-detail');
  };

  const handleNavigateToEditor = (docId: string) => {
    navigate('/editor');
  };

  const handleNavigateToApproval = (docId: string) => {
    navigate('/approval');
  };

  const handleNavigateToHistory = (docId: string) => {
    navigate('/history');
  };

  const handleBack = () => {
    navigate('/project-detail');
  };

  const handleCommit = () => {
    navigate('/approval');
  };

  const handleDocumentClick = (documentName: string, documentId: string) => {
    setSelectedDocument({ name: documentName, id: documentId });
    navigate('/document-versions');
  };

  const handleBackFromVersions = () => {
    setSelectedDocument(null);
    navigate('/project-detail');
  };

  const handleViewVersion = (versionId: string) => {
    navigate('/editor');
  };

  const handleEditVersion = (versionId: string) => {
    navigate('/editor');
  };

  const handleCompareVersion = (versionId: string) => {
    navigate('/history');
  };

  const handleUploadClick = (folderName: string, folderId: string) => {
    setUploadFolder({ name: folderName, id: folderId });
    navigate('/file-upload');
  };

  const handleBackFromUpload = () => {
    setUploadFolder(null);
    navigate('/project-detail');
  };

  const handleGlobalUploadClick = () => {
    setIsGlobalUploadOpen(true);
  };

  const handleApprovalManagementClick = () => {
    navigate('/approval-management');
  };

  const displayName = useMemo(() => {
    if (!userData) return '';
    const user = (userData as any)?.data ?? (userData as any) ?? {};
    return user.name || user.email || '';
  }, [userData]);

  if (isUserLoading) return null;
  if (isUserError || !userData) {
    if (location.pathname !== '/login') {
      navigate('/login');
      return null;
    }
    return (
      <>
        <LoginPage onKakaoLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
        <Toaster />
      </>
    );
  }

  // -----------------------
  // 로그인 된 이후 화면
  // -----------------------
  return (
    <div className="h-screen flex flex-col">
      <Navbar userName={displayName} isVisible={location.pathname!=='/login'} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          // 현재 페이지를 pathname 기반으로 넘길 수 있음
          // location.pathname이 '/', '/dashboard', '/projects' 이런 값
          currentPage={location.pathname.replace('/', '') || 'dashboard'}
          isVisible={location.pathname!=='/login'}
          onNavigate={handleNavigate}
          onDocumentClick={handleDocumentClick}
          onUploadClick={handleUploadClick}
          onGlobalUploadClick={handleGlobalUploadClick}
          onApprovalManagementClick={handleApprovalManagementClick}
        />

        <main className="flex-1 overflow-hidden">
          <Routes>
            {/* 기본 대시보드 */}
            <Route
              path="/"
              element={<Dashboard onNavigateToProject={handleNavigateToProject} />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard onNavigateToProject={handleNavigateToProject} />}
            />
            {/* 로그인 화면 */}
            <Route
              path="/login"
              element={<>
                        <LoginPage onKakaoLogin={handleLogin} onGoogleLogin={handleGoogleLogin}/>
                        <Toaster />
                      </>}
            />

            {/* 프로젝트 상세 */}
            <Route
              path="/project-detail"
              element={
                <ProjectDetail
                  onNavigateToEditor={handleNavigateToEditor}
                  onNavigateToApproval={handleNavigateToApproval}
                  onNavigateToHistory={handleNavigateToHistory}
                />
              }
            />

            {/* 문서 버전 목록 */}
            <Route
              path="/document-versions"
              element={
                selectedDocument ? (
                  <DocumentVersions
                    documentName={selectedDocument.name}
                    onBack={handleBackFromVersions}
                    onViewVersion={handleViewVersion}
                    onEditVersion={handleEditVersion}
                    onCompareVersion={handleCompareVersion}
                  />
                ) : (
                  <Navigate to="/project-detail" replace />
                )
              }
            />

            {/* 폴더별 업로드 */}
            <Route
              path="/file-upload"
              element={
                uploadFolder ? (
                  <FileUpload
                    folderName={uploadFolder.name}
                    folderId={uploadFolder.id}
                    onBack={handleBackFromUpload}
                  />
                ) : (
                  <Navigate to="/project-detail" replace />
                )
              }
            />

            {/* 에디터 / 승인 / 히스토리 */}
            <Route
              path="/editor"
              element={<DocumentEditor onBack={handleBack} onCommit={handleCommit} />}
            />
            <Route
              path="/approval"
              element={<ApprovalProcess onBack={handleBack} />}
            />
            <Route
              path="/history"
              element={<VersionHistory onBack={handleBack} />}
            />

            {/* 단순 텍스트 페이지들 */}
            <Route
              path="/projects"
              element={
                <div className="p-8">
                  <h1>프로젝트 목록</h1>
                  <p className="text-muted-foreground mt-2">
                    전체 프로젝트를 관리하는 페이지입니다.
                  </p>
                </div>
              }
            />
            <Route
              path="/approvals"
              element={
                <div className="p-8">
                  <h1>승인 대기</h1>
                  <p className="text-muted-foreground mt-2">
                    승인이 필요한 문서 목록입니다.
                  </p>
                </div>
              }
            />
            <Route
              path="/logs"
              element={
                <div className="p-8">
                  <h1>활동 로그</h1>
                  <p className="text-muted-foreground mt-2">
                    모든 활동 내역을 확인할 수 있습니다.
                  </p>
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-8">
                  <h1>설정</h1>
                  <p className="text-muted-foreground mt-2">
                    시스템 설정 및 환경을 관리합니다.
                  </p>
                </div>
              }
            />

            {/* 관리용 페이지 */}
            <Route path="/approval-management" element={<ApprovalManagement />} />
            <Route path="/admin/:id" element={<AdminSettings />} />
            <Route path="/version-policy" element={<VersionPolicy />} />

            {/* 잘못된 주소 → 대시보드로 */}
            {/* <Route path="*" element={<Navigate to="/sdf" replace />} /> */}
          </Routes>
        </main>
      </div>

      {/* Global File Upload Dialog */}
      <GlobalFileUpload
        open={isGlobalUploadOpen}
        onOpenChange={setIsGlobalUploadOpen}
      />

      <Toaster />
    </div>
  );
}
