import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from './config/swagger.js';
import productRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import orderRoutes from './routes/orders.routes.js';
import {syncDatabase} from './models/index.js';
import path from 'path';
import {fileURLToPath} from 'url';

const app = express();
const PORT = 3000;

// ── CORS ───────────────────────────────────────────────────────────
// Sin esto el navegador bloquea las peticiones desde localhost:5173
// porque considera que vienen de un "origen cruzado" (cross-origin).
// Aquí le decimos explícitamente cuáles orígenes y métodos permitimos.
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ── Morgan ─────────────────────────────────────────────────────────
// Registra en consola cada petición que llega al servidor.
// Ejemplo: GET /api/products 200 4.532 ms
app.use(morgan('dev'));

// ── Body Parser ────────────────────────────────────────────────────
// Permite leer req.body cuando el cliente envía JSON
app.use(express.json());

// ── Rutas ──────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// ── Swagger ────────────────────────────────────────────────────────
// Documentación interactiva disponible en http://localhost:3000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import fs from 'fs';

// ── Health check ───────────────────────────────────────────────────
app.get('/api', (req, res) => {
    res.json({
        message: '🍰 Desserts API funcionando',
        docs: '/api-docs',
    });
});

// ── Debug Files ────────────────────────────────────────────────────
app.get('/api/debug-files', (req, res) => {
    try {
        const rootDir = path.join(__dirname, '..');
        const distDir = path.join(__dirname, '../dist');
        const distAssetsDir = path.join(__dirname, '../dist/assets');
        
        const rootFiles = fs.existsSync(rootDir) ? fs.readdirSync(rootDir) : [];
        const distFiles = fs.existsSync(distDir) ? fs.readdirSync(distDir) : [];
        const distAssetsFiles = fs.existsSync(distAssetsDir) ? fs.readdirSync(distAssetsDir) : [];
        
        res.json({
            cwd: process.cwd(),
            __dirname,
            rootDir,
            distDir,
            rootFiles,
            distFiles,
            distAssetsFiles,
            env: process.env.NODE_ENV
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from frontend
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for any other route (React router compatibility)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../dist/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send(`Error loading frontend: index.html not found. Path: ${indexPath}`);
        }
    });
});

// ── Iniciar ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    syncDatabase().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Servidor en http://localhost:${PORT}`);
            console.log(`📄 Swagger en http://localhost:${PORT}/api-docs`);
        });
    });
}

export default app; // necesario para Supertest en los tests
