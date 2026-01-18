import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
/**
 * Express App Configuration
 */
export const createApp = () => {
    const app = express();
    // Middleware: Security
    app.use(helmet());
    // Middleware: CORS
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    app.use(cors({
        origin: corsOrigin,
        credentials: true,
    }));
    // Middleware: Body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Middleware: Cookie parsing
    app.use(cookieParser());
    // Middleware: Debug logging
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
    // Routes: Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Routes: Authentication
    console.log('Mounting auth routes at /api/v1/auth');
    app.use('/api/v1/auth', authRoutes);
    // Middleware: 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Route not found',
            },
        });
    });
    // Middleware: Global error handler
    app.use((err, req, res, next) => {
        console.error('Error:', err);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
            },
        });
    });
    return app;
};
//# sourceMappingURL=app.js.map