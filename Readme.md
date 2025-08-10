# 🚀 ByteTalk - Real-Time Chat Application

ByteTalk is a sleek, modern, and lightning-fast chat platform that lets you connect with friends, share images, and chat in real-time — all wrapped in a beautifully responsive UI.

## ✨ Features

* 🔐 **User Authentication**: Secure login, logout, and registration with JWT.
* ⚡ **Real-Time Messaging**: Chat instantly with Socket.IO.
* 🖼 **Image Sharing**: Upload and send images effortlessly.
* 🔍 **User Search**: Find friends instantly by their name.
* 🛠 **Profile Customization**: Update your name, avatar, and more.

## 🛠 Tech Stack

* **Frontend**: React.js + Tailwind CSS
* **Backend**: Node.js + Express.js
* **Database**: MongoDB
* **Real-Time**: Socket.IO
* **Authentication**: JWT
* **Image Storage**: Cloudinary (or similar)

## 🚀 Getting Started

### Prerequisites

* Node.js installed
* MongoDB URI
* Cloudinary credentials (if using for images)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd ByteCode

# Backend
cd server
npm install

# Frontend
cd ../Chat Application
npm install
```

### Environment Variables

Backend `.env`:

```env
PORT=5000
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_URL=<your-cloudinary-url>
```

Frontend `.env`:

```env
REACT_APP_API_URL=<your-backend-api-url>
```

### Running Locally

```bash
# Backend
cd server
npm run dev

# Frontend
cd ../client
npm start
```

## 📡 API Endpoints

* **POST /api/auth/register** → Register a new user
* **POST /api/auth/login** → Login and receive a JWT
* **POST /api/auth/logout** → Logout the user
* **GET /api/users/search?name=** → Search users by name
* **PUT /api/users/profile** → Update user profile
* **POST /api/messages** → Send a message
* **GET /api/messages/\:userId** → Get messages with a specific user

## 📜 License

MIT License
