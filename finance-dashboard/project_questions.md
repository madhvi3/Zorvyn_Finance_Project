# Finance Dashboard Project - Requirements & Interview Questions

## Part 1: Project Requirements & Tasks Checklist
Here is the extracted list of tasks and requirements asked in this project prompt.

### 1. User and Role Management
- [ ] Implement User creation and management.
- [ ] Assign roles to users (Viewer, Analyst, Admin).
- [ ] Manage user status (Active / Inactive).
- [ ] Restrict actions based on roles (Viewer: read-only dashboard, Analyst: read records/insights, Admin: full management).

### 2. Financial Records Management
- [ ] Create financial records containing fields: Amount, Type (income/expense), Category, Date, Notes.
- [ ] Implement CRUD operations for records (Create, Read, Update, Delete).
- [ ] Implement filtering based on criteria (date, category, type).

### 3. Dashboard Summary APIs
- [ ] Create APIs to return summary-level data.
- [ ] Calculate: Total income, Total expenses, Net balance.
- [ ] Calculate: Category-wise totals.
- [ ] Fetch: Recent activity.
- [ ] Calculate: Monthly or weekly trends.

### 4. Access Control Logic
- [ ] Implement backend-level access control (Middleware / Guards / Policies).
- [ ] Enforce Role-Based Access Control (RBAC) securely at the endpoint level.

### 5. Validation and Error Handling
- [ ] Implement input validation for all endpoints.
- [ ] Return structured and useful error responses.
- [ ] Use appropriate HTTP status codes (e.g., 200, 201, 400, 401, 403, 404, 500).
- [ ] Protect against invalid operations.

### 6. Data Persistence
- [ ] Set up the database (Relational, Document, or SQLite) and structure the data models.

### 7. Bonus / Additional Functionalities
- [ ] Implement Authentication (Tokens or Sessions).
- [ ] Add Pagination to record listing.
- [ ] Implement Search support.
- [ ] Add Soft Delete functionality.
- [ ] Implement Rate Limiting.
- [ ] Write Unit tests or Integration tests.
- [ ] Create API Documentation.

---

## Part 2: Potential Interview / Follow-up Questions
If you are presenting this project in an interview or review, here are the likely questions you might be asked regarding your technical decisions:

### Architecture & Database
1. **Database Choice:** What database did you choose for storing financial records and why (Relational vs. NoSQL approach)?
2. **Data Modeling:** How did you design the schema/models to support different user roles and their relationships to records?
3. **Data Integrity:** How do you handle precise monetary amounts in your database to avoid floating-point math errors?

### Authorization & RBAC
4. **Middleware Logic:** Can you walk me through how your Role-Based Access Control (RBAC) middleware works? 
5. **Security enforcement:** How do you prevent an `Analyst` from creating a new financial record or modifying an existing one?
6. **Authentication:** How is user authentication managed? If using JSON Web Tokens (JWTs), how do you securely store them and handle token expiration/revocation?

### Aggregation & Performance
7. **Aggregations:** How are the Dashboard Summaries (e.g., category-wise totals, monthly trends) calculated? Are they aggregated directly in the database query (e.g., SQL `GROUP BY` or Mongo Aggregation pipeline), or using code in the application layer?
8. **Scaling:** If the database grows to millions of records, how would you optimize the summary APIs to maintain fast load times?
9. **Data retrieval:** How did you implement pagination and filtering for retrieving financial records efficiently?

### Security, Validation & Error Handling
10. **Validation Strategy:** Can you give an example of how you handle input validation? What library did you use (e.g., Zod, Joi, class-validator) and why?
11. **Status Codes:** How do you respond to unauthorized requests? Can you explain the difference between `401 Unauthorized` and `403 Forbidden` in your system?
12. **Defense Mechanisms:** Tell me about your rate-limiting implementation. How does it prevent brute-force or DDoS attacks?

### General Node.js / Backend
13. **Testing:** Describe your approach to testing. What components or endpoints of the backend did you prioritize for unit/integration tests?
14. **Soft Deletes:** How does the "soft delete" feature work under the hood? Does it cascade to other related data? How do you ensure soft-deleted items don't show up in dashboard summaries?
