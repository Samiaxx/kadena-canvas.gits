import { Router } from "express";
import { getKadenaNetworkStats } from "./services/kadenaStats";

const router = Router();

// ─────────────────────────────────────
// Kadena Network Stats (REAL DATA)
// ─────────────────────────────────────
router.get("/kadena/stats", async (_req, res) => {
  try {
    const stats = await getKadenaNetworkStats();
    res.json(stats);
  } catch (error) {
    console.error("Kadena stats error:", error);
    res.status(500).json({
      error: "Failed to fetch Kadena network stats"
    });
  }
});

// ─────────────────────────────────────
// Default API Route
// ─────────────────────────────────────
router.get("/", (_req, res) => {
  res.json({
    name: "Kadena Nexus API",
    status: "running"
  });
});

export default router;
