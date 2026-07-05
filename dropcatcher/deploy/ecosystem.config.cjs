// pm2 config — alternative to systemd if you already use pm2 on the VPS:
//   pm2 start deploy/ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: 'dropcatcher',
      script: 'src/cli.js',
      args: 'run',
      cwd: __dirname + '/..',
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        // DYNADOT_API_KEY: 'set via `pm2 set` or shell env, not committed here',
      },
    },
  ],
};
