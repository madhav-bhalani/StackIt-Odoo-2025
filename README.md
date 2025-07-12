# StackIt - Collaborative Q&A Platform

A minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. Built with modern web technologies and AI-powered features.

## 🚀 Project Structure

```
StackIt-Odoo-2025/
├── frontend/          # React + Vite + Chakra UI
├── backend/           # Node.js + Express + PostgreSQL + Prisma
└── README.md          # This file
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: React with Vite
- **UI Library**: Chakra UI
- **State Management**: React Context/Hooks
- **Rich Text Editor**: Tiptap or similar
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **AI Integration**: Gemini API (via colleague's functions)

## 📋 Features

### Core Features

- ✅ User authentication (register/login)
- ✅ Ask questions with rich text editor
- ✅ Answer questions with rich text editor
- ✅ Voting system (upvote/downvote)
- ✅ Tag system for questions
- ✅ Search and filter questions
- ✅ Accept answers (question owner only)

### AI Features

- 🤖 Auto-generate tags based on question content
- 🤖 Generate AI answers for questions
- 🤖 Summarize questions and answers

### User Roles

- **Guest**: View questions and answers
- **User**: Register, login, post questions/answers, vote
- **Admin**: Moderate content

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📁 Development Workflow

1. **Backend Development**: Work in the `backend/` directory

   - Follow MVC architecture
   - Use Prisma for database operations
   - Implement RESTful API endpoints
   - Add proper validation and error handling

2. **Frontend Development**: Work in the `frontend/` directory

   - Use Chakra UI components
   - Implement responsive design
   - Connect to backend API
   - Handle authentication state

3. **AI Integration**: Backend colleague will provide AI functions
   - Integrate Gemini API functions
   - Handle rate limiting and caching
   - Log AI operations for monitoring

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/stackit_db"
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions

- `GET /api/questions` - Get all questions (with filters)
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get question by ID
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers

- `GET /api/answers` - Get answers
- `POST /api/answers` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer

### AI Features

- `POST /api/ai/questions/:id/answer` - Generate AI answer
- `POST /api/ai/questions/auto-tags` - Auto-generate tags
- `POST /api/ai/content/summarize` - Summarize content

## 🎨 UI Screens

1. **Home Page**: Navigation, search, filters, question cards
2. **Ask Question**: Title, rich text editor, tags, submit
3. **Question Detail**: Question, answers, voting, add answer
4. **Register**: Email and password registration
5. **Login**: Email and password authentication

## 🤝 Contributing

1. Follow the established folder structure
2. Use the provided Cursor rules for consistency
3. Implement proper error handling
4. Add JSDoc comments for functions
5. Test your changes thoroughly
6. Follow the MVC pattern in backend
7. Use Chakra UI components in frontend

## 📝 Notes

- Backend uses MVC architecture with Prisma ORM
- Frontend uses Vite for fast development
- AI features will be integrated by a colleague
- Database seeding includes sample data
- CORS is configured for local development
- JWT authentication for secure API access

## 🚀 Deployment

The application is designed to be deployed on platforms like:

- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: PostgreSQL (managed service)

Make sure to set up environment variables in your deployment platform.
