// eslint-disable-next-line no-undef
module.exports = {
	apps: [
		{
			name: "linkbedsides",
			script: "dist/src/index.js",
			watch: true,
			ignore_watch: ["dist"], // you may need to adjust these paths based on your project structure
			watch_options: {
				"followSymlinks": false
			},
			instances: "max",
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
