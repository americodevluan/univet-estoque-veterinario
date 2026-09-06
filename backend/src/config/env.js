require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3333,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-troque-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: (process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173']
  ).map((o) => (/^https?:\/\//.test(o) ? o : `https://${o}`)),
};
