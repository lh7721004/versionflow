import asyncHandler from '../middlewares/asyncHandler.js';
import { ProjectService } from '../services/project.service.js';

const projectService = new ProjectService();

export const createProject = asyncHandler(async (req, res) => {
  const data = await projectService.create(req.body);
  res.status(201).json({ data });
});

export const getProject = asyncHandler(async (req, res) => {
  const data = await projectService.get(req.params.id);
  res.json({ data });
});

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, sort, ownerId, memberUserId, status } = req.query;
  const data = await projectService.list({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort,
    ownerId,
    memberUserId,
    status
  });
  res.json({ data });
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

