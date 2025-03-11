// ✅ Middleware: Authenticate User
const jwt = require("jsonwebtoken");
const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization");
    console.log(token);
    
    if (!token) return res.status(401).json({ error: "Access denied, no token provided" });
  
    try {
      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid token" });
    }
  };
  
  module.exports =authenticateUser;