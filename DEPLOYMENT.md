# StringArt Frontend — Cloud Run Deployment Guide

This guide covers building, containerizing, and deploying the **StringArt Frontend** single-page application to **Google Cloud Run**.

---

## 1. Overview
- **Framework**: React 18 + Vite
- **Production Server**: Nginx Alpine with dynamic `$PORT` support
- **Hosting Target**: Google Cloud Run (Fully Managed Container)
- **Backend Communication**: Centralized via `VITE_API_BASE_URL`

---

## 2. Environment Variables

| Variable | Required in Prod | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Fully qualified URL of deployed Cloud Run backend | `https://stringart-backend-xyz.run.app` |
| `PORT` | Auto (Cloud Run) | Port listened to by the Nginx container | `8080` (injected by Cloud Run) |

> **Note**: Frontend is a compiled client-side application. No secrets or Supabase service keys should ever be placed in the frontend!

---

## 3. Local Commands

### Build Command
Compile and bundle all production assets into the `dist/` directory:
```bash
# Production build
npm run build
```

### Preview / Start Command
Locally preview the compiled production build:
```bash
npm start
# or
npm run preview
```

---

## 4. Docker Usage

### Build the Docker Image
Provide your deployed Backend Cloud Run URL during the build:
```bash
docker build \
  --build-arg VITE_API_BASE_URL="https://stringart-backend-xyz.run.app" \
  -t stringart-frontend:latest .
```

### Run Locally with Docker
Test the container locally simulating Cloud Run's port `8080`:
```bash
docker run -p 8080:8080 -e PORT=8080 stringart-frontend:latest
```
Visit [http://localhost:8080](http://localhost:8080) to test the app.
Check health endpoint: [http://localhost:8080/health](http://localhost:8080/health)

---

## 5. Google Cloud Run Deployment

### Option A: Using Google Cloud Build & Cloud Run CLI

1. **Set Project ID & Region**:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   REGION="us-central1"
   ```

2. **Submit Build to Google Artifact Registry / Container Registry**:
   ```bash
   gcloud builds submit \
     --config - . <<EOF
   steps:
     - name: 'gcr.io/cloud-builders/docker'
       args:
         - 'build'
         - '--build-arg'
         - 'VITE_API_BASE_URL=https://YOUR-BACKEND-RUN-URL.run.app'
         - '-t'
         - 'gcr.io/YOUR_PROJECT_ID/stringart-frontend:latest'
         - '.'
   images:
     - 'gcr.io/YOUR_PROJECT_ID/stringart-frontend:latest'
   EOF
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy stringart-frontend \
     --image gcr.io/YOUR_PROJECT_ID/stringart-frontend:latest \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080
   ```

### Option B: Deploy from GitHub Actions / Cloud Run Console
1. In Google Cloud Console, navigate to **Cloud Run** &rarr; **Create Service**.
2. Select repository `StringArt-Frontend` and connect Continuous Deployment.
3. In Build settings, provide Build Argument:
   - `VITE_API_BASE_URL`: `https://YOUR-BACKEND-SERVICE-URL.run.app`
4. Set container port to `8080`.
5. Allow unauthenticated invocations (public storefront).
