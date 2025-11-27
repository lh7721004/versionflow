import { useEffect, useState } from 'react';
import { FileText, Clock, User, CheckCircle, XCircle, AlertCircle, Eye, GitCompare, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useParams } from 'react-router-dom';
import { useVersions } from '../queries/useVersions';
import { format } from 'date-fns';

interface Version {
  id: string;
  version: string;
  commitMessage: string;
  author: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected' | 'draft';
  approvers?: string[];
  fileName?: string;
  previewUrl?: string;
}

interface DocumentVersionsProps {
  documentName: string;
  onBack: () => void;
  onViewVersion: (versionId: string) => void;
  onEditVersion: (versionId: string) => void;
  onCompareVersion: (versionId: string) => void;
}

const canPreviewExt = (fileName?: string) => {
  const ext = (fileName?.split('.').pop() || '').toLowerCase();
  if (!ext) return 'unsupported';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css'].includes(ext)) return 'text';
  return 'unsupported';
};

export function DocumentVersions({
  documentName,
  onBack,
  onViewVersion,
  onEditVersion,
  onCompareVersion
}: DocumentVersionsProps) {
  const { docId } = useParams();
  const { data: versionsData, isLoading, isError, error } = useVersions(
    { fileId: docId, sort: '-createdAt', limit: 50 },
    { enabled: !!docId }
  );
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    if (!versionsData?.items) return;
    const mapped = versionsData.items.map((v: any) => {
      const statusMap: Record<string, Version['status']> = {
        approved: 'approved',
        pending_review: 'pending',
        rejected: 'rejected',
        draft: 'draft'
      };
      const status = statusMap[v.status] || 'pending';
      const fileName = v.fileId?.path?.split('/').pop();
      return {
        id: v._id,
        version: v.commitId || v._id,
        commitMessage: v.message || '',
        author: v.authorId?.name || '작성자',
        date: v.createdAt ? format(new Date(v.createdAt), 'yyyy-MM-dd HH:mm') : '',
        status,
        approvers: (v.review?.approvals || []).map((a: any) => a.userId?.name || a.userId || ''),
        fileName,
        previewUrl: v.artifacts?.previewUrl || v.artifacts?.storageKey
      } as Version;
    });
    setVersions(mapped);
  }, [versionsData]);

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

  const renderPreview = (fileName?: string, previewUrl?: string, fallbackText?: string) => {
    const type = canPreviewExt(fileName);
    if (type === 'image' && previewUrl) {
      return <img src={previewUrl} alt={fileName} className="max-h-96 rounded border" />;
    }
    if (type === 'video' && previewUrl) {
      return (
        <video className="w-full max-h-96 rounded border" controls>
          <source src={previewUrl} />
          미리보기를 지원하지 않는 브라우저입니다.
        </video>
      );
    }
    if (type === 'pdf' && previewUrl) {
      return (
        <iframe
          src={previewUrl}
          title={fileName}
          className="w-full h-[480px] border rounded"
        />
      );
    }
    if (type === 'text' && fallbackText) {
      return (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {fallbackText}
          </pre>
        </div>
      );
    }
    return <p className="text-sm text-muted-foreground">미리보기를 지원하지 않는 확장자 입니다.</p>;
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#004B8D]/10 rounded-lg">
              <FileText className="h-6 w-6 text-[#004B8D]" />
            </div>
            <div>
              <h1 className="flex items-center gap-2">{documentName}</h1>
              <p className="text-muted-foreground mt-1">
                문서의 모든 버전을 확인하고 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {isLoading && (
          <Card className="p-6 mb-6">
            <p className="text-sm text-muted-foreground">버전을 불러오는 중...</p>
          </Card>
        )}
        {isError && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <p className="text-sm text-red-700">
              버전을 불러오지 못했습니다: {String((error as any)?.message || '')}
            </p>
          </Card>
        )}

        {currentVersion && (
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
                        {currentVersion.commitMessage || currentVersion.version}
                      </CardTitle>
                      {getStatusBadge(currentVersion.status)}
                    </div>
                    <CardDescription className="text-base">{currentVersion.version}</CardDescription>
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
                        승인: {currentVersion.approvers.join(', ')}
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

                  <div className="bg-muted/50 rounded p-3">
                    {renderPreview(currentVersion.fileName, currentVersion.previewUrl, currentVersion.commitMessage)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {previousVersions.length > 0 && (
          <div>
            <h2 className="mb-4">이전 버전</h2>
            <div className="space-y-4">
              {previousVersions.map((version) => (
                <Card key={version.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{version.version}</CardTitle>
                          {getStatusBadge(version.status)}
                        </div>
                        <CardDescription>{version.commitMessage}</CardDescription>
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
                            승인: {version.approvers.join(', ')}
                          </span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button onClick={() => onViewVersion(version.id)} variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-2" />
                          보기
                        </Button>
                        <Button onClick={() => onCompareVersion(version.id)} variant="outline" size="sm">
                          <GitCompare className="h-3 w-3 mr-2" />
                          현재 버전과 비교
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded p-3">
                        {renderPreview(version.fileName, version.previewUrl, version.commitMessage)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && versions.length === 0 && (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">표시할 버전이 없습니다.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
