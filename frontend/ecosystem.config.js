module.exports = {
    apps: [{
        name: 'storage-bucket-frontend',
        script: 'npm',
        args: 'start',
        cwd: './',

        // Environment variables
        env: {
            NODE_ENV: 'development',
            PORT: 3200
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3200
        },

        // Logging
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_file: './logs/pm2-combined.log',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

        // Advanced features
        watch: false,
        ignore_watch: ['node_modules', '.next', 'logs'],

        // Restart behavior
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        max_memory_restart: '1G',

        // Graceful shutdown
        kill_timeout: 5000,
        wait_ready: false,
        listen_timeout: 10000,

        // Error handling
        exp_backoff_restart_delay: 100
    }]
};
