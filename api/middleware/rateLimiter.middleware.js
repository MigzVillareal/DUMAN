import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    // 15 minutes
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        errorMessage: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const registerLimiter = rateLimit({
    // 1 hour
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        errorMessage: "Too many registration attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});