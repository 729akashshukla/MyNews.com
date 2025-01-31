import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

 const authHeader = req.headers.authorization;

 if(authHeader=== null || authHeader === undefined){
    return res.status(401).json({ status: 401, message: "Unauthorized" });
 }

 const token = authHeader.split(" ")[1];

jwt.verify(token, process.env.JWT_SECRET, (error, user) => {

    if(error) return res.status(401).json({ status: 401, message: "Unauthorized" });
    req.user = user;

    next();
    
})
};

export default authMiddleware