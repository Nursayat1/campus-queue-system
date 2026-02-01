Campus Queue Management System
Project Overview

Campus Queue Management System is a web-based application designed to manage service queues and appointments in a university campus environment (e.g., IT support, administration offices, student services).

The system allows students to book appointments, staff to manage queues, and administrators to analyze service load using MongoDB aggregation pipelines.

This project was developed as a final project for the course Advanced Databases (NoSQL).

Technology Stack

Backend: Node.js, Express.js

Database: MongoDB (NoSQL)

Authentication: JWT (JSON Web Tokens)

Authorization: Role-based access control

Frontend: Web application (separate implementation)

System Architecture

The application follows a classic client–server architecture:

Frontend → REST API (Express) → MongoDB
                     ↑
               JWT Authentication


The backend exposes a RESTful API

MongoDB is used as the primary data store

JWT is used for authentication and role-based authorization

Database Design

The database uses both referenced and embedded documents.

Main Collections

Users (students, staff, admins)

Services (campus services)

Appointments (service bookings)

Analytics collections (materialized aggregation results)

Appointments reference users and services, while notes are stored as embedded documents.

Key Features

Full CRUD operations across multiple collections

JWT-based authentication and authorization

Role-based access (admin / staff / student)

Advanced update operations ($push, $pull, $set)

Multi-stage aggregation pipelines

Materialized analytics using $merge

Query optimization with compound indexes

REST API Overview

Examples of available endpoints:

Authentication

POST /api/auth/register

POST /api/auth/login

Services

GET /api/services

POST /api/services

PUT /api/services/:id

DELETE /api/services/:id

Appointments

POST /api/appointments

GET /api/appointments

POST /api/appointments/:id/notes

Analytics

GET /api/analytics/service-load

POST /api/analytics/service-load/rebuild

Aggregation & Analytics

The system includes a service load analytics endpoint implemented using a multi-stage MongoDB aggregation pipeline:

$match (date filtering)

$group (group by service)

$avg, $sum, $min, $max

$lookup (join with services)

$project and $sort

This endpoint provides insights such as:

total appointments per service

average priority

earliest and latest appointment times

Indexing & Performance

A compound index is used to optimize frequent queries:

{ serviceId: 1, status: 1, startTime: 1 }


Query analysis using explain() confirms:

Index Scan (IXSCAN)

No Collection Scan (COLLSCAN)

Team Contribution

Backend Developer: API design, MongoDB schema, aggregations, indexing, authentication

Frontend Developer: UI implementation and API integration

Conclusion

This project demonstrates advanced usage of MongoDB in a real-world scenario, including data modeling, aggregation pipelines, query optimization, and secure backend development.
It fully satisfies the requirements of the Advanced Databases (NoSQL) course.