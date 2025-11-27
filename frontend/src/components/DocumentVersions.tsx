import { FileText, Clock, User, CheckCircle, XCircle, AlertCircle, Eye, Edit, GitCompare, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Version {
  id: string;
  version: string;
  commitMessage: string;
  author: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected' | 'draft';
  approvers?: string[];
}

interface DocumentVersionsProps {
  documentName: string;
  onBack: () => void;
  onViewVersion: (versionId: string) => void;
  onEditVersion: (versionId: string) => void;
  onCompareVersion: (versionId: string) => void;
}

export function DocumentVersions({
  documentName,
  onBack,
  onViewVersion,
  onEditVersion,
  onCompareVersion
}: DocumentVersionsProps) {
  // 예시 데이터 - 실제로는 props나 API로 받아옴
  const versions: Version[] = [
    {
      id: 'v5',
      version: 'v2.1.0',
      commitMessage: '최종 검토 완료 및 승인',
      author: '김부장',
      date: '2025-10-28 14:30',
      status: 'approved',
      approvers: ['박팀장', '김부장']
    },
    {
      id: 'v4',
      version: 'v2.0.3',
      commitMessage: '고객 피드백 반영',
      author: '박대리',
      date: '2025-10-25 11:20',
      status: 'approved',
      approvers: ['박팀장', '김부장']
    },
    {
      id: 'v3',
      version: 'v2.0.2',
      commitMessage: '문서 구조 개선',
      author: '이사원',
      date: '2025-10-23 16:45',
      status: 'approved',
      approvers: ['박팀장']
    },
    {
      id: 'v2',
      version: 'v2.0.1',
      commitMessage: '오타 수정 및 포맷 정리',
      author: '박대리',
      date: '2025-10-20 09:15',
      status: 'approved',
      approvers: ['박팀장']
    },
    {
      id: 'v1',
      version: 'v2.0.0',
      commitMessage: '메이저 업데이트 - 새로운 섹션 추가',
      author: '김부장',
      date: '2025-10-15 10:00',
      status: 'approved',
      approvers: ['김부장']
    }
  ];

  const currentVersion = versions[0];
  const previousVersions = versions.slice(1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-[#3DBE8B] hover:bg-[#3DBE8B]/90">승인됨</Badge>;
      case 'pending':
        return <Badge className="bg-[#FFA500] hover:bg-[#FFA500]/90">승인 대기</Badge>;
      case 'rejected':
        return <Badge className="bg-[#E25A5A] hover:bg-[#E25A5A]/90">반려됨</Badge>;
      case 'draft':
        return <Badge variant="secondary">임시저장</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#004B8D]/10 rounded-lg">
              <FileText className="h-6 w-6 text-[#004B8D]" />
            </div>
            <div>
              <h1 className="flex items-center gap-2">
                {documentName}
              </h1>
              <p className="text-muted-foreground mt-1">
                문서의 모든 버전을 확인하고 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Current Version */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2>현재 버전</h2>
            <Badge className="bg-[#004B8D] hover:bg-[#004B8D]/90">최신</Badge>
          </div>
          <Card className="border-[#004B8D] border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl text-[#004B8D]">
                      {currentVersion.version}
                    </CardTitle>
                    {getStatusBadge(currentVersion.status)}
                  </div>
                  <CardDescription className="text-base">
                    {currentVersion.commitMessage}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{currentVersion.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{currentVersion.date}</span>
                  </div>
                </div>

                {currentVersion.approvers && currentVersion.approvers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#3DBE8B]" />
                    <span className="text-muted-foreground">
                      승인자: {currentVersion.approvers.join(', ')}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewVersion(currentVersion.id)}
                    className="bg-[#004B8D] hover:bg-[#004B8D]/90"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    보기
                  </Button>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Previous Versions */}
        {previousVersions.length > 0 && (
          <div>
            <h2 className="mb-4">이전 버전</h2>
            <div className="space-y-4">
              {previousVersions.map((version, index) => (
                <Card key={version.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">
                            {version.version}
                          </CardTitle>
                          {getStatusBadge(version.status)}
                        </div>
                        <CardDescription>
                          {version.commitMessage}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{version.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{version.date}</span>
                        </div>
                      </div>

                      {version.approvers && version.approvers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-[#3DBE8B]" />
                          <span className="text-muted-foreground">
                            승인자: {version.approvers.join(', ')}
                          </span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => onViewVersion(version.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          보기
                        </Button>
                        <Button
                          onClick={() => onCompareVersion(version.id)}
                          variant="outline"
                          size="sm"
                        >
                          <GitCompare className="h-3 w-3 mr-2" />
                          현재 버전과 비교
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
