import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import libraryRouter from "./routes/library";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer() {
  const app = express();

  // CORS configuration
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'http://127.0.0.1:3000'];

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        console.warn(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  };

  // Enable preflight across all routes
  app.options('*', cors(corsOptions));
  
  // Apply CORS to all routes
  app.use(cors(corsOptions));
  
  // Log all requests for debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip} (Origin: ${req.headers.origin || 'none'})`);
    next();
  });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve album art
  const albumArtDir = path.join(process.cwd(), 'album-art');
  app.use('/album-art', express.static(albumArtDir, {
    maxAge: '1y', // Cache album art for 1 year
    immutable: true
  }));

  // API routes
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok",
      version: process.env.npm_package_version || "1.0.0",
      node: process.version
    });
  });

  app.get("/api/demo", handleDemo);
  
  // Library management routes
  app.use("/api/library", libraryRouter);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('\n--- ERROR ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Error Stack:', err.stack || 'No stack trace available');
    console.error('Error Details:', {
      message: err.message,
      code: err.code,
      name: err.name,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        fullError: JSON.stringify(err, Object.getOwnPropertyNames(err))
      })
    });
    console.error('--- END ERROR ---\n');
    
    // More detailed error response in development
    const errorResponse = {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: {
          code: err.code,
          name: err.name,
          path: req.path,
          method: req.method
        }
      })
    };
    
    res.status(500).json(errorResponse);
  });

  return app;
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('\n--- UNCAUGHT EXCEPTION ---');
  console.error(error);
  console.error('--- END UNCAUGHT EXCEPTION ---\n');
  // Don't exit in development to allow for debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('\n--- UNHANDLED REJECTION ---');
  console.error('Reason:', reason);
  console.error('--- END UNHANDLED REJECTION ---\n');
});

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3001;
  
  console.log('\n--- STARTING SERVER ---');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Node.js version: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log('---\n');
  
  try {
    // Create HTTP server
    const app = createServer();
    
    // Start listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      const bind = typeof address === 'string' 
        ? 'pipe ' + address 
        : 'port ' + (address?.port || PORT);
        
      console.log('\n--- SERVER STARTED ---');
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Listening on ${bind}`);
      console.log('---\n');
    });
    
    // Error handling for the server
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('\n--- SERVER ERROR ---');
      console.error('Server error:', error);
      
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          console.error('Unknown server error:', error);
          process.exit(1);
      }
      console.error('--- END SERVER ERROR ---\n');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('\n--- UNHANDLED REJECTION ---');
      console.error('Reason:', reason);
      console.error('--- END UNHANDLED REJECTION ---\n');
    });
    
  } catch (error) {
    console.error('\n--- FATAL ERROR DURING SERVER STARTUP ---');
    console.error(error);
    console.error('--- END FATAL ERROR ---\n');
    process.exit(1);
  }
}
