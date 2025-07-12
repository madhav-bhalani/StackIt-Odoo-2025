# StackIt Backend

A robust Node.js backend API for StackIt - A collaborative Q&A platform with AI-powered features.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Real-time**: Socket.io
- **AI Integration**: Gemini API (via colleague's functions)

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Data models & business logic
│   ├── routes/         # API route definitions
│   ├── middleware/     # Custom middleware
│   ├── services/       # Business logic & external services
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Database seeding
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── package.json        # Dependencies & scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed database
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get question by ID
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `GET /api/questions/:id/answers` - Get answers for question
- `POST /api/questions/:id/answers` - Post answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer

### Voting
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer

### AI Features
- `POST /api/questions/:id/ai-answer` - Generate AI answer
- `POST /api/questions/auto-tags` - Auto-generate tags
- `POST /api/content/summarize` - Summarize content

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stackit_db"

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# AI Integration (for colleague's functions)
GEMINI_API_KEY=your_gemini_api_key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🧪 Testing

```bash
npm test
```

## 📝 Contributing

1. Follow the MVC architecture pattern
2. Use Prisma for database operations
3. Implement proper error handling
4. Add JSDoc comments for functions
5. Follow ESLint and Prettier configurations

## 🔄 Database Schema

The database schema will be defined in `prisma/schema.prisma` and includes:

- Users (id, email, password, role, created_at, updated_at)
- Questions (id, title, description, user_id, tags, created_at, updated_at)
- Answers (id, content, user_id, question_id, is_accepted, created_at, updated_at)
- Votes (id, user_id, question_id, answer_id, vote_type, created_at)
- Tags (id, name, created_at)
- Notifications (id, user_id, type, content, is_read, created_at)

## 🚀 Deployment

The backend is designed to be deployed on platforms like:
- Heroku
- Railway
- DigitalOcean
- AWS

Make sure to set up environment variables in your deployment platform.
