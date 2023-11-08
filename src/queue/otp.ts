import Queue from 'bull'

export const otp = new Queue('otp', { redis: { port: 6379, host: '127.0.0.1', password: 'foobared' } })
