import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useFolder, useProjects, useMyProjects } from '../queries/useProjects';
import { useMe } from '../queries/useMe';
import { api } from '../api/api';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

interface GlobalFileUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface ProjectData {
  _id: string;
  name: string;
}

interface SelectProject {
  items:ProjectData[];
}
type ProjectNodeType = "project" | "config" | "folder" | "file";

interface ProjectNode {
  id: string;
  name: string;
  type: ProjectNodeType;
  path?: string;
  children?: ProjectNode[];
}
interface WrappedProjectsResponse {
  data: {
    items: ApiProjectItem[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
interface PlainProjectsResponse {
  items: ApiProjectItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
type ProjectsResponseLike = WrappedProjectsResponse | PlainProjectsResponse;
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
type ApiChildNodeType = "config" | "folder" | "file";

interface ApiChildNode {
  id: string;
  name: string;
  type: ApiChildNodeType;
  path?: string;
  children?: ApiChildNode[];
}
function mapChildNode(apiNode: ApiChildNode): ProjectNode {
  return {
    id: apiNode.id,
    name: apiNode.name,
    type: apiNode.type,
    path: apiNode.path,
    children: apiNode.children?.map(mapChildNode),
  };
}
function mapProjectsToNodes(
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
    return {
      id: project._id,
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
export function GlobalFileUpload({ open, onOpenChange }: GlobalFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState([] as (UploadedFile[]));
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError } = useProjects({limit:0,offset:0});
  const {data:meProjects,isLoading:isMeProjectsLoading,isError:isMeProjectsError} = useMyProjects({limit:20,offset:0});
  const { data: me } = useMe();

  const participatingProjects2: ProjectNode[] = mapProjectsToNodes(meProjects?meProjects.member:[]);

  const { data: folderData, isLoading: isFolderLoading, isError: isFolderError } = useFolder(selectedProject);
  // // 목업 프로젝트 데이터
  // const projects = [
  //   { id: 'proj-1', name: '신제품 개발 문서' },
  //   { id: 'proj-2', name: '마케팅 캠페인 2024' },
  //   { id: 'proj-3', name: '기술 문서' },
  //   { id: 'proj-4', name: 'HR 정책 문서' },
  // ];
const [projects, setProjects] = useState<SelectProject>({
  items: projectData ?? [],
});
  useEffect(()=>{
    if(projectData){
      setProjects(projectData);
    }
  },[projectData])
  // 프로젝트별 폴더 구조
  const projectFolders: Record<string, { id: string; name: string; path: string }[]> = {
    'proj-1': [
      { id: 'folder-1-1', name: '요구사항', path: '/요구사항' },
      { id: 'folder-1-2', name: '디자인', path: '/디자인' },
      { id: 'folder-1-3', name: '개발', path: '/개발' },
      { id: 'folder-1-4', name: '테스트', path: '/테스트' },
    ],
    'proj-2': [
      { id: 'folder-2-1', name: '캠페인 기획', path: '/캠페인 기획' },
      { id: 'folder-2-2', name: '콘텐츠', path: '/콘텐츠' },
      { id: 'folder-2-3', name: '분석', path: '/분석' },
    ],
    'proj-3': [
      { id: 'folder-3-1', name: 'API 문서', path: '/API 문서' },
      { id: 'folder-3-2', name: '아키텍처', path: '/아키텍처' },
      { id: 'folder-3-3', name: '가이드', path: '/가이드' },
    ],
    'proj-4': [
      { id: 'folder-4-1', name: '채용', path: '/채용' },
      { id: 'folder-4-2', name: '복지', path: '/복지' },
      { id: 'folder-4-3', name: '교육', path: '/교육' },
    ],
  };

  // 선택된 프로젝트의 폴더 목록
  const availableFolders = selectedProject ? projectFolders[selectedProject] || [] : [];

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return ImageIcon;
    if (type.includes('text') || type.includes('document')) return FileText;
    if (type.includes('code') || type.includes('json') || type.includes('xml')) return FileCode;
    return File;
  };

  const getFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: UploadedFile[] = await Promise.all(
      fileArray.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: await getFilePreview(file),
        status: 'pending' as const,
        progress: 0,
      }))
    );
    setUploadedFiles((prev: any) => [...prev, ...newFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles((prev: any[]) => prev.filter((f) => f.id !== id));
  };

  const handleCommit = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('업로드할 파일을 선택해주세요.');
      return;
    }
    if (!commitMessage.trim()) {
      toast.error('커밋 메시지를 입력해주세요.');
      return;
    }
    if (!selectedProject) {
      toast.error('프로젝트를 선택해주세요.');
      return;
    }
    if (!selectedFolder) {
      toast.error('폴더를 선택해주세요.');
      return;
    }
    // /projects/:projectId/upload
    // /projects/:projectId/upload

    // 모든 파일 업로드 시뮬레이션
    // for (const file of uploadedFiles) {
    //   if (file.status === 'pending') {
    //     await simulateUpload(file.id);
    //   }
    // }

    const authorId = (me as any)?.data?.id || (me as any)?.id;
    if (!authorId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      for (const f of uploadedFiles) {
        const form = new FormData();
        form.append('file', f.file);
        form.append('authorId', authorId);
        form.append('message', commitMessage);
        form.append('folderPath', selectedFolder || '/');
        await api.post(`/projects/${selectedProject}/upload`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      const projectName = projects.items.find((p: any) => p._id === selectedProject)?.name || selectedProject;
      toast.success(`${uploadedFiles.length}개 파일이 "${projectName}"에 성공적으로 커밋되었습니다.`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || '업로드/커밋에 실패했습니다.';
      toast.error(msg);
      return;
    }
    
    // 초기화 및 닫기
    setTimeout(() => {
      setUploadedFiles([]);
      setCommitMessage('');
      setSelectedProject('');
      setSelectedFolder('');
      onOpenChange(false);
    }, 1000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[100vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#004B8D]">파일 업로드 및 커밋</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-6 p-1 overflow-y-scroll">
          {/* Step 1: 파일 업로드 영역 */}
          

          {/* Step 2: 업로드된 파일 미리보기 */}
          {uploadedFiles.length > 0 ? (
            <div>
              <Label className="mb-2 block">1. 파일 선택 ({uploadedFiles.length})</Label>
              <ScrollArea className="h-48 border rounded-lg">
                <div className="p-4 space-y-2">
                  {uploadedFiles.map((uploadedFile) => {
                    const FileIcon = getFileIcon(uploadedFile.file);
                    return (
                      <Card key={uploadedFile.id} className="p-3">
                        <div className="flex items-start gap-3">
                          {/* 미리보기 또는 아이콘 */}
                          <div className="flex-shrink-0">
                            {uploadedFile.preview ? (
                              <img
                                src={uploadedFile.preview}
                                alt={uploadedFile.file.name}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                <FileIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* 파일 정보 */}
                          <div className="flex-1 min-w-0 max-w-72">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{uploadedFile.file.name}</p>
                                <p className="text-muted-foreground">
                                  {formatFileSize(uploadedFile.file.size)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {uploadedFile.status === 'success' && (
                                  <Badge variant="outline" className="bg-[#3DBE8B] text-white border-[#3DBE8B]">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    완료
                                  </Badge>
                                )}
                                {uploadedFile.status === 'error' && (
                                  <Badge variant="outline" className="bg-[#E25A5A] text-white border-[#E25A5A]">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    실패
                                  </Badge>
                                )}
                                {uploadedFile.status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(uploadedFile.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {uploadedFile.status === 'uploading' && (
                              <Progress value={uploadedFile.progress} className="mt-2" />
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ):<div>
            <Label className="mb-2 block">1. 파일 선택</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {}
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2">파일을 드래그 앤 드롭하거나</p>
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">파일 선택</span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>}

          <div>
            <Label htmlFor="commit-message" className="mb-2 block">
              2. 커밋 메시지
            </Label>
            <Textarea
              id="commit-message"
              placeholder="변경 사항에 대한 설명을 입력하세요..."
              value={commitMessage}
              onChange={(e: { target: { value: any; }; }) => setCommitMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="project-select" className="mb-2 block">
              3. 프로젝트 선택
            </Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger id="project-select">
                <SelectValue placeholder="커밋할 프로젝트를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {participatingProjects2.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="folder-select" className="mb-2 block">
              4. 폴더 선택
            </Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger id="folder-select">
                <SelectValue placeholder="커밋할 폴더를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { path: "/", _id: "root" },
                  ...(folderData !== undefined
                    ? folderData.map((folder: any) => ({
                        path: `/${folder.path}`,
                        _id: folder.id,
                      }))
                    : []),
                ].map((folder) => (
                  <SelectItem key={folder._id} value={folder.path}>
                    {folder.path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button 
            onClick={handleCommit}
            className="bg-[#004B8D] hover:bg-[#003d73]"
          >
            커밋
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
