# Notes

A complete multi-tenant SaaS application for note management with role-based access control and subscription management.

## 🏗️ Multi-Tenancy Architecture

### Approach: **Shared Schema with Tenant ID Column**

This application implements multi-tenancy using a shared database with tenant isolation through a tenant ID column. This approach was chosen for the following reasons:

1. **Cost Efficiency**: Single database reduces infrastructure costs
2. **Maintenance Simplicity**: Easier to maintain and backup
3. **Resource Optimization**: Better resource utilization across tenants
4. **Scalability**: Can handle many tenants efficiently

### Data Isolation Strategy

- **Database Level**: All models include a `tenant` field (ObjectId reference)
- **API Level**: All queries are automatically scoped by tenant ID through authentication middleware
- **User Level**: Users belong to a single tenant and cannot access other tenants' data
- **Index Optimization**: Compound indexes on `tenant + createdAt` for efficient queries

## 🚀 Features

### 1. Multi-Tenancy Support
- **Two Default Tenants**: Acme Corporation and Globex Corporation
- **Strict Data Isolation**: Zero cross-tenant data leakage
- **Tenant-Scoped Operations**: All CRUD operations respect tenant boundaries

### 2. Authentication & Authorization
- **JWT-based Authentication**: Secure token-based auth system
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Can invite users, upgrade subscriptions, and manage all notes
  - **Member**: Can create, view, edit, and delete their own notes

### 3. Subscription Management
- **Free Plan**: Limited to 3 notes per tenant
- **Pro Plan**: Unlimited notes
- **Real-time Limit Enforcement**: Creation blocked when limit reached
- **Instant Upgrade**: Limits lifted immediately after upgrade

### 4. Notes Management (CRUD)
- **Create**: Full note creation with validation
- **Read**: List all notes for current tenant with pagination
- **Update**: Edit existing notes (with ownership/role validation)
- **Delete**: Remove notes (with ownership/role validation)
- **Additional Features**: Tags, priority levels, archive functionality

## 📋 Required Test Accounts

All test accounts use the password: `password`

| Email | Role | Tenant | Plan |
|-------|------|--------|------|
| admin@acme.test | Admin | Acme | Free |
| user@acme.test | Member | Acme | Free |
| admin@globex.test | Admin | Globex | Free |
| user@globex.test | Member | Globex | Free |

## 🛠️ API Endpoints

### Health Check
- `GET /health` → `{ "status": "ok" }`

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/profile` - Get current user profile

### Notes Management
- `POST /api/notes` - Create a note (with subscription limits)
- `GET /api/notes` - List all notes for current tenant
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `GET /api/tenants/:slug` - Get tenant information
- `POST /api/tenants/:slug/upgrade` - Upgrade subscription (Admin only)
- `GET /api/tenants/:slug/users` - List tenant users (Admin only)

### User Management
- `POST /api/users/invite` - Invite new user (Admin only)

## 🔐 Security Features

### Tenant Isolation
```javascript
// All queries are automatically scoped by tenant
const notes = await Note.find({ tenant: req.user.tenant });
```

### Role-Based Access
```javascript
// Middleware automatically checks role permissions
router.post('/upgrade', authenticateToken, requireAdmin, upgradeTenant);
```

### Data Validation
- Input sanitization and validation
- JWT token verification
- Tenant access validation
- Role permission checking

## 🎯 Subscription Limits

### Free Plan (Default)
- **Maximum Notes**: 3 per tenant
- **Features**: Basic note CRUD operations
- **Users**: Unlimited members

### Pro Plan
- **Maximum Notes**: Unlimited
- **Features**: All Free plan features + advanced functionality
- **Upgrade**: Instant activation via Admin users

### Limit Enforcement
```javascript
// Automatic limit checking before note creation
if (tenant.subscriptionPlan === 'Free') {
    const currentNotesCount = await Note.countDocuments({
        tenant: req.user.tenant,
        isArchived: false
    });
    
    if (currentNotesCount >= tenant.maxNotes) {
        return res.status(403).json({
            message: 'Note limit reached. Upgrade to Pro for unlimited notes.'
        });
    }
}
```

## 📱 Frontend Features

### Responsive Design
- Modern, gradient-based UI
- Mobile-first responsive design
- Smooth animations and transitions

### User Experience
- **Landing Page**: Beautiful marketing page with features
- **Authentication**: Clean login/signup forms
- **Dashboard**: Comprehensive note management interface
- **Upgrade Modal**: Seamless subscription upgrade flow

### Subscription UX
- **Limit Warnings**: Clear indication when approaching limits
- **Upgrade Prompts**: Automatic upgrade modal when limit reached
- **Real-time Updates**: Instant UI updates after subscription changes

## 🚀 Deployment

### Backend (Vercel)
- Serverless Node.js deployment
- Environment variables configured
- CORS enabled for cross-origin access
- MongoDB Atlas connection

### Frontend (Vercel)
- Static site generation
- Vite build optimization
- Environment-based API configuration
- Automatic HTTPS and CDN

### Environment Variables
```bash
# Backend
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=8000

