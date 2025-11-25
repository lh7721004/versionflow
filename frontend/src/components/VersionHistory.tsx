import { useState } from 'react';
import {
  ArrowLeft,
  GitCompare,
  RotateCcw,
  FileText,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface VersionHistoryProps {
  onBack: () => void;
}

interface Version {
  id: string;
  version: string;
  author: string;
  date: string;
  message: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

export function VersionHistory({ onBack }: VersionHistoryProps) {
  const [compareFrom, setCompareFrom] = useState('v4');
  const [compareTo, setCompareTo] = useState('v1');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null as (string | null));

  const versions: Version[] = [
    {
      id: '4',
      version: 'v4',
      author: '박민수',
      date: '2025-10-28 14:30',
      message: '예산 항목 수정 및 일정 업데이트',
      status: 'pending',
    },
    {
      id: '3',
      version: 'v3',
      author: '이영희',
      date: '2025-10-27 10:15',
      message: '사업 목표 수정',
      status: 'approved',
    },
    {
      id: '2',
      version: 'v2',
      author: '김철수',
      date: '2025-10-25 16:45',
      message: '추진 일정 추가',
      status: 'approved',
    },
    {
      id: '1',
      version: 'v1',
      author: '박민수',
      date: '2025-10-24 09:00',
      message: '초기 버전 업로드',
      status: 'approved',
    },
  ];

  const diffLines: DiffLine[] = [
    { type: 'unchanged', content: '2025년도 사업계획서' },
    { type: 'unchanged', content: '' },
    { type: 'unchanged', content: '1. 사업 목표' },
    { type: 'removed', content: '- 전년 대비 매출 20% 증가' },
    { type: 'added', content: '- 전년 대비 매출 25% 증가' },
    { type: 'removed', content: '- 신규 시장 진출 2개국' },
    { type: 'added', content: '- 신규 시장 진출 3개국' },
    { type: 'unchanged', content: '- 고객 만족도 90% 이상 달성' },
    { type: 'unchanged', content: '' },
    { type: 'unchanged', content: '2. 주요 전략' },
    { type: 'unchanged', content: '디지털 전환을 통한 업무 효율화 및 고객 경험 개선을 최우선 과제로 추진합니다.' },
    { type: 'unchanged', content: '' },
    { type: 'added', content: '3. 예산 계획' },
    { type: 'added', content: '총 예산: 500억원' },
    { type: 'added', content: '- R&D 투자: 150억원 (30%)' },
    { type: 'added', content: '- 마케팅: 100억원 (20%)' },
  ];

  const handleRestore = () => {
    if (selectedVersion) {
      // 복원 로직
      setShowRestoreDialog(false);
      setSelectedVersion(null);
    }
  };

  const getStatusBadge = (status: Version['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-[#3DBE8B] text-white">승인됨</Badge>;
      case 'pending':
        return <Badge className="bg-[#F5A524] text-white">승인 대기</Badge>;
      case 'rejected':
        return <Badge className="bg-[#E25A5A] text-white">반려됨</Badge>;
    }
  };

  const getDiffLineStyle = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-[#3DBE8B]/10 border-l-4 border-[#3DBE8B] pl-4';
      case 'removed':
        return 'bg-[#E25A5A]/10 border-l-4 border-[#E25A5A] pl-4';
      case 'unchanged':
        return 'pl-4';
    }
  };

  const getDiffLinePrefix = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return '+ ';
      case 'removed':
        return '- ';
      case 'unchanged':
        return '  ';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <h2>버전 이력 및 비교</h2>
              </div>
              <p className="text-muted-foreground mt-1">사업계획서.docx</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            이전 버전으로 복원
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Version Comparison Controls */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm mb-2 block">비교 기준 버전</label>
                <Select value={compareFrom} onValueChange={setCompareFrom}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.version}>
                        {v.version} - {v.message}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6">
                <GitCompare className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <label className="text-sm mb-2 block">비교 대상 버전</label>
                <Select value={compareTo} onValueChange={setCompareTo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.version}>
                        {v.version} - {v.message}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Diff View */}
          <Card className="p-6">
            <h3 className="mb-4">변경 사항 비교</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 border-b">
                <div className="p-3 bg-muted border-r">
                  <p className="font-medium">{compareFrom}</p>
                </div>
                <div className="p-3 bg-muted">
                  <p className="font-medium">{compareTo}</p>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <div className="font-mono text-sm">
                  {diffLines.map((line, index) => (
                    <div
                      key={index}
                      className={`py-1 px-2 ${getDiffLineStyle(line.type)}`}
                    >
                      <span
                        className={
                          line.type === 'added'
                            ? 'text-[#3DBE8B]'
                            : line.type === 'removed'
                            ? 'text-[#E25A5A]'
                            : 'text-foreground'
                        }
                      >
                        {getDiffLinePrefix(line.type)}
                        {line.content || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#3DBE8B]/20 border-l-2 border-[#3DBE8B]" />
                <span>추가된 내용</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#E25A5A]/20 border-l-2 border-[#E25A5A]" />
                <span>삭제된 내용</span>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Version Timeline */}
          <div>
            <h3 className="mb-4">전체 버전 타임라인</h3>
            <div className="space-y-4">
              {versions.map((version, index) => (
                <Card key={version.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                          {version.version}
                        </div>
                        {index < versions.length - 1 && (
                          <div className="w-0.5 h-full bg-border my-2" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4>{version.message}</h4>
                          {getStatusBadge(version.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{version.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{version.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVersion(version.version);
                          setShowRestoreDialog(true);
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        복원
                      </Button>
                      <Button variant="outline" size="sm">
                        미리보기
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-muted-foreground mb-1">전체 버전</p>
              <p className="text-2xl font-semibold">{versions.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground mb-1">승인된 버전</p>
              <p className="text-2xl font-semibold text-[#3DBE8B]">
                {versions.filter((v) => v.status === 'approved').length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-muted-foreground mb-1">평균 승인 시간</p>
              <p className="text-2xl font-semibold">2.5시간</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Restore Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버전 복원</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedVersion} 버전으로 복원하시겠습니까? 현재 버전은 새로운 버전으로
              저장됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>복원하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
