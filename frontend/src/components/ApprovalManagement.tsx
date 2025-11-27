import { useEffect, useState } from 'react';
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
import { useMe } from '../queries/useMe';
import { useVersions, useApproveVersion, useRejectVersion } from '../queries/useVersions';
import { format } from 'date-fns';

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
  approvalsCount: number;
  requiredApprovals: number;
}

export function ApprovalManagement() {
  const { data: me } = useMe();
  const userId = (me as any)?.data?.id || (me as any)?.id;
  const { data: versionsData, isLoading, isError, error } = useVersions(
    { status: 'pending_review', limit: 100 },
    { enabled: !!userId }
  );
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [commitRequests, setCommitRequests] = useState<CommitRequest[]>([]);

  const selectedCommitData = commitRequests.find((c) => c.id === selectedCommit);
  const approveMutation = useApproveVersion(selectedCommit || '');
  const rejectMutation = useRejectVersion(selectedCommit || '');

  useEffect(() => {
    if (!versionsData?.items) return;
    const mapped = versionsData.items.map((v: any) => {
      const authorName = v.authorId?.name || '작성자';
      const initials = authorName.slice(0, 2);
      const approvalsCount = v.review?.approvals?.length || 0;
      const requiredApprovals = v.review?.requiredApprovals || 1;
      return {
        id: v._id,
        projectName: v.projectId?.name || '프로젝트',
        folderPath: v.fileId?.path || '/',
        fileName: v.fileId?.path?.split('/').pop() || v.commitId,
        fileType: 'document',
        commitMessage: v.message || '',
        author: authorName,
        authorInitials: initials,
        requestDate: v.createdAt ? format(new Date(v.createdAt), 'yyyy-MM-dd HH:mm') : '',
        status: v.status === 'approved' ? 'approved' : v.status === 'rejected' ? 'rejected' : 'pending',
        fileSize: '-',
        previewContent: JSON.stringify(v.review?.diff || {}, null, 2),
        approvalsCount,
        requiredApprovals
      } as CommitRequest;
    });
    setCommitRequests(mapped);
  }, [versionsData]);

  const pendingRequests = commitRequests.filter(
    (req) => req.status !== 'rejected' && req.approvalsCount < req.requiredApprovals
  );
  const processedRequests = commitRequests.filter(
    (req) => req.approvalsCount >= req.requiredApprovals || req.status === 'rejected'
  );

  useEffect(() => {
    console.log('[ApprovalManagement] userId:', userId);
  }, [userId]);

  useEffect(() => {
    if (isLoading) console.log('[ApprovalManagement] versions loading...');
    if (isError) console.log('[ApprovalManagement] versions error:', error);
    if (versionsData) {
      console.log('[ApprovalManagement] versions raw data:', versionsData);
      console.log('[ApprovalManagement] mapped commitRequests:', commitRequests);
      console.log('[ApprovalManagement] pending count:', pendingRequests.length);
      console.log('[ApprovalManagement] processed count:', processedRequests.length);
    }
  }, [versionsData, isLoading, isError, error, commitRequests, pendingRequests.length, processedRequests.length]);

  const handleCommitClick = (commitId: string) => {
    setSelectedCommit(commitId);
    setShowPreviewDialog(true);
  };

  const handleApprove = (commitId: string, commitMessage: string) => {
    if (!userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    approveMutation.mutate(
      { userId, comment: commitMessage || undefined },
      {
        onSuccess: () => {
          setCommitRequests((prev) =>
            prev.map((req) => (req.id === commitId ? { ...req, status: 'approved' } : req))
          );
          toast.success('승인이 완료되었습니다.');
          setShowPreviewDialog(false);
          setSelectedCommit(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error?.message || err?.message || '승인에 실패했습니다.');
        },
      }
    );
  };

  const handleReject = (commitId: string) => {
    setSelectedCommit(commitId);
    setShowPreviewDialog(false);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('반려 사유를 입력해주세요.');
      return;
    }
    if (!userId || !selectedCommit) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    rejectMutation.mutate(
      { userId, comment: rejectReason },
      {
        onSuccess: () => {
          setCommitRequests((prev) =>
            prev.map((req) =>
              req.id === selectedCommit ? { ...req, status: 'rejected' } : req
            )
          );
          toast.success('반려가 완료되었습니다.');
          setShowRejectDialog(false);
          setRejectReason('');
          setSelectedCommit(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error?.message || err?.message || '반려에 실패했습니다.');
        },
      }
    );
  };

  const getFileIcon = (_fileType: string) => {
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
      <div className="border-b bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#004B8D]">승인 관리</h1>
            <p className="text-muted-foreground mt-1">
              커밋 승인 요청을 검토하고 승인/반려 처리하세요
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

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 space-y-6">
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
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-[#004B8D]/10 rounded-lg flex items-center justify-center">
                              <FileIcon className="w-6 h-6 text-[#004B8D]" />
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
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    {commit.folderPath}
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
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">프로젝트:</span>
                      <span>{selectedCommitData.projectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">경로:</span>
                      <span>{selectedCommitData.folderPath}</span>
                    </div>
                    <span className="text-muted-foreground">{selectedCommitData.fileSize}</span>
                  </div>

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
                          <Calendar className="w-3 h-3" />
                          <span>{selectedCommitData.requestDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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

                <div className='flex flex-col gap-2'>
                  <div className='flex flex-col w-full text-center p-1'>
                    <input 
                      className='rounded-sm p-2 border-1 border-[#DFDFDF] border-[2px]'
                      placeholder='승인 메시지를 입력하세요'
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
                placeholder="예) 문서 형식이 맞지 않습니다. 템플릿을 확인해주세요."
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
