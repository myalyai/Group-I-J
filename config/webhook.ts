export const webhookConfig = {
  url: process.env.N8N_WEBHOOK_URL || 'https://myalyai.app.n8n.cloud/webhook/keywords',
  username: process.env.N8N_WEBHOOK_USERNAME || 'admin',
  password: process.env.N8N_WEBHOOK_PASSWORD || 'Group@IJ1'
} 