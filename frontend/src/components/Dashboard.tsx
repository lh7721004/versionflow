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
import { useProjects, useMyProjects } from '../queries/useProjects';
import { useCreateProject } from '../queries/useProjectMutations';
import { useMe } from '../queries/useMe';
import { useVersions } from '../queries/useVersions';

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

// 백엔드 응답 타입 (필요한 필드만)
interface ProjectApi {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  status: string;
  // ... 필요한 필드 추가 가능
}

interface ProjectListResponse {
  items: ProjectApi[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// 1번 형태
interface SimpleProject {
  id: string;
  name: string;
}

// 2번 형태
interface FolderInfo {
  id: string;
  name: string;
  path: string;
}

type ProjectFolderMap = Record<string, FolderInfo[]>;
export interface ProjectVersioningSettings {
  reviewRequired: boolean;
  minApprovals: number;
  allowedFileTypes: string[];
  autoMergeOnApproval: boolean;
}

export interface ProjectSettings {
  versioning: ProjectVersioningSettings;
}

export interface ProjectApiItem {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  status: string;
  members: {
    userId: string;
    role: string;
    joinedAt: string;
    _id: string;
  }[];
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
  repoPath: string;
  __v: number;
}

// ========================================
// 1) API에서 내려오는 타입들 (필요한 것만)
// ========================================

type ApiChildNodeType = "config" | "folder" | "file";

interface ApiChildNode {
  id: string;
  name: string;
  type: ApiChildNodeType;
  path?: string;
  children?: ApiChildNode[];
}

interface ApiProjectItem {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  status: string;
  members: any[];
  settings: {
    versioning: {
      reviewRequired: boolean;
      minApprovals: number;
      allowedFileTypes: string[];
      autoMergeOnApproval: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  repoPath: string;
  children?: ApiChildNode[];
}

// ① axios 응답이 { data: { items: [...] } } 인 경우
interface WrappedProjectsResponse {
  data: {
    items: ApiProjectItem[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ② useQuery에서 data가 이미 { items: [...] } 인 경우
interface PlainProjectsResponse {
  items: ApiProjectItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// 둘 다 받을 수 있도록 유니온 타입
type ProjectsResponseLike = WrappedProjectsResponse | PlainProjectsResponse;

// ========================================
// 2) 프론트에서 쓰는 트리 타입
// ========================================

export type ProjectNodeType = "project" | "config" | "folder" | "file";

export interface ProjectNode {
  id: string;
  name: string;
  type: ProjectNodeType;
  path?: string;
  children?: ProjectNode[];
}

// ========================================
// 3) children 재귀 매핑
// ========================================

function mapChildNode(apiNode: ApiChildNode): ProjectNode {
  return {
    id: apiNode.id,
    name: apiNode.name,
    type: apiNode.type,
    path: apiNode.path,
    children: apiNode.children?.map(mapChildNode),
  };
}

// ========================================
// 4) 최상단 projects → ProjectNode[] 매핑
//    (undefined 방어 + 응답 shape 2종 모두 지원)
// ========================================

export function mapProjectsToNodes(
  response?: ProjectsResponseLike
): ProjectNode[] {
  if (!response) return [];

  // 응답이 { data: { items: [...] } } 인 경우
  //       { items: [...] } 인 경우 둘 다 처리
  const items: ApiProjectItem[] =
    "data" in response
      ? response.data?.items ?? []
      : response.items ?? [];

  return items.map<ProjectNode>((project) => {
    const projectId = `project/${project._id}`;

    return {
      id: projectId,
      name: project.name,
      type: "project",
      children: [
        { id: `${projectId}/admin`, name: '관리자 설정', type: 'config' },
        { id: `${projectId}/version`, name: '버전 관리 정책', type: 'config' },
        ...(project.children?.map(mapChildNode) ?? []),
      ],
    };
  });
}
function mapToSimpleProjects(response: ProjectListResponse): SimpleProject[] | null {
  if(!response)
    return null;
  return response.items.map((project, index) => {
    // ① 예제처럼 "proj-1", "proj-2" 로 쓰고 싶으면:
    const generatedId = `proj-${index + 1}`;

    // ② 실제로는 Mongo _id 쓰고 싶으면:
    // const generatedId = project._id;

    return {
      id: generatedId,
      name: project.name,
    };
  });
}


export function Dashboard({ onNavigateToProject }: DashboardProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError } = useProjects({limit:0,offset:0});
  const { data: myProjectData, isLoading: isMyProjectLoading, isError: isMyProjectError } = useMyProjects({limit:0,offset:0});
  const { data: me, isLoading: isMeLoading, isError: isMeError } = useMe();
  const myProjects: ProjectNode[] = mapProjectsToNodes(projectData);
  
  // const [simpleProjects,setSimpleProjects] = useState(mapToSimpleProjects(myProjectData?.owned)||null);
  // const [simpleProjects2,setSimpleProjects2] = useState(mapToSimpleProjects(myProjectData?.member)||null);
  // const [myFolders, setMyFolders] = 
  const { data: versionsData } = useVersions({ limit: 10, sort: '-createdAt' });
  const documents: Document[] = (versionsData?.items || []).map((v: any) => ({
    id: v._id,
    name: v.fileId?.path?.split('/')?.pop() || v.commitId,
    version: v.commitId,
    status: v.status === 'rejected' ? 'rejected' : v.status === 'approved' ? 'approved' : 'pending',
    lastModifiedBy: v.authorId?.name || '작성자',
    lastModifiedDate: v.createdAt?.slice(0, 10) || '',
    projectId: v.projectId?._id || v.projectId || '',
  }));
  const [rejectedCount] = useState(documents.filter(d => d.status === 'rejected').length);
  const [pendingCount] = useState(documents.filter(d => d.status === 'pending').length);
  const [recentApprovedCount] = useState(documents.filter(d => d.status === 'approved').length);
  const [recentCommitCount] = useState(documents.length);
  const createProject = useCreateProject();


  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    try {
      const created = await createProject.mutateAsync({ name: projectName,description:projectDescription,ownerId:(me as any).id} as any);
      setShowCreateDialog(false);
      setProjectName('');
      const id = created?._id || created?.id;
      if (id) onNavigateToProject(id);
    } catch (err) {
      console.error('Failed to create project', err);
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
    console.log('myProjectData');
    console.log(myProjectData);
  },[myProjectData])
  useEffect(()=>{
    console.log('projectData');
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
          <CardHeader className="py-4">
            <CardDescription>승인 거절</CardDescription>
            <CardTitle className="text-[#E25A5A]">{rejectedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>승인 대기</CardDescription>
            <CardTitle className="text-[#F5A524]">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>최근 승인</CardDescription>
            <CardTitle className="text-[#3DBE8B]">{recentApprovedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardDescription>이번 주 커밋</CardDescription>
            <CardTitle>{recentCommitCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="mb-4">최근 업로드한 문서</h2>
        <Card>
            {documents&&documents.length!=0?
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>문서명</TableHead>
                <TableHead>버전</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>기여자</TableHead>
                <TableHead>수정일</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="hover:bg-muted/50"
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
        :<div className='w-full text-center py-8 text-gray-400 font-semibold'>최근 업로드한 문서가 없습니다.</div>}
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
            <div className="space-y-2">
              <Label htmlFor="project-name">프로젝트 설명</Label>
              <Input
                id="project-name"
                placeholder="예: 이 프로젝트는 2025 신규 프로젝트입니다."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
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
