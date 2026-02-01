# Campus Queue & Appointment Management System

## Project Overview
Campus Queue & Appointment Management System is a web-based application designed to manage queues and appointment bookings for university campus services (e.g. dean’s office, IT support, student affairs).

The system allows students to book appointments and join queues online, while staff and administrators manage services and analyze service load using MongoDB aggregations.

This project was developed as a **final project for the course “Advanced Databases (NoSQL)”**.

---

## Technology Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JWT (JSON Web Tokens)  
- **Authorization:** Role-based access control  
- **Frontend:** React (Vite)

---

## System Architecture
The application follows a client–server architecture:

Frontend (React) → REST API (Express) → MongoDB
↑
JWT Authentication


- The backend exposes a RESTful API
- MongoDB is used as the primary NoSQL database
- JWT is used for authentication and role-based authorization

---

## Database Design
The database uses both **referenced and embedded documents**.

### Main Collections
- **Users** – students, staff, administrators  
- **Services** – campus services  
- **Appointments** – service bookings  
- **Analytics** – materialized aggregation results  

Appointments reference users and services, while notes are stored as embedded documents inside appointments.

---

## Key Features
- Full CRUD operations across multiple collections
- JWT-based authentication
- Role-based authorization (`student`, `staff`, `admin`)
- Embedded documents (notes inside appointments)
- Advanced MongoDB update operators
- Multi-stage aggregation pipelines
- Materialized analytics using `$merge`
- Compound indexes and query optimization

---

## REST API Overview
**Authentication**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Services**
- `GET /api/services`
- `POST /api/services` (admin)
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

**Appointments**
- `POST /api/appointments`
- `GET /api/appointments`
- `POST /api/appointments/:id/notes`

**Analytics**
- `GET /api/analytics/service-load`
- `POST /api/analytics/service-load/rebuild` (admin)

---

## Aggregation & Analytics
The project includes a service load analytics endpoint implemented using MongoDB aggregation:

- `$match`
- `$group`
- `$avg`, `$sum`, `$min`, `$max`
- `$lookup`
- `$project`, `$sort`

Aggregation results can be written into a separate collection using `$merge` for improved performance.

---

## Indexing & Performance
A compound index is used to optimize frequent queries:
{ serviceId: 1, status: 1, startTime: 1 }

Query performance was verified using explain("executionStats"), confirming the use of IXSCAN and the absence of COLLSCAN.
Project Setup
Backend

cd backend
npm install
npm run dev

Example .env:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campus_queue
JWT_SECRET=your_secret_key

Frontend

cd frontend
npm install
npm run dev

Team Contribution

    Backend Developer: API design, MongoDB schema, aggregations, indexing, authentication

    Frontend Developer: UI implementation and API integration

Conclusion

This project demonstrates advanced usage of MongoDB, including data modeling, aggregation pipelines, materialized analytics, and query optimization.
It fully satisfies the requirements of the Advanced Databases (NoSQL) course.
