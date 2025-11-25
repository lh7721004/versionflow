import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.js';

const r = Router();
r.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default r;
