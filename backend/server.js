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
app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`HTTP server running http://localhost:${PORT}`);
});
