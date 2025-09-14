# Multi-Tenant SaaS Notes Application - API Documentation

## 🏢 Multi-Tenant Architecture

The application supports multiple tenants (companies) with complete data isolation:

- **Acme Corporation** (slug: `acme`)
- **Globex Corporation** (slug: `globex`)

## 👥 Test Accounts

All accounts use password: `password`

| Email | Role | Tenant | Capabilities |
|-------|------|--------|--------------|
| admin@acme.test | Admin | Acme | Full admin access, can upgrade subscription |
| user@acme.test | Member | Acme | Notes CRUD operations only |
| admin@globex.test | Admin | Globex | Full admin access, can upgrade subscription |
| user@globex.test | Member | Globex | Notes CRUD operations only |

## 📋 Subscription Plans

### Free Plan (Default)
- ✅ Maximum 3 notes per tenant
- ✅ Basic note operations (CRUD)
- ✅ Role-based access control

### Pro Plan (Upgrade Required)
- ✅ Unlimited notes
- ✅ All Free features
- ✅ Priority support

## 🚀 API Endpoints

### Health Check
```bash
GET /health
# Response: { "status": "ok" }
```

### Authentication

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@acme.test",
  "password": "password"
}
```

#### Signup (Create New User)
```bash
POST /auth/signup
Content-Type: application/json

{
  "email": "newuser@acme.test",
  "password": "password",
  "role": "Member",
  "tenantSlug": "acme",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Notes API (Multi-Tenant Isolated)

#### Create Note (Subscription Limit Enforced)
```bash
POST /notes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my note",
  "tags": ["important", "work"],
  "priority": "high"
}
```

#### List All Notes (Tenant Isolated)
```bash
GET /notes
Authorization: Bearer YOUR_JWT_TOKEN

# Query parameters (optional):
# ?page=1&limit=10&search=keyword&priority=high&archived=false
```

#### Get Specific Note
```bash
GET /notes/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Note
```bash
PUT /notes/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "priority": "medium",
  "isArchived": false
}
```

#### Delete Note
```bash
DELETE /notes/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Tenant Management

#### Get Tenant Information
```bash
GET /tenants/:slug
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Upgrade Subscription (Admin Only)
```bash
POST /tenants/:slug/upgrade
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

#### Get Tenant Users (Admin Only)
```bash
GET /tenants/:slug/users
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

## 🧪 Testing Scenarios

### 1. Test Free Plan Note Limit

```bash
# Login as user@acme.test
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@acme.test", "password": "password"}'

# Create 3 notes (should succeed)
curl -X POST http://localhost:8000/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Note 1", "content": "Content 1"}'

curl -X POST http://localhost:8000/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Note 2", "content": "Content 2"}'

curl -X POST http://localhost:8000/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Note 3", "content": "Content 3"}'

# Try to create 4th note (should fail with limit message)
curl -X POST http://localhost:8000/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Note 4", "content": "Content 4"}'
```

### 2. Test Subscription Upgrade

```bash
# Login as admin@acme.test
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@acme.test", "password": "password"}'

# Upgrade to Pro plan
curl -X POST http://localhost:8000/tenants/acme/upgrade \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Now create unlimited notes (should succeed)
```

### 3. Test Tenant Isolation

```bash
# Login as user@acme.test and create a note
# Login as user@globex.test and list notes
# Should only see Globex notes, not Acme notes
```

### 4. Test Role-Based Access

```bash
# Try to upgrade subscription as Member (should fail)
curl -X POST http://localhost:8000/tenants/acme/upgrade \
  -H "Authorization: Bearer MEMBER_TOKEN"
# Expected: 403 Forbidden

# Try to get tenant users as Member (should fail)
curl -X GET http://localhost:8000/tenants/acme/users \
  -H "Authorization: Bearer MEMBER_TOKEN"
# Expected: 403 Forbidden
```

## 🛡️ Security Features

- ✅ JWT-based authentication with expiration
- ✅ Role-based authorization (Admin/Member)
- ✅ Complete tenant data isolation
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ CORS configuration for cross-origin requests

## 🚢 Deployment Features

- ✅ Vercel-ready configuration
- ✅ Health endpoint for monitoring
- ✅ Environment variable management
- ✅ MongoDB Atlas integration
- ✅ CORS enabled for dashboards and scripts

## 📊 Subscription Feature Gating

The system enforces subscription limits at the API level:

1. **Free Plan**: 3 notes maximum per tenant
2. **Pro Plan**: Unlimited notes
3. **Real-time limit checking**: Before each note creation
4. **Immediate upgrade effect**: Pro plan activation lifts limits instantly

## 🔄 Multi-Tenant Data Flow

1. User authenticates → JWT includes tenant information
2. Every API request → Middleware validates tenant access
3. Database queries → Automatically filtered by tenant ID
4. No cross-tenant data leakage → Complete isolation

This ensures that Acme users can never see Globex data and vice versa.
