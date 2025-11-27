import asyncHandler from '../middlewares/asyncHandler.js';
import { ProjectService } from '../services/project.service.js';
import ApiError from '../utils/ApiError.js';

const projectService = new ProjectService();

export const createProject = asyncHandler(async (req, res) => {
  const data = await projectService.create(req.body);
  await projectService.addMember(data._id, { userId:req.body.ownerId, role:"owner", joinedAt: new Date() });
  res.status(201).json({ data });
});

export const getProject = asyncHandler(async (req, res) => {
  const data = await projectService.get(req.params.id);
  res.json({ data });
});

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, sort, ownerId, memberUserId, status } = req.query;
  const includeTree = req.query.includeTree === 'true';
  const params = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort,
    ownerId,
    memberUserId,
    status
  };
  const data = includeTree ? await projectService.listWithTree(params) : await projectService.list(params);
  res.json({ data });
});

export const listProjectFolders = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) throw new ApiError(400, 'projectId is required');
  const data = await projectService.listFolders(projectId);
  res.json({ data });
});

export const listProjectsByUserId = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const { userId } = req.params;
  if (!userId) throw new ApiError(400, 'userId is required');

  const data = await projectService.listMember(userId, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort
  });

  res.json({ data });
});

export const listMyProjects = asyncHandler(async (req, res) => {
  if (!req.user?.sub) throw new ApiError(401, 'Unauthorized');
  const { page, limit, sort, includeTree } = req.query;
  const commonParams = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort
  };

  const useTree = includeTree === 'true';

  const [owned, member] = await Promise.all([
    useTree
      ? projectService.listWithTree({ ...commonParams, ownerId: req.user.sub })
      : projectService.listOwned(req.user.sub, commonParams),
    useTree
      ? projectService.listWithTree({ ...commonParams, memberUserId: req.user.sub })
      : projectService.listMember(req.user.sub, commonParams)
  ]);

  res.json({
    data: {
      owned,
      member
    }
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const data = await projectService.update(req.params.id, req.body);
  res.json({ data });
});

export const addProjectMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const data = await projectService.addMember(req.params.id, { userId, role, joinedAt: new Date() });
  res.json({ data });
});

export const removeProjectMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await projectService.removeMember(req.params.id, userId);
  res.json({ data });
});

export const updateProjectMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const data = await projectService.updateMemberRole(req.params.id, userId, role);
  res.json({ data });
});
