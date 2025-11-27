import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  MessageSquare,
  FolderOpen,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface CommitRequest {
  id: string;
  projectName: string;
  folderPath: string;
  fileName: string;
  fileType: string;
  commitMessage: string;
  author: string;
  authorInitials: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  fileSize: string;
  previewContent?: string;
}

export function ApprovalManagement() {
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // 목업 커밋 요청 데이터
  const [commitRequests, setCommitRequests] = useState<CommitRequest[]>([
    {
      id: 'commit-1',
      projectName: '신제품 개발 문서',
      folderPath: '/요구사항',
      fileName: '기능명세서_v2.docx',
      fileType: 'document',
      commitMessage: '사용자 인증 기능 요구사항 추가',
      author: '김철수',
      authorInitials: '김철',
      requestDate: '2025-11-13 10:30',
      status: 'pending',
      fileSize: '2.4 MB',
      previewContent: `# 사용자 인증 기능 요구사항

## 1. 개요
본 문서는 신제품에 적용될 사용자 인증 기능의 요구사항을 정의합니다.

## 2. 주요 기능

### 2.1 로그인
- 이메일/비밀번호 기반 로그인
- 소셜 로그인 (Google, Kakao, Naver)
- 2단계 인증 (OTP)
- 자동 로그인 옵션

### 2.2 회원가입
- 이메일 인증 필수
- 비밀번호 강도 검증
- 약관 동의 처리
- 본인 인증 (선택사항)

### 2.3 비밀번호 관리
- 비밀번호 찾기 (이메일 인증)
- 비밀번호 변경
- 비밀번호 만료 정책 (90일)

## 3. 보안 요구사항
- HTTPS 통신 필수
- 비밀번호 암호화 (bcrypt)
- JWT 토큰 기반 세션 관리
- CSRF 방어
- Rate Limiting 적용

## 4. 비기능 요구사항
- 응답시간: 1초 이내
- 동시 접속자: 10,000명 이상 지원
- 가용성: 99.9% 이상`,
    },
    {
      id: 'commit-2',
      projectName: 'ERP 시스템 개발',
      folderPath: '/설계',
      fileName: 'DB스키마_v3.xlsx',
      fileType: 'spreadsheet',
      commitMessage: '주문 테이블 컬럼 추가 및 인덱스 최적화',
      author: '박영희',
      authorInitials: '박영',
      requestDate: '2025-11-13 09:15',
      status: 'pending',
      fileSize: '1.8 MB',
      previewContent: `📊 DB 스키마 변경사항

테이블: orders
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
추가된 컬럼:
  • delivery_type VARCHAR(20) - 배송 유형
  • delivery_memo TEXT - 배송 메모
  • estimated_delivery_date DATE - 배송 예정일
  • tracking_number VARCHAR(50) - 송장번호

인덱스 변경:
  • idx_order_date_status (order_date, status)
  • idx_customer_id_date (customer_id, order_date)
  • idx_tracking_number (tracking_number)

성능 개선 예상:
  - 주문 조회 쿼리 40% 성능 향상
  - 배송 추적 쿼리 60% 성능 향상

마이그레이션 시간: 약 15분 (100만건 기준)`,
    },
    {
      id: 'commit-3',
      projectName: '마케팅 캠페인 2024',
      folderPath: '/디자인',
      fileName: '배너디자인_final.png',
      fileType: 'image',
      commitMessage: '시즌 할인 이벤트 배너 최종본',
      author: '이민수',
      authorInitials: '이민',
      requestDate: '2025-11-13 08:45',
      status: 'pending',
      fileSize: '3.2 MB',
      previewContent: `🎨 배너 디자인 최종본

크기: 1920 x 600 픽셀
포맷: PNG (투명 배경)
해상도: 72 DPI (웹용)

디자인 요소:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 메인 카피: "겨울 대축제 최대 70% 할인"
✓ 서브 카피: "11/15 - 12/15 한정"
✓ CTA 버튼: "지금 쇼핑하기"
✓ 브랜드 로고 배치 (우측 상단)

색상 팔레트:
  Primary: #FF6B6B (Red)
  Secondary: #4ECDC4 (Cyan)
  Accent: #FFE66D (Yellow)

[이미지 미리보기]
┌─────────────────────────────────────┐
│  ❄️ 겨울 대축제 최대 70% 할인 ❄️    │
│                                     │
│    11/15 - 12/15 한정               │
│                                     │
│    [  지금 쇼핑하기  ]              │
└─────────────────────────────────────┘

승인 후 배포 위치:
  • 메인 페이지 상단
  • 모바일 앱 배너
  • 이메일 뉴스레터`,
    },
    {
      id: 'commit-4',
      projectName: 'HR 정책 문서',
      folderPath: '/복지',
      fileName: '건강검진_정책.pdf',
      fileType: 'pdf',
      commitMessage: '2025년 건강검진 정책 업데이트',
      author: '최지현',
      authorInitials: '최지',
      requestDate: '2025-11-13 08:00',
      status: 'pending',
      fileSize: '890 KB',
      previewContent: `📋 2025년 건강검진 정책

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 정기 건강검진
   • 대상: 전 직원
   • 주기: 연 1회
   • 비용: 회사 전액 부담
   • 제휴 병원: 서울대병원, 삼성서울병원, 아산병원

2. 종합 건강검진
   • 대상: 40세 이상 직원
   • 주기: 2년 1회
   • 추가 항목: CT, MRI, 내시경 등
   • 본인부담금: 없음

3. 가족 건강검진 지원 (신규)
   • 대상: 배우자 및 직계가족
   • 지원금액: 1인당 30만원
   • 신청기간: 연초 1-2월

4. 건강검진 휴가
   • 검진 당일: 유급휴가 1일
   • 추가 검사 시: 반차 추가 제공

5. 사후관리
   • 이상 소견 시 전문의 상담 지원
   • 재검진 비용 회사 부담
   • 건강관리 프로그램 제공

문의: HR팀 (내선 1234)`,
    },
    {
      id: 'commit-5',
      projectName: '기술 문서',
      folderPath: '/API 문서',
      fileName: 'REST_API_v1.2.md',
      fileType: 'document',
      commitMessage: '결제 API 엔드포인트 추가',
      author: '정태호',
      authorInitials: '정태',
      requestDate: '2025-11-12 16:20',
      status: 'pending',
      fileSize: '456 KB',
      previewContent: `# REST API v1.2 - 결제 API

## 새로 추가된 엔드포인트

### 1. 결제 요청
\`\`\`
POST /api/v1/payments
\`\`\`

**Request Body:**
\`\`\`json
{
  "order_id": "ORD-2024-001",
  "amount": 50000,
  "payment_method": "card",
  "card_info": {
    "number": "1234-5678-9012-3456",
    "expiry": "12/25",
    "cvc": "123"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "payment_id": "PAY-2024-001",
  "status": "approved",
  "amount": 50000,
  "approved_at": "2024-11-13T10:30:00Z"
}
\`\`\`

### 2. 결제 취소
\`\`\`
POST /api/v1/payments/{payment_id}/cancel
\`\`\`

### 3. 결제 내역 조회
\`\`\`
GET /api/v1/payments?order_id={order_id}
\`\`\`

## 보안
- HTTPS 필수
- API Key 인증 필요
- 카드정보는 토큰화하여 저장`,
    },
  ]);

  const pendingRequests = commitRequests.filter((req) => req.status === 'pending');
  const processedRequests = commitRequests.filter((req) => req.status !== 'pending');

  const selectedCommitData = commitRequests.find((c) => c.id === selectedCommit);

  const handleCommitClick = (commitId: string) => {
    setSelectedCommit(commitId);
    setShowPreviewDialog(true);
  };

  const handleApprove = (commitId: string,commitMessage: string) => {
    const commit = commitRequests.find((c) => c.id === commitId);
    
    setCommitRequests((prev) =>
      prev.map((req) =>
        req.id === commitId ? { ...req, status: 'approved' as const } : req
      )
    );
    toast.success(`"${commit?.fileName}" 승인이 완료되었습니다.`);
    setShowPreviewDialog(false);
    setSelectedCommit(null);
  };

  const handleReject = (commitId: string) => {
    setShowPreviewDialog(false);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    const commit = commitRequests.find((c) => c.id === selectedCommit);
    if (!rejectReason.trim()) {
      toast.error('반려 사유를 입력해주세요.');
      return;
    }

    setCommitRequests((prev) =>
      prev.map((req) =>
        req.id === selectedCommit ? { ...req, status: 'rejected' as const } : req
      )
    );
    toast.success(`"${commit?.fileName}" 반려가 완료되었습니다.`);
    setShowRejectDialog(false);
    setRejectReason('');
    setSelectedCommit(null);
  };

  const getFileIcon = (fileType: string) => {
    return FileText;
  };

  const getStatusBadge = (status: CommitRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            대기중
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-[#3DBE8B]/10 text-[#3DBE8B] border-[#3DBE8B]">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            승인됨
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-[#E25A5A]/10 text-[#E25A5A] border-[#E25A5A]">
            <XCircle className="w-3 h-3 mr-1" />
            반려됨
          </Badge>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 헤더 */}
      <div className="border-b bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#004B8D]">승인 관리</h1>
            <p className="text-muted-foreground mt-1">
              커밋 승인 요청을 검토하고 승인/반려 처리합니다
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              대기중 {pendingRequests.length}건
            </Badge>
            <Badge variant="outline">
              처리완료 {processedRequests.length}건
            </Badge>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 space-y-6">
            {/* 대기중인 승인 요청 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#004B8D]">대기중인 승인 요청</h3>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {pendingRequests.length}건
                </Badge>
              </div>

              {pendingRequests.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>대기중인 승인 요청이 없습니다.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((commit) => {
                    const FileIcon = getFileIcon(commit.fileType);
                    return (
                      <Card
                        key={commit.id}
                        className="p-4 cursor-pointer transition-all hover:shadow-md hover:border-[#004B8D]/30"
                        onClick={() => handleCommitClick(commit.id)}
                      >
                        <div className="flex gap-4">
                          {/* 파일 아이콘 */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-[#004B8D]/10 rounded-lg flex items-center justify-center">
                              <FileIcon className="w-6 h-6 text-[#004B8D]" />
                            </div>
                          </div>

                          {/* 메인 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="truncate mb-1">
                                  {commit.fileName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    {commit.projectName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    {commit.folderPath}
                                  </span>
                                  <span>{commit.fileSize}</span>
                                </div>
                              </div>
                              {getStatusBadge(commit.status)}
                            </div>

                            {/* 커밋 메시지 */}
                            <div className="bg-muted/50 rounded p-2 mb-3">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{commit.commitMessage}</p>
                              </div>
                            </div>

                            {/* 작성자 및 날짜 */}
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-[#004B8D] text-white text-xs">
                                  {commit.authorInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {commit.author}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {commit.requestDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* 처리된 요청 */}
            {processedRequests.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#004B8D]">최근 처리된 요청</h3>
                  <Badge variant="outline">{processedRequests.length}건</Badge>
                </div>

                <div className="space-y-3">
                  {processedRequests.map((commit) => {
                    const FileIcon = getFileIcon(commit.fileType);
                    return (
                      <Card key={commit.id} className="p-4 opacity-75">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <FileIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="truncate mb-1">
                                  {commit.fileName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    {commit.projectName}
                                  </span>
                                  <span>{commit.fileSize}</span>
                                </div>
                              </div>
                              {getStatusBadge(commit.status)}
                            </div>
                            <div className="bg-muted/50 rounded p-2 mb-3">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{commit.commitMessage}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {commit.authorInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {commit.author}
                              </span>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {commit.requestDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          {selectedCommitData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#004B8D]">
                  {selectedCommitData.fileName}
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex flex-col gap-4">
                {/* 문서 정보 */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">프로젝트:</span>
                      <span>{selectedCommitData.projectName}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">경로:</span>
                      <span>{selectedCommitData.folderPath}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span>{selectedCommitData.fileSize}</span>
                  </div>

                  {/* 커밋 메시지 */}
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm mb-2">{selectedCommitData.commitMessage}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-[#004B8D] text-white text-xs">
                              {selectedCommitData.authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedCommitData.author}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{selectedCommitData.requestDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 미리보기 콘텐츠 */}
                <div className="flex-1 overflow-y-scroll">
                  <ScrollArea className="h-full">
                    <div className="pr-4 flex flex-col gap-2">
                      <div className="bg-white rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>문서 미리보기</span>
                        </div>
                        <Separator className="mb-4" />
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {selectedCommitData.previewContent}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* 승인/반려 버튼 */}
                <div className='flex flex-col gap-2'>
                  
                  <div className='flex flex-col w-full text-center p-1'>
                    <input 
                      className='rounded-sm p-2 border-1 border-[#DFDFDF] border-[2px]'
                      placeholder='승인 메시지를 입력하세요.'
                      value={commitMessage as string}
                      onChange={(e)=>{setCommitMessage(e.target.value)}}
                      />
                  </div>
                  <div className="flex gap-3 pt-2 border-t">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleReject(selectedCommitData.id)}
                      disabled={selectedCommitData.status !== 'pending'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      반려
                    </Button>
                    <Button
                      className="flex-1 bg-[#3DBE8B] hover:bg-[#35a879] text-white"
                      onClick={() => handleApprove(selectedCommitData.id,commitMessage as string)}
                      disabled={selectedCommitData.status !== 'pending'}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      승인
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 반려 사유 입력 다이얼로그 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E25A5A]">반려 사유 입력</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                반려 사유를 입력해주세요. 작성자에게 전달됩니다.
              </p>
              <Textarea
                placeholder="예: 문서 형식이 맞지 않습니다. 템플릿을 확인해주세요."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
              >
                취소
              </Button>
              <Button
                onClick={confirmReject}
                className="bg-[#E25A5A] hover:bg-[#c94d4d] text-white"
              >
                <XCircle className="w-4 h-4 mr-1" />
                반려 확정
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
