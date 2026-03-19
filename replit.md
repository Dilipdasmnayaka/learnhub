# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Online Course Enrollment System with Payment Gateway Integration.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MongoDB with Mongoose (in-memory for development via mongodb-memory-server, set MONGODB_URI env var for production)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Email**: Nodemailer (set SMTP_* env vars)
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (Node.js + MongoDB)
│   │   └── src/
│   │       ├── models/     # Mongoose models: User, Course, Enrollment
│   │       ├── routes/     # REST API routes
│   │       ├── middleware/  # JWT auth middleware
│   │       └── lib/        # paymentStrategy.ts, mailer.ts
│   └── course-enrollment/  # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   └── api-zod/            # Generated Zod schemas from OpenAPI
```

## Key Features

1. **User Module**: Student registration/login with JWT. Admin login via hardcoded creds (admin@gmail.com / admin123).
2. **Admin Module**: Add/edit/delete courses from admin dashboard.
3. **Course Module**: 5 sample courses seeded (all under ₹500). Title, description, price, content.
4. **Payment Module**: Simulated UPI, Credit Card, Net Banking (Strategy Pattern). Confetti animation on success.
5. **Student Dashboard**: Enrolled courses, payment history, profile editing.
6. **Chatbot**: Floating rule-based chatbot for course/pricing/enrollment questions.
7. **Email Notifications**: Nodemailer sends registration and payment emails (requires SMTP config).

## Design Patterns Used

- **Factory Method Pattern**: User creation (student vs admin logic)
- **Strategy Pattern**: Payment processing (UPIPaymentStrategy, CreditCardPaymentStrategy, NetBankingPaymentStrategy)

## Environment Variables

- `MONGODB_URI` — MongoDB connection string (if not set, uses in-memory MongoDB)
- `JWT_SECRET` — JWT signing secret (defaults to a dev secret)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Email configuration

## Admin Credentials

- Email: admin@gmail.com
- Password: admin123

## Running

- Backend: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/course-enrollment run dev`
