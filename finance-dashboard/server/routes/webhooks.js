import express from "express";
import { Webhook } from "svix";
import { inngest } from "../inngest/client.js";

const router = express.Router();

// Need raw body for svix verification
router.post("/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    return res.status(500).json({ error: "No CLERK_WEBHOOK_SECRET set" });
  }

  // To check signature we need raw body from stream but since express.raw is used, req.body is a Buffer
  const payload = req.body.toString("utf8");
  const headers = req.headers;

  const wh = new Webhook(SIGNING_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("Webhook signature verification failed", err.message);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  if (evt.type === "user.created") {
    // Trigger inngest background job
    await inngest.send({
      name: "user.created",
      data: evt.data
    });
  }

  return res.status(200).json({ success: true });
});

export default router;
