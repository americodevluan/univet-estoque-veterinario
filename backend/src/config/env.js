require('dotenv').config();

const configuredCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

module.exports = {
  port: process.env.PORT || 3333,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-troque-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: [...new Set([
    'http://localhost:5173',
    'https://univet-frontend.onrender.com',
    ...configuredCorsOrigins,
  ].map((o) => (/^https?:\/\//.test(o) ? o : `https://${o}`)))],
};
