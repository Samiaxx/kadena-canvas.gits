import express from "express";
import http from "http";
import cors from "cors";
import routes from "./routes";

const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────
// Middleware
// ─────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────
// API Routes
// ─────────────────────────────────────
app.use("/api", routes);

// ─────────────────────────────────────
// Health Check
// ─────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ─────────────────────────────────────
// Server Start
// ─────────────────────────────────────
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
