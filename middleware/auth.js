const requireLogin = (req, res, next) => {
    if (!req.session?.user) {
        return res.redirect("/");
    }
    next();
};

const requireLoginAPI = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
};

const redirectIfLoggedIn = (req, res, next) => {
    if (req.session?.user) {
        return res.redirect("/chat");
    }
    next();
};

module.exports = {
    requireLogin,
    requireLoginAPI,
    redirectIfLoggedIn
};