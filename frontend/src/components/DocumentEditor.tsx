import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { useParams } from 'react-router-dom';
import { useVersion } from '../queries/useVersions';
import { format } from 'date-fns';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentEditorProps {
  onBack: () => void;
  onCommit: () => void;
}

export function DocumentEditor({ onBack, onCommit }: DocumentEditorProps) {
  const { docId } = useParams();
  const { data: versionData } = useVersion(docId);

  const [content, setContent] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'modified'>('saved');

  const fileName = versionData?.fileId?.path?.split('/').pop();
  const previewUrl = versionData?.artifacts?.previewUrl || versionData?.artifacts?.storageKey;

  const previewType = useMemo(() => {
    const ext = (fileName?.split('.').pop() || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'pdf';
    return 'text';
  }, [fileName]);

  useEffect(() => {
    if (previewType === 'text') {
      setContent(versionData?.message || '');
    }
  }, [previewType, versionData]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setAutoSaveStatus('modified');
    setTimeout(() => {
      setAutoSaveStatus('saving');
      setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 500);
    }, 1000);
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saved':
        return <Check className="w-4 h-4 text-[#3DBE8B]" />;
      case 'saving':
        return <Clock className="w-4 h-4 text-[#F5A524] animate-spin" />;
      case 'modified':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saved':
        return '저장됨';
      case 'saving':
        return '자동 저장중..';
      case 'modified':
        return '수정됨';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2>{fileName || '문서 미리보기'}</h2>
                <Badge variant="outline">{versionData?.commitId || ''}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                {getAutoSaveIcon()}
                <span>
                  {versionData?.createdAt
                    ? format(new Date(versionData.createdAt), 'yyyy-MM-dd HH:mm')
                    : getAutoSaveText()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-background">
                {previewType === 'image' && previewUrl && (
                  <img src={previewUrl} alt="preview" className="max-h-[600px] mx-auto rounded" />
                )}
                {previewType === 'video' && previewUrl && (
                  <video controls className="w-full max-h-[600px] rounded">
                    <source src={previewUrl} />
                  </video>
                )}
                {previewType === 'pdf' && previewUrl && (
                  <div className="w-full flex justify-center">
                    <Document file={previewUrl} loading="PDF 불러오는 중...">
                      <Page pageNumber={1} width={800} />
                    </Document>
                  </div>
                )}
                {previewType === 'text' && (
                  <Textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[500px] border-0 p-0 focus-visible:ring-0 resize-none font-mono"
                    placeholder="문서 내용을 확인하세요.."
                  />
                )}
                {!previewUrl && previewType !== 'text' && (
                  <p className="text-sm text-muted-foreground">미리보기를 지원하지 않는 파일 형식이거나 미리보기 경로가 없습니다.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
