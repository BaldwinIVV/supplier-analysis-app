const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Une valeur en double a été détectée';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'P2025') {
    const message = 'Enregistrement non trouvé';
    error = { message, statusCode: 404 };
  }

  if (err.code === 'P2003') {
    const message = 'Violation de contrainte de clé étrangère';
    error = { message, statusCode: 400 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Cast errors (MongoDB)
  if (err.name === 'CastError') {
    const message = 'Format d\'identifiant invalide';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Fichier inattendu';
    error = { message, statusCode: 400 };
  }

  // OpenAI API errors
  if (err.status === 429) {
    const message = 'Limite de requêtes OpenAI dépassée';
    error = { message, statusCode: 429 };
  }

  if (err.status === 401) {
    const message = 'Clé API OpenAI invalide';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
}; 