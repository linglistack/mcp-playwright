# 🚀 Deployment Guide

## Quick Deploy Options

### 🏆 Railway (Recommended)

**1. One-Click Deploy:**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-repo)

**2. Manual Deploy:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway add OPENAI_API_KEY=your_key_here
```

**Environment Variables:**
- `OPENAI_API_KEY` (required)
- `PORT` (default: 3001)
- `NODE_ENV=production`

---

### 🥈 Render

**1. Connect Repository:**
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Choose "Docker" as runtime

**2. Configuration:**
```yaml
# In Render dashboard
Service Name: mcp-playwright-app
Environment: Docker
Build Command: (leave empty - uses Dockerfile)
Start Command: (leave empty - uses Dockerfile CMD)

Environment Variables:
OPENAI_API_KEY=your_key_here
PORT=3001
NODE_ENV=production
```

---

### 🥉 DigitalOcean App Platform

**1. App Spec (app.yaml):**
```yaml
name: mcp-playwright-app
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: ./start-services.sh
  environment_slug: docker
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: OPENAI_API_KEY
    value: your_key_here
  - key: PORT
    value: "3001"
  - key: NODE_ENV
    value: production
  http_port: 3001
```

---

## 🛠️ Environment Variables Required

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes | - |
| `PORT` | Server port | ❌ No | 3001 |
| `NODE_ENV` | Environment | ❌ No | development |

---

## 🧪 Testing Your Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-app.railway.app/api/status

# Expected response:
{
  "mcpConnected": true,
  "openaiConfigured": true,
  "environment": "production"
}
```

---

## 🐳 Docker Deployment

### Local Docker Test:
```bash
# Build image
docker build -t mcp-playwright .

# Run container
docker run -p 3001:3001 \
  -e OPENAI_API_KEY=your_key_here \
  -e NODE_ENV=production \
  mcp-playwright
```

### Docker Compose:
```yaml
version: '3.8'
services:
  mcp-app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=your_key_here
      - NODE_ENV=production
    restart: unless-stopped
```

---

## 📊 Resource Requirements

### Minimum Requirements:
- **CPU:** 1 vCPU
- **RAM:** 1GB
- **Storage:** 2GB
- **Bandwidth:** 1GB/month

### Recommended for Production:
- **CPU:** 2 vCPU
- **RAM:** 2GB
- **Storage:** 5GB
- **Bandwidth:** 10GB/month

---

## 🔧 Troubleshooting

### Common Issues:

1. **"Playwright browser not found"**
   ```bash
   # In your Dockerfile, ensure:
   RUN npx playwright install --with-deps chromium
   ```

2. **"Port already in use"**
   - Check if PORT environment variable is set correctly
   - Ensure no port conflicts in your hosting platform

3. **"OpenAI API errors"**
   - Verify OPENAI_API_KEY is set correctly
   - Check API quotas and billing

4. **"Application timeout"**
   - Increase health check timeout in hosting platform
   - Browser startup can take 30-60 seconds on first run

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Starting | Best For |
|----------|-----------|---------------|----------|
| Railway | $5 credit | $5/month | Simplicity |
| Render | 750 hours/month | $7/month | Free tier |
| DigitalOcean | No | $12/month | Predictable pricing |
| Heroku | No | $25/month | Enterprise |

---

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit API keys to git
   - Use platform-specific secret management

2. **Browser Security:**
   - Runs in isolated container
   - No direct user access to browser
   - Screenshots are temporary

3. **Rate Limiting:**
   - Consider adding rate limiting for production
   - Monitor OpenAI API usage

---

## 📈 Monitoring

### Health Checks:
```bash
# Application health
GET /api/status

# Example monitoring script
#!/bin/bash
HEALTH_URL="https://your-app.com/api/status"
if curl -f $HEALTH_URL; then
    echo "✅ App is healthy"
else
    echo "❌ App is down"
fi
```

### Logs:
- Most platforms provide built-in log viewing
- Look for startup messages from both Playwright and Express servers

---

## 🚀 CI/CD Setup

### GitHub Actions (for Railway):
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Railway
      uses: railway/deploy-action@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📞 Support

If you encounter issues:

1. Check the logs in your hosting platform
2. Verify all environment variables are set
3. Test the Docker image locally first
4. Review the health check endpoint

For platform-specific issues:
- Railway: [railway.app/help](https://railway.app/help)
- Render: [render.com/docs](https://render.com/docs)
- DigitalOcean: [docs.digitalocean.com](https://docs.digitalocean.com) 