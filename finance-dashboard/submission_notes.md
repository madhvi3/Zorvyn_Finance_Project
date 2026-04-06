# Project Submission Documentation

## Technical Decisions and Trade-offs

### 1. Framework & Core Stack: MERN (MongoDB, Express, React, Node.js)
-   **Decision**: I chose the MERN stack for its high developer productivity and seamless JSON-based data flow between the frontend and backend.
-   **Reasoning**: Using JavaScript across the entire stack simplifies the development process and allows for shared data types. Vite was chosen as the build tool for React due to its superior speed and modern HMR (Hot Module Replacement) capabilities.
-   **Trade-off**: While a compiled language (like Go or Rust) might offer better performance, Node.js provides a massive ecosystem of libraries and much faster iteration cycles, which is critical for an MVP dashboard.

### 2. Database: MongoDB with Mongoose
-   **Decision**: A NoSQL document database was selected over a traditional SQL database.
-   **Reasoning**: Financial records often vary in metadata (e.g., different transaction types like income vs. expense with varying fields). MongoDB’s flexible schema allows the application to evolve without complex migration scripts.
-   **Trade-off**: While SQL is often preferred for complex financial audits due to its relational integrity, MongoDB with Mongoose provides sufficient validation and significantly faster prototyping for dashboard analytics.

### 3. Authentication: Clerk
-   **Decision**: I integrated Clerk for identity management and Role-Based Access Control (RBAC).
-   **Reasoning**: Building a secure, multi-factor authentication system from scratch is time-consuming and risky. Clerk provides a premium UI, robust security out of the box, and a powerful middleware system for handling roles (Viewer, Analyst, Admin).
-   **Trade-off**: This adds a third-party dependency. However, the security benefits and reduction in backend boilerplate code far outweigh the dependency risk for this project scope.

### 4. Architecture: Unified Full-Stack Repository
-   **Decision**: The project is structured as a unified repository where the Express server serves the React production build.
-   **Reasoning**: This architecture simplifies deployment on platforms like Render, eliminates CORS issues, and ensures that the frontend and backend are always versions-synced.
-   **Trade-off**: In a massive production environment, you would typically host the frontend on a CDN (like Vercel) and the backend separately to scale them independently. I chose the unified approach for deployment simplicity and developer ease-of-use.

---

## Additional Notes

### Setup Prerequisites
-   **Node.js**: Version 20.x or higher.
-   **MongoDB Atlas**: A running cluster with a valid connection URI.
-   **Clerk API Keys**: Both Publishable and Secret keys are required for authentication to function.
-   **Environment Variables**: Ensure the `.env` file in the server directory is correctly configured as per the `.env.example`.

### Known Limitations
-   **Concurrency**: The current RBAC implementation relies on Clerk's metadata sync; there is a small latency (managed by Inngest) when a user first signs up and roles are initialized.
-   **Data Persistence**: Real-time updates depend on standard polling or manual refreshes; WebSockets could be implemented for live financial tracking in future versions.

### Areas for Improvement
1.  **Testing**: Implementing end-to-end (E2E) testing with Playwright or Cypress to ensure the complex RBAC permissions work across the entire UI.
2.  **Performance Optimization**: Adding Redis caching for aggregated financial analytics (like "Total Income" or "Monthly Trends") to reduce database load.
3.  **UI/UX**: Transitioning from Vanilla CSS to a more robust component library (like Shadcn/UI) for more complex data tables and accessibility (A11y) support.
