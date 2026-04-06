import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

export const requireAuth = ClerkExpressRequireAuth({});

export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const clerkId = req.auth.userId;
      if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(403).json({ error: "User not found in system" });
      }

      if (user.status === "Inactive") {
        return res.status(403).json({ error: "Account is inactive. Please contact an administrator." });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient permissions" });
      }

      // Attach our DB user model to req
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error during role verification" });
    }
  };
};
