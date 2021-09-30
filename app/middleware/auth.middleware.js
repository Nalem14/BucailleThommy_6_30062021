const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userId = decodedToken.userId;
    req.userId = userId;
    
    next();
  } catch {
    res.status(401).json({
      error: 'Vous n\'êtes pas connecté. Merci de vous authentifier.'
    });
  }
};