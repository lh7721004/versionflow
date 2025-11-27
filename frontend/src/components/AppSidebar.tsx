import { useEffect, useState } from 'react';
import { Home, Settings, Folder, Users, ChevronRight, ChevronDown, FolderOpen, File, Upload, ClipboardCheck, FolderPlus, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useProjects } from '../queries/useProjects';
import { useMyProjects } from '../queries/useProjects';
import { useProjectMembers } from '../queries/useProjects';
import { useAsyncError } from 'react-router-dom';
import { useMe } from '../queries/useMe';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';
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
interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

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
        // { id: `${projectId}/admin`, name: '관리자 설정', type: 'config' },
        // { id: `${projectId}/version`, name: '버전 관리 정책', type: 'config' },
        ...(project.children?.map(mapChildNode) ?? []),
      ],
    };
  });
}



interface AppSidebarProps {
  currentPage: string;
  isVisible: boolean;
  onNavigate: (page: string) => void;
  onDocumentClick?: (documentName: string, documentId: string) => void;
  onUploadClick?: (folderName: string, folderId: string) => void;
  onGlobalUploadClick?: () => void;
  onApprovalClick?: () => void;
  onApprovalManagementClick?: () => void;
  newlyCreatedProjectId: string | null;
}


export function AppSidebar({ 
  currentPage, 
  isVisible,
  onNavigate, 
  onDocumentClick,
  onGlobalUploadClick,
  onApprovalManagementClick,
  newlyCreatedProjectId,

}: AppSidebarProps) {
  
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['my-projects', 'participating-projects']);
  const [contextMenu, setContextMenu] = useState<{ 
    x: number; 
    y: number; 
    node: ProjectNode;
  } | null>(null);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [nodeToDelete, setNodeToDelete] = useState<ProjectNode | null>(null);
  const [selectedParentNode, setSelectedParentNode] = useState<ProjectNode | null>(null);
    // 새로 생성된 프로젝트를 자동으로 펼치기
  if (newlyCreatedProjectId && !expandedFolders.includes(newlyCreatedProjectId)) {
    setExpandedFolders((prev) => {
      // 'my-projects'도 함께 열기
      const newExpanded = [...prev, newlyCreatedProjectId];
      if (!newExpanded.includes('my-projects')) {
        newExpanded.push('my-projects');
      }
      return newExpanded;
    });
    toast.success('새 프로젝트가 생성되었습니다.');
  }
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: '대시보드', icon: Home },
    { id: 'upload', label: '업로드', icon: Upload },
    { id: 'approval', label: '승인관리', icon: ClipboardCheck }
  ];

  const {data,isLoading,isError} = useProjects({limit:20,offset:0});
  const {data:meProjects,isLoading:isMeProjectsLoading,isError:isMeProjectsError} = useMyProjects({limit:20,offset:0});
  const {data:me,isLoading:isMeLoading,isError:isMeError} = useMe();
  const {data:meMemberProjects,isLoading:isMeMemberProjectsLoading,isError:isMeMemberProjectsError} = useProjectMembers((me as any)?.id||"");

  const myProjects: ProjectNode[] = mapProjectsToNodes(data);
  const participatingProjects: ProjectNode[] = mapProjectsToNodes(meProjects?meProjects.owned:[]);
  const participatingProjects2: ProjectNode[] = mapProjectsToNodes(meProjects?meProjects.member:[]);

  const onCreateFolder = (parentId: string, folderName: string) => {
    // 폴더 생성 로직 구현
    console.log(`폴더 생성: ${folderName} in ${parentId}`);
  };
  
  const onDeleteNode = (nodeId: string) => {
    console.log(`노드 삭제: ${nodeId}`);
    if(nodeId.startsWith('project/')){
      // 프로젝트 삭제 로직 구현
      
    } else {
      // 폴더/파일 삭제 로직 구현
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleContextMenu = (e: React.MouseEvent, node: ProjectNode) => {
    if (node.type === 'folder' || node.type === 'project') {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        node: node
      });
      setSelectedParentNode(node);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const renderProjectTree = (node: ProjectNode, level: number = 0, treeKey: string) => {
    const isExpanded = expandedFolders.includes(node.id+'-'+treeKey);
    const isSelected = currentPage === node.id;

    if (node.type === 'project' || node.type === 'folder') {
      return (
        <div key={node.id}>
          <button
            onClick={() => {
              toggleFolder(node.id+'-'+treeKey);
              if (node.type === 'project') {
                onNavigate(node.id+'-'+treeKey);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, node)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
              isSelected && node.type === 'project'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {node.type === 'project' ? (
              <Folder className="w-4 h-4 text-primary" />
            ) : (
              <FolderOpen className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm truncate">{node.name}</span>
          </button>
          {isExpanded && node.children?.map((child) => renderProjectTree(child, level + 1, treeKey))}
        </div>
      );
    }

    return (
      <button
        key={node.id}
        onClick={() => {
          if (node.type === 'file' && onDocumentClick) {
            onDocumentClick(node.name, node.id);
          } else {
            onNavigate(node.id);
          }
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
          isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
        }`}
        style={{ paddingLeft: `${level * 16 + 24}px` }}
      >
        {node.type === 'config' ? (
          <Settings className="w-4 h-4 text-[#F5A524]" />
        ) : (
          <File className="w-4 h-4" />
        )}
        <span className="text-sm truncate">{node.name}</span>
      </button>
    );
  };

  const isMyProjectsExpanded = expandedFolders.includes('my-projects');
  const isParticipatingProjectsExpanded = expandedFolders.includes('participating-projects');

  return (
    <aside className={`w-64 border-r bg-card h-full overflow-y-auto ${isVisible==true?"":"hidden"}`} onClick={handleCloseContextMenu}>
      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleCloseContextMenu}
          />
          <div
            className="fixed bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setNodeToDelete(contextMenu.node);
                setShowDeleteDialog(true);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
            <button
              onClick={() => {
                setFolderName('');
                setSelectedParentNode(contextMenu.node);
                setShowCreateFolderDialog(true);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              폴더 생성
            </button>
          </div>
        </>
      )}
      
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'upload' && onGlobalUploadClick) {
                  onGlobalUploadClick();
                } else if (item.id === 'approval' && onApprovalManagementClick) {
                  onApprovalManagementClick();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <Separator className="my-4" />

        {/* 내가 생성한 프로젝트 */}
        <div className="space-y-1">
          <button
            onClick={() => toggleFolder('my-projects')}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-accent rounded text-left"
          >
            {isMyProjectsExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Folder className="w-4 h-4 text-primary" />
            <span className="text-sm">생성한 프로젝트</span>
          </button>
          {isMyProjectsExpanded && participatingProjects.map((project) => renderProjectTree(project, 1, 'my'))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-1">
          <button
            onClick={() => toggleFolder('participating-projects')}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-accent rounded text-left"
          >
            {isParticipatingProjectsExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Folder className="w-4 h-4 text-primary" />
            <span className="text-sm">참여한 프로젝트</span>
          </button>
          {isParticipatingProjectsExpanded && participatingProjects2.map((project) => renderProjectTree(project, 1, 'participating'))}
        </div>
      </nav>
      {/* 폴더 생성 다이얼로그 */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>폴더 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">폴더 이름</Label>
              <Input
                id="folder-name"
                placeholder="예: 문서"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && folderName.trim() && selectedParentNode) {
                    onCreateFolder(selectedParentNode.id, folderName.trim());
                    setShowCreateFolderDialog(false);
                    setFolderName('');
                    setSelectedParentNode(null);
                    toast.success('폴더가 생성되었습니다.');
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (folderName.trim() && selectedParentNode) {
                  onCreateFolder(selectedParentNode.id, folderName.trim());
                  setShowCreateFolderDialog(false);
                  setFolderName('');
                  setSelectedParentNode(null);
                  toast.success('폴더가 생성되었습니다.');
                }
              }}
              disabled={!folderName.trim()}
              className="bg-[#004B8D] hover:bg-[#003d73]"
            >
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{nodeToDelete?.name}"을(를) 삭제하면 하위 항목도 모두 삭제됩니다. 이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#E25A5A] hover:bg-[#c94d4d]"
              onClick={() => {
                if (nodeToDelete) {
                  if (nodeToDelete.type === 'config') {
                    toast.error('관리자 설정 및 버전 관리 정책 파일은 삭제할 수 없습니다.');
                  } else {
                    onDeleteNode(nodeToDelete.id);
                    toast.success(`${nodeToDelete.name}이(가) 삭제되었습니다.`);
                  }
                }
                setShowDeleteDialog(false);
                setNodeToDelete(null);
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}