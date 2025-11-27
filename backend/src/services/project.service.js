import { ProjectRepository } from '../repositories/project.repository.js';
import { FolderRepository } from '../repositories/folder.repository.js';
import { FileRepository } from '../repositories/file.repository.js';
import ApiError from '../utils/ApiError.js';
import { GitService } from './git.service.js';

export class ProjectService {
  constructor(
    repo = new ProjectRepository(),
    git = new GitService(),
    folderRepo = new FolderRepository(),
    fileRepo = new FileRepository()
  ) {
    this.repo = repo;
    this.git = git;
    this.folderRepo = folderRepo;
    this.fileRepo = fileRepo;
  }

  async create(payload) {
    const project = await this.repo.create(payload);
    const repoPath = await this.git.ensureRepo(project._id.toString());
    project.repoPath = repoPath;
    await project.save();
    return project;
  }

  async get(id) {
    const project = await this.repo.findById(id);
    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  }

  async list(params) {
    return this.repo.list(params);
  }

  async listWithTree(params) {
    const list = await this.repo.list(params);
    const projects = list.items;
    const items = [];

    for (const project of projects) {
      const [folders, filesPage] = await Promise.all([
        this.folderRepo.listByProject(project._id),
        this.fileRepo.listByProject(project._id, { page: 1, limit: 5000 })
      ]);
      const treeChildren = this._buildTree(project, folders, filesPage.items);
      items.push({
        ...project.toObject(),
        children: treeChildren
      });
    }

    return { ...list.toObject?.() || list, items };
  }

  async listByUser(userId, params) {
    return this.repo.listByUser(userId, params);
  }

  async listOwned(userId, params) {
    return this.repo.listOwned(userId, params);
  }

  async listMember(userId, params) {
    return this.repo.listMember(userId, params);
  }

  async update(id, patch) {
    const updated = await this.repo.updateById(id, patch);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }

  async updateVersioning(projectId, versioning) {
    const project = await this.repo.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');
    project.settings = project.settings || {};
    project.settings.versioning = {
      ...(project.settings.versioning || {}),
      ...versioning
    };
    await project.save();
    return project;
  }

  async remove(id, userId) {
    const project = await this.repo.findById(id);
    if (!project) throw new ApiError(404, 'Project not found');
    if (project.ownerId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only owner can delete project');
    }
    const deleted = await this.repo.deleteById(id);
    if (!deleted) throw new ApiError(404, 'Project not found');
    return { id };
  }

  async leaveProject(projectId, userId) {
    const project = await this.repo.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');
    const member = project.members.find((m) => m.userId.toString() === userId.toString());
    if (!member) throw new ApiError(400, 'Not a member of this project');
    if (member.role === 'owner') {
      throw new ApiError(403, 'Owner cannot leave. Transfer ownership or delete project.');
    }
    const updated = await this.repo.removeMember(projectId, userId);
    return updated;
  }

  async addMember(projectId, member) {
    const updated = await this.repo.addMember(projectId, member);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }

  async listMembers(projectId) {
    const project = await this.repo.findMembers(projectId);
    if (!project) throw new ApiError(404, 'Project not found');
    return project.members || [];
  }

  async removeMember(projectId, userId) {
    const updated = await this.repo.removeMember(projectId, userId);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }

  async updateMemberRole(projectId, userId, role) {
    const updated = await this.repo.updateMemberRole(projectId, userId, role);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }

  async listFolders(projectId) {
    return this.folderRepo.listByProjectFlat(projectId);
  }

  _buildTree(project, folders, files) {
    const folderNodes = new Map();
    const rootFolders = [];

    folders.forEach((f) => {
      const node = {
        id: f._id.toString(),
        name: f.name,
        type: 'folder',
        children: []
      };
      folderNodes.set(f._id.toString(), { node, parentId: f.parentFolderId ? f.parentFolderId.toString() : null, fileRefs: f.files || [] });
    });

    // Attach folders
    folderNodes.forEach(({ node, parentId }) => {
      if (parentId && folderNodes.has(parentId)) {
        folderNodes.get(parentId).node.children.push(node);
      } else {
        rootFolders.push(node);
      }
    });

    const fileMap = new Map();
    files.forEach((file) => {
      fileMap.set(file._id.toString(), file);
    });

    const rootFiles = [];
    files.forEach((file) => {
      const fNode = {
        id: file._id.toString(),
        name: file.path.split('/').pop(),
        type: 'file',
        path: file.path
      };
      if (file.folderId && folderNodes.has(file.folderId.toString())) {
        folderNodes.get(file.folderId.toString()).node.children.push(fNode);
      } else {
        rootFiles.push(fNode);
      }
    });

    // files referenced directly in folder.files
    folderNodes.forEach(({ node, fileRefs }) => {
      fileRefs?.forEach((fid) => {
        const file = fileMap.get(fid.toString());
        if (file) {
          node.children.push({
            id: file._id.toString(),
            name: file.path.split('/').pop(),
            type: 'file',
            path: file.path
          });
        }
      });
    });

    const configNodes = [
      { id: `project/${project._id}/admin`, name: '관리자 설정', type: 'config' },
      { id: `project/${project._id}/version`, name: '버전 관리 정책', type: 'config' }
    ];

    return [...configNodes, ...rootFolders, ...rootFiles];
  }
}
