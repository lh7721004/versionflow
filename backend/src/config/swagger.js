import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const apisPath = path.join(process.cwd(), 'src', 'routes', '*.js');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VersionFlow API',
      version: '1.0.0',
      description: 'Kakao OAuth 기반 문서 버전 관리 API'
    },
    servers: [
      {
        url: '/api'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [apisPath]
};

export const swaggerSpec = swaggerJSDoc(options);

