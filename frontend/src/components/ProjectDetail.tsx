import { useState } from 'react';
import {
  FileText,
  FolderOpen,
  Settings,
  GitCommit,
  GitCompare,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  File,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';

interface ProjectDetailProps {
  onNavigateToEditor: (docId: string) => void;
  onNavigateToApproval: (docId: string) => void;
  onNavigateToHistory: (docId: string) => void;
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  version?: string;
  status?: 'approved' | 'pending' | 'draft';
  children?: FileNode[];
}

export function ProjectDetail({
  onNavigateToEditor,
  onNavigateToApproval,
  onNavigateToHistory,
}: ProjectDetailProps) {
  const [selectedFile, setSelectedFile] = useState<string>('doc-1');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['root']);
  const [commitMessage, setCommitMessage] = useState('');

  const fileTree: FileNode = {
    id: 'root',
    name: '2025 사업계획 프로젝트',
    type: 'folder',
    children: [
      {
        id: 'config-1',
        name: '관리자설정.json',
        type: 'file',
        version: 'v1.0',
        status: 'approved',
      },
      {
        id: 'config-2',
        name: '버전규칙.json',
        type: 'file',
        version: 'v1.0',
        status: 'approved',
      },
      {
        id: 'folder-1',
        name: '문서',
        type: 'folder',
        children: [
          {
            id: 'doc-1',
            name: '사업계획서.docx',
            type: 'file',
            version: 'v4.2',
            status: 'approved',
          },
          {
            id: 'doc-2',
            name: '예산안.xlsx',
            type: 'file',
            version: 'v2.1',
            status: 'pending',
          },
          {
            id: 'doc-3',
            name: '일정표.pdf',
            type: 'file',
            version: 'v1.0',
            status: 'draft',
          },
        ],
      },
    ],
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderFileTree = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.includes(node.id);
    const isSelected = selectedFile === node.id;

    if (node.type === 'folder') {
      return (
        <div key={node.id}>
          <button
            onClick={() => toggleFolder(node.id)}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded text-left"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <FolderOpen className="w-4 h-4 text-primary" />
            <span>{node.name}</span>
          </button>
          {isExpanded && node.children?.map((child) => renderFileTree(child, level + 1))}
        </div>
      );
    }

    return (
      <button
        key={node.id}
        onClick={() => setSelectedFile(node.id)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
          isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
        }`}
        style={{ paddingLeft: `${level * 16 + 24}px` }}
      >
        {node.name.endsWith('.json') ? (
          <Settings className="w-4 h-4" />
        ) : (
          <File className="w-4 h-4" />
        )}
        <span className="flex-1">{node.name}</span>
        <span className="text-xs opacity-70">{node.version}</span>
      </button>
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-[#3DBE8B]';
      case 'pending':
        return 'bg-[#F5A524]';
      case 'draft':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved':
        return '승인 완료';
      case 'pending':
        return '승인 대기';
      case 'draft':
        return '작성 중';
      default:
        return '알 수 없음';
    }
  };

  const selectedFileData = fileTree.children
    ?.flatMap((child) => (child.type === 'folder' ? child.children || [] : [child]))
    .find((file) => file.id === selectedFile) || fileTree.children?.[0];

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Document Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <h2>{selectedFileData?.name || '파일을 선택하세요'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">
                      버전 {selectedFileData?.version || 'N/A'}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <Badge className={`${getStatusColor(selectedFileData?.status)} text-white`}>
                      {getStatusText(selectedFileData?.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => onNavigateToHistory(selectedFile)}
              >
                <GitCompare className="w-4 h-4" />
                Diff 비교
              </Button>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                복원
              </Button>
            </div>
          </div>

          <Separator />

          {/* Document Preview */}
          <Card className="p-6">
            <h3 className="mb-4">문서 미리보기</h3>
            <div className="bg-muted/30 rounded-lg p-6 min-h-[300px] space-y-4">
              <div className="space-y-2">
                <h4>2025년도 사업계획서</h4>
                <p className="text-muted-foreground">
                  본 문서는 2025년 회사의 주요 사업 방향과 목표를 담고 있습니다.
                </p>
              </div>
              <div className="space-y-2">
                <h4>1. 사업 목표</h4>
                <p className="text-muted-foreground">
                  - 전년 대비 매출 25% 증가
                  <br />
                  - 신규 시장 진출 3개국
                  <br />
                  - 고객 만족도 90% 이상 달성
                </p>
              </div>
              <div className="space-y-2">
                <h4>2. 주요 전략</h4>
                <p className="text-muted-foreground">
                  디지털 전환을 통한 업무 효율화 및 고객 경험 개선을 최우선 과제로 추진합니다.
                </p>
              </div>
            </div>
          </Card>

          {/* Commit Section */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2">
              <GitCommit className="w-5 h-5" />
              커밋 및 제출
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm">커밋 메시지 (한 줄 요약)</label>
                <Textarea
                  placeholder="예: 예산 항목 수정 및 일정 업데이트"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button className="gap-2">
                  <GitCommit className="w-4 h-4" />
                  커밋 및 저장
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => onNavigateToApproval(selectedFile)}
                >
                  승인 프로세스로 이동
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="mb-4">최근 활동</h3>
            <div className="space-y-3">
              {[
                { user: '김철수', action: '문서 승인', time: '2시간 전' },
                { user: '이영희', action: '버전 v4.2 커밋', time: '5시간 전' },
                { user: '박민수', action: '문서 수정', time: '1일 전' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {activity.user[0]}
                  </div>
                  <div className="flex-1">
                    <p>
                      <span>{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
