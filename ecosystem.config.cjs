module.exports = {
    apps: [
        {
            name: 'Computing Society Bot',
            script: 'dist/bot.js',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
