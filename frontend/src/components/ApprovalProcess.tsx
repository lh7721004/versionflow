import { useState } from 'react';
import { CheckCircle, Clock, XCircle, UserCheck, ArrowLeft, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ApprovalProcessProps {
  onBack: () => void;
}

interface ApprovalStep {
  id: string;
  role: string;
  approver: string;
  status: 'completed' | 'pending' | 'waiting' | 'rejected';
  timestamp?: string;
  comment?: string;
}

export function ApprovalProcess({ onBack }: ApprovalProcessProps) {
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([
    {
      id: '1',
      role: '직원',
      approver: '박민수',
      status: 'completed',
      timestamp: '2025-10-28 14:30',
      comment: '사업계획서 v4 작성 완료',
    },
    {
      id: '2',
      role: '팀장',
      approver: '이영희',
      status: 'pending',
    },
    {
      id: '3',
      role: '부장',
      approver: '김철수',
      status: 'waiting',
    },
    {
      id: '4',
      role: '최종 확정',
      approver: '시스템',
      status: 'waiting',
    },
  ]);

  const handleApprove = () => {
    if (password && selectedStep) {
      // 승인 처리 로직
      setApprovalSteps((prev) =>
        prev.map((step) =>
          step.id === selectedStep
            ? {
                ...step,
                status: 'completed',
                timestamp: new Date().toLocaleString('ko-KR'),
              }
            : step
        )
      );
      setShowSignDialog(false);
      setPassword('');
      setSelectedStep(null);
    }
  };

  const handleReject = () => {
    if (rejectComment && selectedStep) {
      // 반려 처리 로직
      setApprovalSteps((prev) =>
        prev.map((step) =>
          step.id === selectedStep
            ? {
                ...step,
                status: 'rejected',
                timestamp: new Date().toLocaleString('ko-KR'),
                comment: rejectComment,
              }
            : step
        )
      );
      setShowRejectDialog(false);
      setRejectComment('');
      setSelectedStep(null);
    }
  };

  const getStatusIcon = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-[#3DBE8B]" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-[#F5A524]" />;
      case 'waiting':
        return <Clock className="w-6 h-6 text-muted-foreground" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-[#E25A5A]" />;
    }
  };

  const getStatusText = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'completed':
        return '승인 완료';
      case 'pending':
        return '승인 대기';
      case 'waiting':
        return '대기 중';
      case 'rejected':
        return '반려됨';
    }
  };

  const getStatusColor = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-[#3DBE8B]';
      case 'pending':
        return 'bg-[#F5A524]';
      case 'waiting':
        return 'bg-muted-foreground';
      case 'rejected':
        return 'bg-[#E25A5A]';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <h2>승인 프로세스</h2>
            </div>
            <p className="text-muted-foreground mt-1">사업계획서.docx - 버전 v4</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Workflow Diagram */}
          <Card className="p-8">
            <h3 className="mb-6">승인 흐름도</h3>
            <div className="flex items-center justify-between relative">
              {/* Connection Lines */}
              <div className="absolute top-8 left-0 right-0 h-0.5 bg-border" />

              {approvalSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                  {/* Node */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      step.status === 'pending'
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : step.status === 'completed'
                        ? 'bg-[#3DBE8B] text-white'
                        : step.status === 'rejected'
                        ? 'bg-[#E25A5A] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <p className="font-medium">{step.role}</p>
                    <p className="text-sm text-muted-foreground">{step.approver}</p>
                    <Badge
                      className={`mt-2 ${getStatusColor(step.status)} text-white`}
                      variant="secondary"
                    >
                      {getStatusText(step.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Approval Details */}
          <div className="space-y-4">
            <h3>승인 상세 내역</h3>
            {approvalSteps.map((step, index) => (
              <Card key={step.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{step.role}</h4>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{step.approver}</span>
                      </div>
                      {step.timestamp && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.timestamp}
                        </p>
                      )}
                      {step.comment && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{step.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {step.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedStep(step.id);
                          setShowSignDialog(true);
                        }}
                      >
                        <UserCheck className="w-4 h-4" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSelectedStep(step.id);
                          setShowRejectDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                        반려
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="mb-4">승인 타임라인</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#3DBE8B]" />
                  <div className="w-0.5 h-full bg-border" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">직원 제출</p>
                  <p className="text-sm text-muted-foreground">
                    박민수가 문서를 제출했습니다
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">2025-10-28 14:30</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#F5A524]" />
                  <div className="w-0.5 h-full bg-border" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">팀장 검토 중</p>
                  <p className="text-sm text-muted-foreground">
                    이영희의 승인을 기다리고 있습니다
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">진행 중</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground">부장 승인 대기</p>
                  <p className="text-sm text-muted-foreground">팀장 승인 후 진행됩니다</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>전자 서명으로 승인</DialogTitle>
            <DialogDescription>
              본인 확인을 위해 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm">
                승인 시 전자 서명이 기록되며, 이는 법적 효력을 가집니다.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              취소
            </Button>
            <Button onClick={handleApprove} disabled={!password}>
              승인하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>문서 반려</DialogTitle>
            <DialogDescription>
              반려 사유를 입력해주세요. 작성자에게 전달됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">반려 사유</Label>
              <Textarea
                id="comment"
                placeholder="예: 3페이지 예산 항목에 오탈자가 있습니다. 수정 후 재제출 바랍니다."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectComment.trim()}
            >
              반려하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
