module.exports = {
    apps: [{
        name: 'storage-bucket-api',
        script: './index.js',

        // Instances
        instances: 1, // Change to 'max' for cluster mode
        exec_mode: 'fork', // Change to 'cluster' for multiple instances

        // Environment variables
        env: {
            NODE_ENV: 'development',
            PORT: 3201,
            LOG_LEVEL: 'debug'
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3201,
            LOG_LEVEL: 'info'
        },

        // Logging
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_file: './logs/pm2-combined.log',
        time: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

        // Advanced features
        watch: false, // Set to true for development auto-reload
        ignore_watch: ['node_modules', 'uploads', 'logs', '*.db'],
        watch_options: {
            followSymlinks: false
        },

        // Restart behavior
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        max_memory_restart: '500M',

        // Graceful shutdown
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000,
        shutdown_with_message: true,

        // Error handling
        exp_backoff_restart_delay: 100,

        // Source map support
        source_map_support: true,

        // Interpreter args
        node_args: '--max-old-space-size=2048'
    }],

    // Deployment configuration (optional)
    deploy: {
        production: {
            user: 'your-username',
            host: 'your-server-ip',
            ref: 'origin/main',
            repo: 'git@github.com:bornebyte/storage-bucket.git',
            path: '/var/www/storage-bucket',
            'pre-deploy': 'git fetch --all',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': 'mkdir -p /var/www/storage-bucket',
            env: {
                NODE_ENV: 'production'
            }
        }
    }
};
