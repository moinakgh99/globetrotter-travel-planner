const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // DEV BYPASS: If there's no auth flow yet, automatically use user ID 1
  if (!authHeader) {
    req.userId = 1;
    return next();
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token || token === 'null') {
    req.userId = 1;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (ex) {
    // DEV BYPASS fallback if a fake token was sent
    req.userId = 1;
    next();
  }
};

module.exports = verifyToken;
