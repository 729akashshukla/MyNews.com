import rateLimit from "express-rate-limit";


export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return
    legacyHeaders: false, // false

})