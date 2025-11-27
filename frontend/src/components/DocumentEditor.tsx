import { useState } from 'react';
import { Save, GitCommit, ArrowLeft, Clock, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

interface DocumentEditorProps {
  onBack: () => void;
  onCommit: () => void;
}

export function DocumentEditor({ onBack, onCommit }: DocumentEditorProps) {
  const [content, setContent] = useState(`2025년도 사업계획서

1. 사업 목표
- 전년 대비 매출 25% 증가
- 신규 시장 진출 3개국
- 고객 만족도 90% 이상 달성

2. 주요 전략
디지털 전환을 통한 업무 효율화 및 고객 경험 개선을 최우선 과제로 추진합니다.

3. 예산 계획
총 예산: 500억원
- R&D 투자: 150억원 (30%)
- 마케팅: 100억원 (20%)
- 인프라: 150억원 (30%)
- 운영비: 100억원 (20%)

4. 추진 일정
Q1: 시장 조사 및 분석
Q2: 신제품 개발 착수
Q3: 베타 테스트 및 마케팅 준비
Q4: 정식 출시 및 평가`);

  const [commitMessage, setCommitMessage] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'modified'>('saved');

  const handleContentChange = (value: string) => {
    setContent(value);
    setAutoSaveStatus('modified');
    
    // 시뮬레이션: 자동 저장
    setTimeout(() => {
      setAutoSaveStatus('saving');
      setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 500);
    }, 1000);
  };

  const handleCommit = () => {
    if (commitMessage.trim()) {
      // 커밋 로직
      onCommit();
    }
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
        return '자동 저장 중...';
      case 'modified':
        return '수정됨';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2>사업계획서.docx</h2>
                <Badge variant="outline">버전 v3</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                {getAutoSaveIcon()}
                <span>{getAutoSaveText()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Document Editor */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-background">
                <Textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[500px] border-0 p-0 focus-visible:ring-0 resize-none font-mono"
                  placeholder="문서 내용을 입력하세요..."
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
