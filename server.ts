import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, dbService } from './server/config/db';

// Import Route Handlers
import authRoutes from './server/routes/authRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import cropRoutes from './server/routes/cropRoutes';
import soilRoutes from './server/routes/soilRoutes';
import weatherRoutes from './server/routes/weatherRoutes';
import pestRiskRoutes from './server/routes/pestRiskRoutes';
import marketPriceRoutes from './server/routes/marketPriceRoutes';
import farmActivityRoutes from './server/routes/farmActivityRoutes';
import deviceRoutes from './server/routes/deviceRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Database (MongoDB with resilient fallback)
  await connectDB();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      service: 'AgriVision Intelligence Core API',
      version: '2.4.0',
      database: dbService.isMongoDB() ? 'MongoDB' : 'Smart In-Memory Store',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/crops', cropRoutes);
  app.use('/api/soil', soilRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/pest-risk', pestRiskRoutes);
  app.use('/api/market-prices', marketPriceRoutes);
  app.use('/api/farm-activities', farmActivityRoutes);
  app.use('/api/devices', deviceRoutes);

  // Centralized Error Handling Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[AgriVision Server Error]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An unexpected server error occurred.',
    });
  });

  // Vite Integration for Dev / Static serving for Prod
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AgriVision] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start AgriVision server:', err);
});
