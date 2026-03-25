/**
 * Error Handling Middleware
 * Centralized error handling utilities
 */

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

function notFoundHandler(req, res, next) {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({
            ok: false,
            code: "NOT_FOUND",
            message: `Route ${req.method} ${req.originalUrl} not found.`
        });
    }
    res.status(404).render("error", {
        statusCode: 404,
        error: "Page not found"
    });
}

function errorHandler(err, req, res, next) {
    console.error("=== ERROR ===");
    console.error("Time:", new Date().toISOString());
    console.error("Route:", req.method, req.originalUrl);
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    console.error("=============");

    const isAPIRequest =
        req.originalUrl.startsWith("/api") ||
        req.headers.accept?.includes("application/json");

    const statusCode = err.statusCode || err.status || 500;

    const errorResponse = {
        ok: false,
        code: err.code || "SERVER_ERROR",
        message:
            process.env.NODE_ENV === "production"
                ? "An unexpected error occurred. Please try again."
                : err.message || "Internal server error."
    };

    if (process.env.NODE_ENV !== "production") {
        errorResponse.stack = err.stack;
    }

    if (isAPIRequest) {
        return res.status(statusCode).json(errorResponse);
    }

    return res.status(statusCode).render("error", {
        error: errorResponse.message,
        statusCode
    });
}

module.exports = {
    asyncHandler,
    notFoundHandler,
    errorHandler
};
