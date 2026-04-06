import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { serve } from "inngest/express";

import { inngest } from "./inngest/client.js";
import { syncUserRole } from "./inngest/functions.js";

import webhooksRouter from "./routes/webhooks.js";
import recordsRouter from "./routes/records.js";
import dashboardRouter from "./routes/dashboard.js";
import usersRouter from "./routes/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set up Inngest API
app.use(
  "/api/inngest",
  express.json(),
  serve({
    client: inngest,
    functions: [syncUserRole],
  })
);

// Webhooks must be before standard json parser
app.use("/api/webhooks", webhooksRouter);

// Standard parsers
app.use(express.json());
app.use(cors());

// Protected API routes
app.use("/api/records", recordsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", usersRouter);

// Serve Static Files (Frontend)
const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));

// For SPA routing, serve index.html for all non-API paths
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// DB Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.log("Waiting for MONGO_URI setup...");
} else {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB Atlas");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error("MongoDB connection error:", err.message);
    });
}
