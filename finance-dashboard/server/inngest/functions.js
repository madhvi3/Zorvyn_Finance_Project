import { inngest } from "./client.js";
import User from "../models/User.js";

export const syncUserRole = inngest.createFunction(
  { id: "sync-user-role", event: "user.created" },
  async ({ event, step }) => {
    const { id: clerkId, email_addresses, first_name, last_name } = event.data;
    
    // Clerk stores emails in an array
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : "";
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    await step.run("Create User in Database", async () => {
      // Check if it's the first user ever
      const userCount = await User.countDocuments();
      // First user becomes Admin automatically
      const role = userCount === 0 ? "Admin" : "Viewer";

      // Upsert the user
      await User.findOneAndUpdate(
        { clerkId },
        { email, name, role },
        { upsert: true, new: true }
      );

      return { clerkId, role };
    });
  }
);
