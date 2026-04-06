Project Submission Documentation

https://a-hazel-ten-73.vercel.app/
This is the deployed link, here you can access the entire project 
If you want access as admin/analyst to evaluate, please mail me at @madhvichokda@gmail.com and I will update that.

Technical Decisions and Implementation

1. Framework and Core Stack

* The project is built using the MERN stack (MongoDB, Express, React, Node.js) to maintain a consistent JavaScript environment across the entire application
* This ensures seamless JSON-based communication between frontend and backend and improves developer productivity
* Vite is used for faster builds and efficient hot module replacement, making development smoother and quicker
* While other languages may offer performance benefits, Node.js was chosen for its ecosystem and rapid iteration, which is ideal for this project

2. Database Design and Data Persistence

* MongoDB with Mongoose is used as a flexible document-based database
* Financial records can vary in structure, so a NoSQL approach avoids rigid schemas and complex migrations
* Mongoose provides validation and structure while keeping development fast
* Data is stored using MongoDB Atlas, ensuring reliable cloud-based persistence and scalability

3. Authentication and User Management

* Clerk is integrated to handle authentication securely without building it from scratch
* The system supports creating and managing users along with assigning roles
* User status management such as active and inactive states is included to control access dynamically
* This reduces backend complexity while maintaining strong security practices

4. Role-Based Access Control (RBAC)

* The application implements clear role-based behavior enforced at the backend level
* Viewer: can only view dashboard data
* Analyst: can view records and access insights
* Admin: can create, update, and manage records and users
* Permissions are enforced using middleware, ensuring no unauthorized actions can be performed

5. Financial Records Management

* The backend supports full CRUD operations for financial data
* Each record includes amount, type (income or expense), category, date, and optional notes
* Users can filter records based on date, category, or type
* The design reflects real-world financial tracking needs and allows flexible data handling

6. Dashboard Summary APIs

* The system provides APIs that return aggregated data instead of only raw records
* Includes total income, total expenses, and net balance calculations
* Supports category-wise summaries, recent activity, and monthly or weekly trends
* This demonstrates the ability to design backend logic for analytics and reporting

7. Access Control Logic

* Access restrictions are strictly enforced at the backend using middleware
* Viewers cannot modify data, analysts can analyze but not manage, and admins have full control
* Ensures consistent and secure behavior across all endpoints

8. Validation and Error Handling

* All inputs are validated before processing to prevent invalid data entry
* The system returns clear and useful error messages
* Proper HTTP status codes are used for different scenarios
* Protects the application from incorrect or incomplete operations

9. Additional Backend Features

* Pagination is implemented for efficient handling of large datasets
* Search functionality allows quick retrieval of financial records
* Soft delete functionality prevents permanent data loss
* Basic rate limiting is included to protect APIs
* The project structure supports adding unit and integration tests
* APIs are designed to be easily documented using tools like Postman or Swagger

10. Architecture and Deployment Approach

* The project follows a unified full-stack structure where the Express server serves the React build
* This simplifies deployment and avoids CORS-related issues
* Ensures frontend and backend remain in sync
* Optimized for deployment platforms like Render for ease of use

Overall, the project demonstrates a well-structured backend system with proper user and role management, secure access control, flexible financial data handling, and meaningful dashboard analytics, reflecting practical and real-world application design.
