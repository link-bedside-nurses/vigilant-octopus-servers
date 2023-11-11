import * as AWS from 'aws-sdk'

export default AWS.config.update({
	accessKeyId: 'YOUR_ACCESS_KEY_ID',
	secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
	region: 'us-east-1',
})
