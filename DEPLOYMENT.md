# 🚀 Deployment Guide for Bountera on Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com with GitHub)
- Google Cloud Console account (for OAuth)

## Step 1: Set Up Google OAuth

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create a new project** (or select existing)
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name it "Bountera"
   
5. **Add Authorized Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
   (You'll update the Vercel URL after deployment)

6. **Copy your credentials**:
   - Client ID
   - Client Secret
   (Keep these safe!)

## Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Bountera platform"

# Add your GitHub repository as remote
git remote add origin https://github.com/Flare3416/Bountera.git

# Push to GitHub
git push -u origin master
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in with GitHub**
3. **Click "Add New Project"**
4. **Import your Bountera repository**
5. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `next build`
   - Output Directory: (leave default)

6. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   NEXTAUTH_URL = https://your-app-name.vercel.app
   NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
   GOOGLE_CLIENT_ID = (your Google client ID)
   GOOGLE_CLIENT_SECRET = (your Google client secret)
   ```

7. **Click "Deploy"**
8. **Wait for deployment** (usually 2-3 minutes)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? bountera
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# Deploy to production
vercel --prod
```

## Step 4: Update Google OAuth

1. **Get your Vercel URL**: https://your-app-name.vercel.app
2. **Go back to Google Cloud Console**
3. **Update Authorized Redirect URIs**:
   - Add: `https://your-app-name.vercel.app/api/auth/callback/google`
4. **Save changes**

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Click "Login with Google"
3. Verify authentication works
4. Create a test bounty hunter profile
5. Create a test bounty poster profile
6. Test the complete workflow

## Generating NEXTAUTH_SECRET

### On Windows (PowerShell):
```powershell
# Install OpenSSL if not installed (via Git Bash or WSL)
# Then run:
openssl rand -base64 32
```

### Alternative (Node.js):
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Troubleshooting

### Build Fails
- Check if all dependencies are in `package.json`
- Ensure Node.js version is 18+
- Check build logs in Vercel dashboard

### OAuth Not Working
- Verify redirect URIs match exactly (including https://)
- Check environment variables are set correctly
- Ensure Google+ API is enabled

### 500 Error
- Check environment variables are set
- Verify NEXTAUTH_SECRET is set
- Check Vercel function logs

## Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Google OAuth redirect URIs with new domain

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin master
```

Vercel will automatically build and deploy! 🚀

## Important Notes

⚠️ **Security Checklist**:
- ✅ Never commit `.env.local` to GitHub
- ✅ Use strong NEXTAUTH_SECRET
- ✅ Keep Google credentials private
- ✅ Review environment variables before deploying

🎉 **Your app is now live on Vercel!**

Share your link: https://your-app-name.vercel.app
