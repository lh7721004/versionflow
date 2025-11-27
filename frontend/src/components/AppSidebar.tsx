import { useEffect, useState } from 'react';
import { Home, Settings, Folder, Users, ChevronRight, ChevronDown, FolderOpen, File, Upload, ClipboardCheck } from 'lucide-react';
import { Separator } from './ui/separator';
import { useProjects } from '../queries/useProjects';
import { useMyProjects } from '../queries/useProjects';
import { useProjectMembers } from '../queries/useProjects';
import { useAsyncError } from 'react-router-dom';
import { useMe } from '../queries/useMe';

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
}


export function AppSidebar({ 
  currentPage, 
  isVisible,
  onNavigate, 
  onDocumentClick,
  onUploadClick,
  onGlobalUploadClick,
  onApprovalClick,
  onApprovalManagementClick
}: AppSidebarProps) {
  
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['my-projects', 'participating-projects']);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string; folderName: string } | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: '대시보드', icon: Home },
    { id: 'upload', label: '업로드', icon: Upload },
    { id: 'approval', label: '승인관리', icon: ClipboardCheck },
    { id: 'settings', label: '설정', icon: Settings },
  ];

  const {data,isLoading,isError} = useProjects({limit:20,offset:0});
  const {data:meProjects,isLoading:isMeProjectsLoading,isError:isMeProjectsError} = useMyProjects({limit:20,offset:0});
  const {data:me,isLoading:isMeLoading,isError:isMeError} = useMe();
  const {data:meMemberProjects,isLoading:isMeMemberProjectsLoading,isError:isMeMemberProjectsError} = useProjectMembers((me as any)?.id||"");

  const myProjects: ProjectNode[] = mapProjectsToNodes(data);
  const participatingProjects: ProjectNode[] = mapProjectsToNodes(meProjects?meProjects.owned:[]);
  const participatingProjects2: ProjectNode[] = mapProjectsToNodes(meProjects?meProjects.member:[]);

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
        folderId: node.id,
        folderName: node.name
      });
    }
  };

  const handleUploadClick = () => {
    if (contextMenu && onUploadClick) {
      onUploadClick(contextMenu.folderName, contextMenu.folderId);
      setContextMenu(null);
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
          {isExpanded && node.children?.map((child) => renderProjectTree(child, level + 1))}
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
              onClick={handleUploadClick}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              파일 업로드
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
    </aside>
  );
}