# ChatClone

## Introduction

Real-time chat platform enabling smooth user interactions. 
• Developed with Angular, Tailwind CSS, Node.js, Sockect.io and MongoDB.

## Demo
![Click here to watch Demo](/src/assets/demo)

## Features

- [x] Real-Time Messaging
- [x] User Authentication & Authorization
- [x] Friend List Management
- [x] Private  Chats


## User Flow

Sign Up/Login: Users register or log in to access the chat application.
Add Friends: Users can search for and add friends to their contact list.
Real-Time Chat: Once connected, users can send and receive messages in real-time.
Manage Conversations: Users can delete conversations, with updates reflected in real-time.
Notification Alerts: Users receive alerts for new messages or friend requests.

## Dependencies

## Backend(Node.js) [link](https://github.com/hyderdan/chat-clone-back-end-.git)
Express: Web framework for building the API.
Socket.io: For real-time communication between the server and clients.
Mongoose (if using MongoDB): For interacting with the MongoDB database.
Firebase Admin SDK (if using Firebase Realtime Database): For managing the Firebase database from the backend.
Cors: To handle cross-origin requests.
Body-parser: For parsing incoming request bodies in a middleware.
JWT (jsonwebtoken): For authentication and authorization using JSON Web Tokens.
Bcryptjs: For hashing and comparing passwords.
Dotenv: For loading environment variables from a .env file.

## Frontend (Angular)
Angular: Core framework for building the client-side application.
Socket.io-client: To connect the Angular app to the Socket.io server for real-time communication.
RxJS: For reactive programming and handling asynchronous events.
Angular Material (if used): For UI components and theming.
Tailwind CSS
Angular Router: For handling navigation between different components.
HttpClientModule: For making HTTP requests to the backend.
FormsModule: For handling forms in Angular.
Jwt-Decode (if used): For decoding JWT to
