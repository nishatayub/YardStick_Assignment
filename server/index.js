const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRouter = require('./routes/userRoute');
const protectedRoutes = require('./routes/protectedRoutes');
const noteRoutes = require('./routes/noteRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

require('dotenv').config();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173',
        'https://yardstick-assignment-indol.vercel.app',
        /^https:\/\/.*\.vercel\.app$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/users", userRouter);
app.use("/api/notes", noteRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api", protectedRoutes);

app.get("/", (req, res) => {
    try {
        return res.status(200).json({
            message: "YardStick Multi-Tenant SaaS Notes API is up & running...",
            version: "1.0.0",
            endpoints: {
                health: "/health",
                auth: {
                    signup: "POST /auth/signup",
                    login: "POST /auth/login"
                },
                notes: {
                    create: "POST /notes",
                    list: "GET /notes",
                    get: "GET /notes/:id",
                    update: "PUT /notes/:id",
                    delete: "DELETE /notes/:id"
                },
                tenants: {
                    info: "GET /tenants/:slug",
                    upgrade: "POST /tenants/:slug/upgrade",
                    users: "GET /tenants/:slug/users"
                }
            }
        });
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server is listening on http://localhost:${PORT}`);
    } catch (err) {
        console.error(err.message);
    }
});