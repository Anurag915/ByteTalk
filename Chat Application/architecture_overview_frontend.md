# ByteTalk Frontend Architecture Overview

## ⚡ Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **State Management**: React Context API
- **Real-time**: Socket.IO Client
- **API Client**: Axios
- **Notifications**: React Hot Toast

## 📁 Project Structure
```text
src/
├── assets/      # Static assets (images, icons)
├── components/  # Reusable UI components
│   ├── ChatContainer.jsx  # Main chat interface
│   ├── RightSidebar.jsx   # user details/settings
│   └── Sidebar.jsx        # User list and navigation
├── context/     # Global state management
│   ├── AuthContext.jsx    # Auth, Token, Socket connection
│   └── ChatContext.jsx    # Messages, Users, Subscriptions
├── lib/         # Utilities (e.g., utils.js)
├── pages/       # Page components
│   ├── HomePage.jsx       # Root chat page
│   ├── LoginPage.jsx      # Login/Signup flow
│   └── ProfilePage.jsx    # User profile management
├── App.jsx      # Root component with routing
└── main.jsx     # App entry point
```

## 🔐 State Management & Authentication
### AuthContext
- **Responsibility**: Manages user session, JWT token, and the primary Socket.IO connection.
- **Key Features**:
  - Automatically checks authentication status on load if a token exists in `localStorage`.
  - Configures global `axios` defaults (base URL and headers).
  - Manages `onlineUsers` state synchronized via Sockets.
  - Handles login, logout, and profile updates.

### ChatContext
- **Responsibility**: Manages conversational data and real-time message updates.
- **Key Features**:
  - Fetches and stores the list of users and messages.
  - Tracks `selectedUser` for the active chat.
  - Manages `unseenMessages` counts.
  - Handles real-time message subscription via `socket.on("newMessage")`.
  - Uses `useRef` (e.g., `selectedUserRef`) to handle stale closures in socket listeners.

## 📡 Real-time Communication (Socket.IO)
1. **Connection**: Established in `AuthContext` as soon as a user logs in or is verified via [checkAuth](file:///c:/Users/anurag.prajapati/Documents/ByteTalk/Chat%20Application/src/context/AuthContext.jsx#31-48).
2. **Online Status**: The server emits `getOnlineUsers`, which `AuthContext` listens to.
3. **Messaging**: `ChatContext` listens for `newMessage`. If the sender is the `selectedUser`, the message is added to the active view and marked as seen. Otherwise, the unseen count is incremented.

## 🎨 UI/UX Patterns
- **Responsive Design**: Uses Tailwind's grid system to adjust layouts between mobile and desktop (e.g., Sidebar visibility).
- **Glassmorphism**: Heavy use of `backdrop-blur` and semi-transparent backgrounds for a modern look.
- **Multi-step Forms**: The [LoginPage](file:///c:/Users/anurag.prajapati/Documents/ByteTalk/Chat%20Application/src/pages/LoginPage.jsx#6-153) uses a state-driven approach to transition between sign-up steps (basic info -> bio).

## 🚀 Recent Observations
- **Refactoring**: [ChatContext.jsx](file:///c:/Users/anurag.prajapati/Documents/ByteTalk/Chat%20Application/src/context/ChatContext.jsx) contains significant blocks of commented-out code, indicating a recent transition to a more robust implementation (using `useCallback`, `useRef`, and better error handling).
- **Modern Standards**: Adoption of React 19 and Tailwind 4 shows a commitment to using the latest ecosystem features.
