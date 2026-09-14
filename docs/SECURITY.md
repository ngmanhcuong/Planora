# 🔒 Planora - Security & Privacy Architecture

**Release Identifier**: Planora Core v1.0.0  

Security and data integrity are fundamental to the architecture of Planora.

---

## 🛡️ Key Security Controls

### 1. Authentication & JWT Tokens
- **Mechanism**: Stateless JSON Web Tokens (`jsonwebtoken`) signed with a SHA-256 HMAC secret.
- **Header**: Standard HTTP `Authorization: Bearer <token>` header.
- **Expiration**: Standard token validity duration enforced by `JWT_EXPIRES_IN` (default: 7 days).

### 2. Password Protection (Bcrypt)
- **Algorithm**: `bcryptjs` with salt rounds (10 rounds default).
- **Storage**: Plaintext passwords are never logged, transmitted in error messages, or stored in the database. Only `passwordHash` is persisted.

### 3. Strict Input Validation (Zod)
- **Edge Validation**: All API request bodies, URL path parameters, and query strings are validated through Zod schemas before reaching business logic controllers.
- **Sanitization**: Strips unvalidated properties automatically to mitigate mass assignment vulnerabilities.

### 4. Multi-Tenant Data Isolation
- **Database Enforced Scoping**: Every user-owned entity (Task, Event, Timetable, Habit, Notification) includes a mandatory `userId` foreign key.
- **Query Scoping**: Database queries strictly combine record identification with authenticated user context:
  ```typescript
  // Example Prisma ownership filter
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: req.user.id }
  });
  ```
- **Cross-Tenant Security**: Prevents User B from querying, updating, or deleting User A's data, returning HTTP 404 or HTTP 403.

### 5. HTTP Security Hardening (Helmet & CORS)
- **Helmet Headers**: Protects Express application from cross-site scripting (XSS), clickjacking, and MIME-sniffing.
- **CORS Policy**: Configured to restrict origin requests strictly to the domain specified in `FRONTEND_URL`.

### 6. Environment Secret Management
- Secrets (`DATABASE_URL`, `JWT_SECRET`, `AI_API_KEY`) are managed strictly via environment variables (`.env`).
- Dedicated `.env.example` templates contain only non-sensitive placeholders.

### 7. Global Error Sanitization
- In `production` environment (`NODE_ENV=production`), internal database stack traces and unhandled exception details are suppressed.
- Standardized user-friendly error messages are returned (`"Internal Server Error"`).

---

## 🤖 AI Security & Privacy Protections

### 1. Prompt Injection Defense
- User text input passed to AI assistant or scheduler endpoints is sanitized and enclosed within rigid structural prompt tags before sending to LLMs.
- System instructions explicitly direct the LLM to ignore embedded commands asking to bypass constraints.

### 2. AI Data Minimization
- Only non-identifiable task titles, due dates, and duration slots are sent to external AI providers.
- Passwords, email addresses, and personal profile information are strictly excluded from AI payload builders.

### 3. Graceful Fallback Mode
- Unconfigured or failing AI provider credentials return HTTP 503 Service Unavailable without exposing internal API keys or crashing backend process loops.

---

## ⚠️ Known Security Limitations

> [!WARNING]
> **Stateless JWT Logout**:
> - Logout in Planora is currently handled **client-side** by clearing token state from Zustand local storage.
> - Because tokens are stateless, an issued JWT remains technically valid on the backend until its expiration time unless a server-side token blacklist (e.g. Redis cache) is implemented in future iterations.
