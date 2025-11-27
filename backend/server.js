import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { loadEnv } from './src/config/env.js';
import { connectDB } from './src/db/index.js';
import router from './src/routes/index.js';
import notFound from './src/middlewares/notFound.js';
import errorHandler from './src/middlewares/errorHandler.js';
import path from 'path';

loadEnv();
await connectDB();

const app = express();

app.use(helmet());
app.use(express.json({ limit: '3mb' }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.get('/health', (req, res) => res.json({ ok: true }));

// serve repositories statically for previews
const reposPath = path.join(process.cwd(), 'repos');
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(
  '/static/repos',
  (req, res, next) => {
    // allow embedding from frontend for PDF/video/image previews
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${FRONTEND_ORIGIN}`);
    next();
  },
  express.static(reposPath)
);

app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`HTTP server running http://localhost:${PORT}`);
});
