const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { sequelize } = require("./models");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { redirectIfLoggedIn } = require("./middleware/auth");

const app = express();
const PORT = 3000;

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "chatapp-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
        sameSite: "lax"
    }
}));

// Routes
app.get("/", redirectIfLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", redirectIfLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

app.use("/chat", require("./routes/chat"));
app.use("/api", require("./routes/api"));

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server Startup
async function startServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("Database connected & synced");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();