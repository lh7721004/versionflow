import { Router } from 'express';
import { createUser, getUser, listUsers, updateUser, deleteUser, getCurrentUser } from '../controllers/user.controller.js';

const r = Router();

r.post('/', createUser);
r.get('/', listUsers);
r.get('/me', getCurrentUser);
r.get('/:id', getUser);
r.patch('/:id', updateUser);
r.delete('/:id', deleteUser);

export default r;
