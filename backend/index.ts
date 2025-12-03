import app from "./hono";

const port = process.env.PORT || 3001;
const host = process.env.HOST || "0.0.0.0";

console.log(`🚀 Backend server starting...`);
console.log(`📍 Server running at: http://localhost:${port}`);
console.log(`📍 API endpoint: http://localhost:${port}/api/trpc`);
console.log(`📍 Health check: http://localhost:${port}/`);

// Export for Bun server
export default {
  port: Number(port),
  hostname: host,
  fetch: app.fetch,
};

