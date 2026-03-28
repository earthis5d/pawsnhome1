import express from "express";
import { createServer as createViteServer } from "vite";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Server starting...');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('NODE_ENV:', process.env.NODE_ENV);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log('Starting in DEVELOPMENT mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom to handle HTML transformation manually
    });
    app.use(vite.middlewares);

    // Handle SPA fallback in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // 1. Read index.html
        let template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        );

        // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
        //    also applies HTML transforms from Vite plugins, e.g. global preambles
        //    from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template);

        // 3. Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Serve static files from the dist directory in production
    const distPath = path.resolve(__dirname, 'dist');
    console.log('Starting in PRODUCTION mode');
    console.log('Serving static files from:', distPath);
    
    if (!fs.existsSync(distPath)) {
      console.error('ERROR: dist directory not found! Did you run "npm run build"?');
    } else {
      console.log('dist directory found. Contents:', fs.readdirSync(distPath));
    }

    // Serve static assets first
    app.use(express.static(distPath, { index: false }));
    
    // Explicitly serve index.html for the root route
    app.get('/', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('index.html not found in dist directory');
      }
    });

    // Handle SPA fallback: serve index.html for all other routes
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      console.log('SPA Fallback: serving', indexPath, 'for', req.url);
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('SPA Fallback: index.html not found');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
