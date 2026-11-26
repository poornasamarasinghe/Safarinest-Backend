# ⚙️ SafariNest Backend
### RESTful API for Safari Booking & Wildlife Management

The SafariNest Backend is a server-side application responsible for managing booking operations, wildlife sighting records, and communication between the frontend application and the database.

It provides RESTful API endpoints and integrates with Firebase Firestore for data storage.

## ✨ Key Responsibilities

### 📅 Booking Management
- Process safari booking requests.
- Manage booking information.
- Handle booking availability.
- Manage booking time slots.
- Support booking cancellation.
- Manage waiting-list operations.

### 🐘 Wildlife Sighting Management
- Process wildlife sighting reports.
- Store geographical sighting information.
- Manage animal types and sighting details.
- Support wildlife observation data retrieval.

### 📧 Email Notifications
- Booking confirmation emails.
- Booking-related notifications.
- Cancellation links in booking emails.

### 🗄️ Database Management
- Firebase Firestore integration.
- Centralized data management.
- Persistent booking and wildlife records.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | Backend framework |
| Firebase Admin SDK | Firebase integration |
| Cloud Firestore | Database |
| Nodemailer / SMTP | Email delivery |
| Multer | File upload handling |
| CORS | Cross-origin communication |
| dotenv | Environment configuration |

## 🏗️ Backend Architecture

The application follows a layered architecture to separate responsibilities and improve maintainability.

```text
Client Application
       |
       v
   API Routes
       |
       v
   Controllers
       |
       v
    Services
       |
       v
  Repositories
       |
       v
 Firebase Firestore
```

### Architecture Components

**Routes**
- Define API endpoints.
- Direct incoming requests to appropriate controllers.

**Controllers**
- Handle HTTP requests and responses.
- Coordinate application operations.

**Services**
- Implement application business logic.
- Handle booking and wildlife management operations.

**Repositories**
- Manage database interactions.
- Communicate with Firestore.

## 📂 Project Structure

```text
Safarinest-Backend/
│
├── src/
│
├── public/
│   └── uploads/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js
- npm
- Firebase project
- Firebase service account credentials

### 1. Clone the repository

```bash
git clone https://github.com/poornasamarasinghe/Safarinest-Backend.git
```

### 2. Navigate to the project

```bash
cd Safarinest-Backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory.

Use the following configuration:

```env
PORT=5000

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

EMAIL_FROM_NAME=SafariNest Reservations

CLIENT_URL=http://localhost:3000
```

**Important:** Never commit your actual `.env` file or Firebase service account credentials.

### 5. Start the backend server

Use the development script configured in `package.json`:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## 🔗 Related Repository

**Frontend:** SafariNest

## 🎯 Project Objective

The backend provides the core server-side functionality of SafariNest, ensuring reliable communication between the frontend, booking management operations, and Firestore database.

---

**Developed by:** Poorna Samarasinghe

**Project:** SafariNest Backend API
