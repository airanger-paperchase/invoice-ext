# 🚀 Server Deployment Checklist

## ✅ **Pre-Deployment Checklist**

### **1. Environment Configuration**

**Backend (.env):**
```env
PORT=6500
SERVER_HOST=10.200.7.77
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your_endpoint
AZURE_DOCUMENT_INTELLIGENCE_KEY=your_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_API_KEY=your_key
AZURE_OPENAI_DEPLOYMENT=your_deployment
AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-4o
API_VERSION_GA=2024-02-15-preview
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://10.200.7.77:6500
VITE_ENV=production
```

### **2. Files Updated for Server Deployment**

- ✅ `frontend/vite.config.ts` - Proxy target uses environment variable
- ✅ `frontend/src/components/api.ts` - Uses VITE_API_BASE_URL
- ✅ `backend/app.js` - Console log shows actual server IP
- ✅ `backend/app-simple-cors.js` - Console log shows actual server IP
- ✅ `backend/env.example` - Includes SERVER_HOST configuration
- ✅ `frontend/env.example` - Includes network deployment options

### **3. CORS Configuration**

**Option A: Simple CORS (Recommended for internal network)**
```bash
cd backend
npm run start-simple
```

**Option B: Environment-based CORS**
```bash
cd backend
npm start
```

### **4. Quick Deployment Commands**

**Using automated scripts:**
```bash
# Linux/Mac
./deploy-network.sh

# Windows
deploy-network.bat
```

**Manual deployment:**
```bash
# 1. Configure environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# 2. Edit backend/.env
# Set PORT=6500 and SERVER_HOST=10.200.7.77

# 3. Edit frontend/.env
# Set VITE_API_BASE_URL=http://10.200.7.77:6500

# 4. Start services
cd backend && npm start
cd frontend && npm run dev
```

## 🔍 **Verification Steps**

### **1. Check Backend Console Output**
Should show:
```
Server listening at http://10.200.7.77:6500
CORS: All origins allowed (development mode)
```

### **2. Test API Endpoints**
```bash
# Test from any machine on the network
curl http://10.200.7.77:6500/api/stored-invoices
```

### **3. Test Frontend Connection**
Open browser console and run:
```javascript
fetch('http://10.200.7.77:6500/api/stored-invoices')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

## 🚨 **Common Issues & Solutions**

### **Issue: Still getting localhost errors**
**Solution:** Check that environment files are properly configured:
```bash
# Verify backend .env
cat backend/.env | grep -E "(PORT|SERVER_HOST)"

# Verify frontend .env
cat frontend/.env | grep VITE_API_BASE_URL
```

### **Issue: CORS errors**
**Solution:** Use the simple CORS version:
```bash
cd backend
npm run start-simple
```

### **Issue: Connection refused**
**Solution:** Check firewall and port configuration:
```bash
# Check if port is open
netstat -tulpn | grep 6500

# Check firewall rules
sudo ufw status
```

## 📋 **Final Verification**

1. ✅ Backend starts without localhost references
2. ✅ Frontend connects to correct API URL
3. ✅ File uploads work from network machines
4. ✅ CORS allows connections from any origin
5. ✅ Console logs show correct server IP

## 🎯 **Access URLs**

- **Frontend:** `http://10.200.7.77:5173`
- **Backend API:** `http://10.200.7.77:6500`
- **API Endpoints:**
  - Upload: `POST http://10.200.7.77:6500/api/upload`
  - Stored Invoices: `GET http://10.200.7.77:6500/api/stored-invoices`
  - Downloads: `GET http://10.200.7.77:6500/download/:filename`

---

**Note:** All localhost references have been removed and replaced with environment-based configuration!