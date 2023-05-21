module.exports = {
    apps: [{
      name: 'PMRPService',
      script: './app/main.js', 
      instances: 1,
      autorestart: true, 
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }],
  
  };