import { useEffect, useState } from 'react';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useProjects } from '../queries/useProject';

interface DashboardProps {
  onNavigateToProject: (projectId: string) => void;
}

interface Document {
  id: string;
  name: string;
  version: string;
  status: 'approved' | 'pending' | 'rejected';
  lastModifiedBy: string;
  lastModifiedDate: string;
  projectId: string;
}

export function Dashboard({ onNavigateToProject }: DashboardProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError } = useProjects({limit:0,offset:0});

  const documents: Document[] = [
    {
      id: '1',
      name: '2025 사업계획서',
      version: 'v4.2',
      status: 'approved',
      lastModifiedBy: '김철수',
      lastModifiedDate: '2025-10-28',
      projectId: 'project-1',
    },
    {
      id: '2',
      name: '시스템 아키텍처 설계서',
      version: 'v2.0',
      status: 'pending',
      lastModifiedBy: '이영희',
      lastModifiedDate: '2025-10-27',
      projectId: 'project-2',
    },
    {
      id: '3',
      name: '고객 요구사항 명세서',
      version: 'v1.3',
      status: 'rejected',
      lastModifiedBy: '박민수',
      lastModifiedDate: '2025-10-26',
      projectId: 'project-1',
    },
    {
      id: '4',
      name: 'API 문서',
      version: 'v3.1',
      status: 'approved',
      lastModifiedBy: '정수진',
      lastModifiedDate: '2025-10-25',
      projectId: 'project-3',
    },
  ];

  const handleCreateProject = () => {
    if (projectName.trim()) {
      // 프로젝트 생성 로직
      setShowCreateDialog(false);
      setProjectName('');
      // 새 프로젝트로 이동
      onNavigateToProject('new-project');
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-[#3DBE8B] text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            승인됨
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[#F5A524] text-white">
            <Clock className="w-3 h-3 mr-1" />
            승인 대기
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-[#E25A5A] text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            승인 거절
          </Badge>
        );
    }
  };
  useEffect(()=>{
    console.log(projectData);
  },[projectData])

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>대시보드</h1>
          <p className="text-muted-foreground">최근 작업한 문서와 프로젝트를 확인하세요</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          새 프로젝트 만들기
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pt-4 pb-2">
            <CardDescription>승인 거절</CardDescription>
            <CardTitle className="text-[#E25A5A]">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pt-4 pb-2">
            <CardDescription>승인 대기</CardDescription>
            <CardTitle className="text-[#F5A524]">5</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pt-4 pb-2">
            <CardDescription>최근 승인</CardDescription>
            <CardTitle className="text-[#3DBE8B]">28</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pt-4 pb-2">
            <CardDescription>이번 주 커밋</CardDescription>
            <CardTitle>8</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="mb-4">최근 업로드한 문서</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>문서명</TableHead>
                <TableHead>버전</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>수정자</TableHead>
                <TableHead>수정일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onNavigateToProject(doc.projectId)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{doc.version}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>{doc.lastModifiedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{doc.lastModifiedDate}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 프로젝트 만들기</DialogTitle>
            <DialogDescription>
              프로젝트를 생성하면 관리자설정.json과 버전규칙.json 파일이 자동으로 생성됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">프로젝트 이름</Label>
              <Input
                id="project-name"
                placeholder="예: 2025 신규 프로젝트"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm">자동 생성될 파일:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 관리자설정.json - 승인자 계층 및 권한 설정</li>
                <li>• 버전규칙.json - 버전 번호 체계 및 규칙</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button onClick={handleCreateProject}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
