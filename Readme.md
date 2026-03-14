# 🚀 ByteTalk - AI-Powered Real-Time Chat

ByteTalk is a premium, lightning-fast chat application featuring **Clerk Authentication**, **Gemini AI** integration, and a modern **WhatsApp-style** interface. Connect effortlessly, chat in real-time, and leverage AI for smart replies and conversation summaries.

## ✨ Premium Features

### 🔐 Authentication & Security
- **Clerk Integration**: Industry-standard authentication (Email/Password, Social logins).
- **Secure Sessions**: Protected routes and real-time Socket.io authentication via Clerk tokens.
- **Landing Page**: A beautiful, non-intrusive entry point for new users.
- **CSP Protected**: Robust Content Security Policy for secure script and media loading.

### ⚡ Real-Time Messaging (Socket.io)
- **Instant Chat**: Lightning-fast message delivery and typing indicators.
- **Online Presence**: Real-time tracking of users' online/offline status.
- **Voice Messages**: Record and send voice notes with a built-in interactive wave-visualizer.
- **Image Sharing**: High-speed image uploads and sharing via Cloudinary.

### 🧠 Gemini AI Integration
- **Smart Replies**: Get AI-generated response suggestions instantly during your chats.
- **Conversation Summary**: Summarize long chat histories into concise bullet points.
- **Message Analysis**: Deep dive into individual messages for AI-powered insights.

### 🏭 Enterprise Architecture
- **RabbitMQ**: Robust background job queue for async processing of messages and images.
- **Dockerized**: Fully containerized backend and frontend environments for seamless deployments.

### 🎨 WhatsApp-Style UI/UX
- **Multi-Section Sidebar**: Navigate easily between **Chats**, **Profile**, **Calls**, and **Shared Media**.
- **Date Grouping**: Messages are organized by date (Today, Yesterday, etc.) with modern separators.
- **Pinning & Reactions**: Keep important messages at the top and react with emojis.
- **Direct Profiles**: Click any avatar in the header to view user details in a sleek right sidebar.

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS + Lucide React
- **Backend**: Node.js + Express.js + Mongoose
- **Database**: MongoDB (Atlas)
- **Message Broker**: RabbitMQ
- **Real-Time**: Socket.io
- **Authentication**: Clerk SDK
- **AI Engine**: Google Gemini (Flash 1.5)
- **Media Storage**: Cloudinary (Image & Audio)
- **Styling**: Vanilla CSS (Premium Glassmorphism & Micro-animations)
- **Containerization**: Docker & Docker Compose

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Clerk account & API keys
- Gemini AI API key
- Cloudinary account

### Installation

#### Option 1: Docker (Recommended)
The easiest way to run the full stack (including RabbitMQ) is using Docker Compose:
```bash
# Clone the repository
git clone <repo-url>
cd ByteTalk

# Start the stack
docker-compose up --build -d
```

#### Option 2: Local Development
If you prefer running the servers natively:

```bash
# Clone the repository
git clone <repo-url>
cd ByteTalk

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd "../Chat Application"
npm install
```

### Environment Variables

#### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=<your-mongodb-uri>
CLERK_SECRET_KEY=<your-clerk-secret-key>
CLOUDINARY_CLOUD_NAME=<your-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
GEMINI_API_KEY=<your-google-ai-key>
RABBITMQ_URL=<your-rabbitmq-url>
```

#### Frontend (`Chat Application/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
VITE_BACKEND_URL=http://localhost:5000
```

### Running Locally

```bash
# Terminal 1: Start Backend
cd server
npm start

# Terminal 2: Start Frontend
cd "Chat Application"
npm run dev
```

## 📡 Key API Routes

- **GET /api/auth/check**: Syncs Clerk user with local MongoDB and returns user state.
- **PUT /api/auth/update-profile**: Updates user bio, name, or profile picture.
- **GET /api/messages/:id**: Fetches conversation history between users.
- **POST /api/messages/send/:id**: Sends a new message (text, image, or audio).
- **POST /api/messages/summarize**: Generates AI summaries for the current chat.

## 📜 License
MIT License
