import asyncHandler from '../middlewares/asyncHandler.js';
import { UserService } from '../services/user.service.js';
import ApiError from '../utils/ApiError.js';

const userService = new UserService();

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user?.sub) throw new ApiError(401, 'Unauthorized');
  const data = await userService.get(req.user.sub);
  res.json({ data });
});

export const createUser = asyncHandler(async (req, res) => {
  const { kakaoId, email, name, avatarUrl, role } = req.body;
  const data = await userService.register({ kakaoId, email, name, avatarUrl, role });
  res.status(201).json({ data });
});

export const getUser = asyncHandler(async (req, res) => {
  const data = await userService.get(req.params.id);
  res.json({ data });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const data = await userService.list({ page: Number(page) || 1, limit: Number(limit) || 10, sort });
  res.json({ data });
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = await userService.update(req.params.id, req.body);
  res.json({ data });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const data = await userService.remove(req.params.id);
  res.json({ data });
});
