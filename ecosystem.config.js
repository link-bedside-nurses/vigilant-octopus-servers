// eslint-disable-next-line no-undef
module.exports = {
	apps: [
		{
			name: 'linkbedsides',
			script: 'dist/server.js',
			watch: false,
			ignore_watch: ['dist'],
			watch_options: {
				followSymlinks: false,
			},
			instances: '1',
			exec_mode: 'cluster',
			autorestart: false,
			env: {
				NODE_ENV: 'development',
			},
		},
	],
};