# Frontend
VITE_API_URL=https://your-backend-url/api
```

## 🧪 Testing

### Automated Testing Scenarios
1. **Health Endpoint**: `GET /health` returns `{ "status": "ok" }`
2. **Authentication**: All test accounts can login successfully
3. **Tenant Isolation**: Users can only see their tenant's data
4. **Role Restrictions**: Members cannot access admin-only features
5. **Subscription Limits**: Free plan blocks creation after 3 notes
6. **Upgrade Functionality**: Pro upgrade removes limits immediately
7. **CRUD Operations**: All note operations work correctly

### Manual Testing
```bash
# Test login
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@acme.test", "password": "password"}'

# Test note creation
curl -X POST http://localhost:8000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Test", "content": "Test content"}'

# Test subscription upgrade
curl -X POST http://localhost:8000/api/tenants/acme/upgrade \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: 'Admin' | 'Member',
  tenant: ObjectId (ref: 'Tenant'),
  firstName: String,
  lastName: String,
  isActive: Boolean
}
```

### Tenants Collection
```javascript
{
  name: String,
  slug: String (unique),
  subscriptionPlan: 'Free' | 'Pro',
  maxNotes: Number,
  isActive: Boolean
}
```

### Notes Collection
```javascript
{
  title: String,
  content: String,
  author: ObjectId (ref: 'User'),
  tenant: ObjectId (ref: 'Tenant'),
  tags: [String],
  priority: 'low' | 'medium' | 'high',
  isArchived: Boolean
}
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Installation
```bash
# Clone repository
git clone [repository-url]
cd yardstick-assignment

# Backend setup
cd server
npm install
cp .env.example .env
# Configure environment variables
npm run dev

# Frontend setup
cd ../client
npm install
npm run dev
```

### Seeding Test Data
```bash
cd server
node scripts/seedTestAccounts.js
```

## 📈 Performance Optimizations

### Database Indexes
- Compound indexes on tenant + timestamp fields
- Email uniqueness indexes
- Query optimization for multi-tenant scenarios

### Caching Strategy
- JWT token caching
- Tenant information caching
- Query result optimization

### Security Best Practices
- Input validation and sanitization
- SQL injection prevention (NoSQL)
- Rate limiting implementation
- HTTPS enforcement
- Secure headers configuration

## 🎉 Success Criteria

✅ **Multi-Tenancy**: Complete isolation with shared schema approach  
✅ **Authentication**: JWT-based with all test accounts working  
✅ **Authorization**: Role-based access control enforced  
✅ **Subscription Limits**: Free plan limited to 3 notes  
✅ **Upgrade System**: Admin-only upgrade functionality  
✅ **CRUD Operations**: Full notes management with tenant isolation  
✅ **Frontend**: Complete UI with upgrade flow  
✅ **Deployment**: Both frontend and backend on Vercel  
✅ **Health Endpoint**: Available and functional  
✅ **CORS**: Enabled for automated testing  

## 📞 Support

For questions or issues, please refer to the codebase documentation or contact the development team.

---
**Built with**: Node.js, Express, MongoDB, React, Vite, Tailwind CSS, JWT  
**Deployed on**: Vercel  
**Database**: MongoDB Atlas