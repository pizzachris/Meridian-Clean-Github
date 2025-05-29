// Validate required environment variables
function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_SENTRY_DSN',
    'APP_ENV'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate APP_ENV value
  const validEnvs = ['development', 'staging', 'production'];
  if (!validEnvs.includes(process.env.APP_ENV || '')) {
    throw new Error(`Invalid APP_ENV value. Must be one of: ${validEnvs.join(', ')}`);
  }
}

validateEnv();
