module.exports = {
  apps: [
    {
      name: "telegram-bot",
      script: "./index.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 20,
      restart_delay: 3000,
      time: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
