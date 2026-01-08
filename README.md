# Pantry App (CookPlanner)

## Overview

**Pantry App (CookPlanner)** is a full-stack web application designed to help users manage pantry items, plan meals, and make smarter cooking decisions with the help of automation and AI.

The app focuses on **real-world food management problems** such as ingredient tracking, expiration awareness, recipe matching, and shopping list generation, while being built with scalable, production-ready architecture.

---

## Core Features

### 🧺 Pantry Management

* Add, update, and remove pantry items
* Track quantity, unit, and expiration dates
* Categorize items for easy filtering
* Soft deletion to prevent data loss

### 🍳 Recipe & Cooking Support

* Match recipes based on available pantry items
* Identify missing ingredients automatically
* Save favorite recipes
* AI-assisted recipe suggestions (planned)

### 📅 Meal Planning

* Plan meals by date
* Deduct pantry quantities when meals are scheduled
* Prevent over-consumption and duplicate planning

### 🛒 Shopping List

* Auto-generate shopping lists from planned meals
* Manual add/remove support
* Mark items as purchased

### 👤 User & Security

* JWT-based authentication
* Role-based access (Admin / User)
* User-isolated data (each user sees only their own pantry)

---

## Tech Stack

### Frontend

* **React** (Vite)
* **TypeScript**
* Modern component-based UI
* REST API integration

### Backend

* **Node.js** + **Express**
* **MongoDB Atlas**
* **Mongoose** ODM
* RESTful API design

### Cloud & DevOps

* Cloudinary (image uploads)
* Environment-based configuration
* CI/CD via GitHub Actions (planned)

---

## System Architecture

```
Client (React)
   ↓ REST API
Backend (Node.js / Express)
   ↓
MongoDB Atlas
```

The system follows a **layered architecture**:

* Controller layer (request handling)
* Service layer (business logic)
* Data access layer (Mongoose models)

---

## Key Domain Models

* User
* PantryItem
* Recipe
* MealPlan
* ShoppingListItem
* Notification

Each domain model is designed to remain **loosely coupled** to ensure scalability and maintainability.

---

## API Design Principles

* RESTful endpoints
* Consistent HTTP status codes
* Input validation at API boundary
* Soft delete instead of hard delete

---

## Security Considerations

* JWT authentication middleware
* Authorization checks on every protected route
* No cross-user data access
* Environment secrets stored securely

---

## Example Use Case Flow

1. User signs up and logs in
2. User adds pantry items (rice, eggs, vegetables)
3. User selects a recipe
4. App checks pantry availability
5. Missing ingredients are added to shopping list
6. Meal is scheduled and pantry quantities are updated

---

## Future Enhancements

* AI cooking assistant (GPT-based)
* Barcode scanning for pantry items
* Expiration notifications
* Shared pantry (family or roommates)
* Mobile-friendly PWA

---

## Project Goals

* Solve real-life problems with clean architecture
* Demonstrate full-stack engineering skills
* Apply scalable backend design principles
* Build a foundation for AI-powered features

---

## Maintainer Notes

This project prioritizes **clarity, extensibility, and real-world usability**. Business logic is intentionally separated from data models to avoid tight coupling.

---

**Author:** Pantry App Team
**Last Updated:** Jan 2026
