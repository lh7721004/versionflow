import { useState } from 'react';
import { Home, Settings, Folder, Users, ChevronRight, ChevronDown, FolderOpen, File, Upload, ClipboardCheck } from 'lucide-react';
import { Separator } from './ui/separator';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

interface ProjectNode {
  id: string;
  name: string;
  type: 'project' | 'folder' | 'file' | 'config';
  children?: ProjectNode[];
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

  // 예시 프로젝트 데이터 - 트리 구조
  const myProjects: ProjectNode[] = [
    {
      id: 'project-1',
      name: 'ERP 시스템 개발',
      type: 'project',
      children: [
        { id: 'project/1/admin', name: '관리자 설정', type: 'config' },
        { id: 'project/1/version', name: '버전 관리 정책', type: 'config' },
        {
          id: 'project/1/folder/1',
          name: '요구사항',
          type: 'folder',
          children: [
            { id: 'project/1/doc/1', name: '기능명세서.docx', type: 'file' },
            { id: 'project/1/doc/2', name: '화면설계.pdf', type: 'file' },
          ],
        },
        {
          id: 'project/1/folder/2',
          name: '설계',
          type: 'folder',
          children: [
            { id: 'project/1/doc/3', name: 'DB설계.xlsx', type: 'file' },
            { id: 'project/1/doc/4', name: '아키텍처.pdf', type: 'file' },
          ],
        },
        { id: 'project/1/doc/5', name: '프로젝트계획서.docx', type: 'file' },
      ],
    },
    {
      id: 'project/2',
      name: '마케팅 캠페인 2024',
      type: 'project',
      children: [
        { id: 'project/2/admin', name: '관리자 설정', type: 'config' },
        { id: 'project/2/version', name: '버전 관리 정책', type: 'config' },
        { id: 'project/2/doc/1', name: '캠페인기획안.pptx', type: 'file' },
        { id: 'project/2/doc/2', name: '예산안.xlsx', type: 'file' },
        {
          id: 'project/2/folder/1',
          name: '디자인',
          type: 'folder',
          children: [
            { id: 'project/2/doc/3', name: '배너디자인.png', type: 'file' },
          ],
        },
      ],
    },
    {
      id: 'project/3',
      name: '신제품 개발 문서',
      type: 'project',
      children: [
        { id: 'project/3/admin', name: '관리자 설정', type: 'config' },
        { id: 'project/3/version', name: '버전 관리 정책', type: 'config' },
        { id: 'project/3/doc/1', name: '제품기획서.docx', type: 'file' },
        { id: 'project/3/doc/2', name: '시장조사.pdf', type: 'file' },
      ],
    },
  ];

  const participatingProjects: ProjectNode[] = [
    {
      id: 'project/4',
      name: 'HR 정책 문서',
      type: 'project',
      children: [
        { id: 'project/4/admin', name: '관리자 설정', type: 'config' },
        { id: 'project/4/version', name: '버전 관리 정책', type: 'config' },
        { id: 'project/4/doc/1', name: '근무규정.docx', type: 'file' },
        { id: 'project/4/doc/2', name: '휴가정책.pdf', type: 'file' },
      ],
    },
    {
      id: 'project/5',
      name: '재무 보고서',
      type: 'project',
      children: [
        { id: 'project/5/admin', name: '관리자 설정', type: 'config' },
        { id: 'project/5/version', name: '버전 관리 정책', type: 'config' },
        {
          id: 'project/5/folder/1',
          name: '2024년',
          type: 'folder',
          children: [
            { id: 'project/5/doc/1', name: '1분기보고서.xlsx', type: 'file' },
            { id: 'project/5/doc/2', name: '2분기보고서.xlsx', type: 'file' },
          ],
        },
      ],
    },
  ];

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

  const renderProjectTree = (node: ProjectNode, level: number = 0) => {
    const isExpanded = expandedFolders.includes(node.id);
    const isSelected = currentPage === node.id;

    if (node.type === 'project' || node.type === 'folder') {
      return (
        <div key={node.id}>
          <button
            onClick={() => {
              toggleFolder(node.id);
              if (node.type === 'project') {
                onNavigate(node.id);
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
            <span className="text-sm">내가 생성한 프로젝트</span>
          </button>
          {isMyProjectsExpanded && myProjects.map((project) => renderProjectTree(project, 1))}
        </div>

        <Separator className="my-4" />

        {/* 참여한 프로젝트 */}
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
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm">참여한 프로젝트</span>
          </button>
          {isParticipatingProjectsExpanded && participatingProjects.map((project) => renderProjectTree(project, 1))}
        </div>
      </nav>
    </aside>
  );
}