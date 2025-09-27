# Playable Ads SaaS Backend

A robust backend API for creating and rendering playable ads with video processing capabilities. Built with TypeScript, Express, PostgreSQL, and RabbitMQ.

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **Project Management**: Create and manage ad projects
- **Asset Upload**: Support for image and video uploads
- **Video Rendering**: Asynchronous video processing with FFmpeg
- **Job Queue**: RabbitMQ-based job processing for render tasks
- **Analytics**: Event tracking system for ad performance
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Rate Limiting**: Built-in rate limiting for API protection
- **Docker Support**: Fully containerized application

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- RabbitMQ 3.12+
- Redis 7+
- FFmpeg (for video processing)
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Using Docker (Recommended)

1. Clone the repository:

```bash
git clone https://github.com/yourusername/playable-ads-backend.git
cd playable-ads-backend
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start all services:

```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000/api/v1`

### Manual Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/playable-ads-backend.git
cd playable-ads-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start required services:

```bash
# PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=playable_ads \
  -p 5432:5432 \
  postgres:15-alpine

# RabbitMQ
docker run -d \
  --name rabbitmq \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3.12-management-alpine

# Redis
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

5. Run database migrations:

```bash
npm run db:migrate
```

6. Start the development server:

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   └── index.ts     # Central config management
├── database/         # Database connection
│   └── index.ts     # Sequelize setup
├── middlewares/      # Express middlewares
│   ├── auth.ts      # JWT authentication
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validation.ts
├── models/          # Sequelize models
│   ├── User.ts
│   ├── Project.ts
│   ├── Asset.ts
│   ├── Job.ts
│   ├── Analytics.ts
│   └── index.ts
├── queue/           # RabbitMQ setup
│   ├── index.ts     # Queue service
│   └── worker.ts    # Job processor
├── routes/          # API routes
│   ├── auth.ts
│   ├── projects.ts
│   ├── jobs.ts
│   ├── analytics.ts
│   └── index.ts
├── services/        # Business logic
│   ├── authService.ts
│   ├── renderService.ts
│   └── storageService.ts
├── utils/           # Utility functions
│   ├── logger.ts
│   └── asyncHandler.ts
├── app.ts           # Express app setup
├── index.ts         # Server entry point
└── swagger.ts       # API documentation
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

### Projects

- `GET /api/v1/projects` - Get user's projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Assets

- `POST /api/v1/projects/:id/assets` - Upload asset to project

### Rendering

- `POST /api/v1/projects/:id/render` - Queue render job

### Jobs

- `GET /api/v1/jobs/:id` - Check job status
- `GET /api/v1/jobs` - Get all user's jobs

### Analytics

- `POST /api/v1/analytics` - Log analytics event
- `GET /api/v1/analytics/project/:id` - Get project analytics

## 📚 API Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api/v1/docs
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🚢 Deployment

### Using Docker

1. Build the production image:

```bash
docker build -t playable-ads-backend .
```

2. Run with docker-compose:

```bash
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment

1. Build the TypeScript code:

```bash
npm run build
```

2. Set NODE_ENV to production:

```bash
export NODE_ENV=production
```

3. Start the server:

```bash
npm run start:prod
```

## 🔧 Environment Variables

| Variable       | Description                          | Default                |
| -------------- | ------------------------------------ | ---------------------- |
| `NODE_ENV`     | Environment (development/production) | development            |
| `PORT`         | Server port                          | 3000                   |
| `DATABASE_URL` | PostgreSQL connection string         | -                      |
| `RABBITMQ_URL` | RabbitMQ connection string           | amqp://localhost       |
| `REDIS_URL`    | Redis connection string              | redis://localhost:6379 |
| `JWT_SECRET`   | Secret key for JWT tokens            | -                      |

## 🏗️ Architecture Decisions

### Technology Stack

- **Express + TypeScript**: Type-safe, scalable backend
- **PostgreSQL + Sequelize**: Robust relational database with ORM
- **RabbitMQ**: Reliable message queue for async processing
- **FFmpeg**: Industry-standard video processing
- **JWT**: Stateless authentication
- **Docker**: Consistent deployment across environments

### Design Patterns

- **Repository Pattern**: Clean separation of data access
- **Service Layer**: Business logic isolation
- **Queue Workers**: Asynchronous job processing
- **Error Middleware**: Centralized error handling

### Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on all endpoints
- Input validation with express-validator
- SQL injection prevention via Sequelize ORM

## 📊 Performance Considerations

- **Connection Pooling**: Optimized database connections
- **Job Queue**: Non-blocking video rendering
- **File Streaming**: Efficient large file handling
- **Caching**: Redis for frequently accessed data
- **Compression**: Response compression enabled

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Contact

For questions or support, please contact support@playableads.com

## 🎥 Demo Video

[Link to Loom video explaining architecture choices](https://www.loom.com/share/e2fd90be5c2041799d833ceeab0ce302?sid=2e6d92d1-c9c6-492b-91fb-dae3443cd9fd)

---

Built with ❤️ for the Playable Ads SaaS Platform
