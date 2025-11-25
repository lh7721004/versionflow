import { useState, useRef } from 'react';
import { Upload, FileText, ArrowLeft, Send, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface FileUploadProps {
  folderName: string;
  folderId: string;
  onBack: () => void;
}

export function FileUpload({ folderName, folderId, onBack }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`파일 선택됨: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('파일을 선택해주세요');
      return;
    }

    if (!commitMessage.trim()) {
      toast.error('커밋 메시지를 입력해주세요');
      return;
    }

    setIsUploading(true);

    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('파일 업로드 및 승인 요청이 완료되었습니다');
    setIsUploading(false);
    
    // 초기화
    setSelectedFile(null);
    setCommitMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-6">
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
              <Upload className="h-6 w-6 text-[#004B8D]" />
            </div>
            <div>
              <h1>파일 업로드</h1>
              <p className="text-muted-foreground mt-1">
                {folderName}에 새 파일을 업로드합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
            <CardDescription>
              문서 파일을 선택하고 커밋 메시지를 작성한 후 승인을 요청하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 파일 선택 */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">파일 선택</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#004B8D] transition-colors">
                {!selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-[#004B8D]/10 rounded-full">
                        <FileText className="h-8 w-8 text-[#004B8D]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2">
                        파일을 드래그하거나 클릭하여 선택하세요
                      </p>
                      <p className="text-sm text-muted-foreground">
                        지원 형식: DOC, DOCX, PDF, XLS, XLSX, PPT, PPTX
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      파일 선택
                    </Button>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-[#3DBE8B]/10 rounded-full">
                        <FileText className="h-8 w-8 text-[#3DBE8B]" />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 text-left">
                          <p className="truncate">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      다른 파일 선택
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 커밋 메시지 */}
            <div className="space-y-2">
              <Label htmlFor="commit-message">커밋 메시지 (한줄)</Label>
              <Input
                id="commit-message"
                placeholder="예: 최초 문서 업로드"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                {commitMessage.length}/100
              </p>
            </div>

            {/* 추가 정보 (선택사항) */}
            <div className="space-y-2">
              <Label htmlFor="description">상세 설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="파일에 대한 추가 설명을 입력하세요"
                rows={4}
              />
            </div>

            {/* 승인 요청 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || !commitMessage.trim() || isUploading}
                className="bg-[#004B8D] hover:bg-[#004B8D]/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {isUploading ? '업로드 중...' : '승인 요청'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isUploading}
              >
                취소
              </Button>
            </div>

            {/* 안내 사항 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="text-sm mb-2 text-blue-900">안내 사항</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>업로드된 파일은 자동으로 버전 v1.0.0으로 생성됩니다</li>
                <li>승인 요청 후 팀장 또는 부장의 승인이 필요합니다</li>
                <li>승인 완료 전까지는 임시저장 상태로 보관됩니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
