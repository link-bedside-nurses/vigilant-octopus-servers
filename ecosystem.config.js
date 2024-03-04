// eslint-disable-next-line no-undef
module.exports = {
	apps: [
		{
			name: "linkbedsides",
			script: "npm",
			args: "start",
			watch: true,
			ignore_watch: ["dist"],
			watch_options: {
				"followSymlinks": false
			},
			instances: 1,
			exec_mode: "cluster",
			autorestart: true,
			env: {
				NODE_ENV: "development"
			},
			env_production: {
				NODE_ENV: "production"
			}
		}
	]
};
