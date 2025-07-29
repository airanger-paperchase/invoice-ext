# CORS Configuration Guide

## 🔒 **CORS Options for Your Invoice Extractor**

### **Option 1: Allow All Origins (Quick Fix)**
```javascript
app.use(cors({ 
    origin: '*'  // Allows ALL origins
}));
```

**Use this when:**
- ✅ Quick testing and development
- ✅ Internal network deployment
- ✅ No security concerns

**Run with:**
```bash
cd backend
npm run start-simple
```

### **Option 2: Environment-Based CORS (Recommended)**
```javascript
const isDevelopment = process.env.NODE_ENV !== 'production';

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (isDevelopment) {
            return callback(null, true); // Allow all in development
        }
        
        // Restrict in production
        const allowedOrigins = ['https://yourdomain.com'];
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
```

**Use this when:**
- ✅ Production deployment
- ✅ Security is important
- ✅ You want flexibility

**Run with:**
```bash
cd backend
npm start
```

### **Option 3: Specific Origins Only (Most Secure)**
```javascript
const allowedOrigins = [
    'http://localhost:5173',
    'http://10.200.7.77:6500',
    'https://yourdomain.com'
];

app.use(cors({ 
    origin: allowedOrigins,
    credentials: true
}));
```

## 🚀 **Quick Solutions for Your Setup**

### **For Immediate Fix (Allow All Origins):**
1. **Rename the simple version:**
   ```bash
   cd backend
   mv app.js app-secure.js
   mv app-simple-cors.js app.js
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

### **For Production (Environment-Based):**
1. **Set environment variable:**
   ```bash
   export NODE_ENV=production
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

## 🔧 **Testing Your CORS Configuration**

### **Test with curl:**
```bash
# Test from any origin
curl -H "Origin: http://any-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://10.200.7.77:6500/api/upload
```

### **Test with browser console:**
```javascript
fetch('http://10.200.7.77:6500/api/stored-invoices')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('CORS Error:', error));
```

## ⚠️ **Security Considerations**

### **When to use `origin: '*'`:**
- ✅ Development environment
- ✅ Internal network applications
- ✅ Testing and debugging
- ✅ When security is not a concern

### **When NOT to use `origin: '*'`:**
- ❌ Production applications
- ❌ Public-facing APIs
- ❌ When handling sensitive data
- ❌ When you need to control access

## 🎯 **Recommended Approach for Your Setup**

Since you're deploying on an internal network (`10.200.7.77`), you can safely use:

```javascript
app.use(cors({ 
    origin: '*',  // Safe for internal network
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

**This will:**
- ✅ Allow connections from any IP address
- ✅ Work with your current setup
- ✅ Be easy to maintain
- ✅ Not pose security risks on internal network

## 🔄 **Switching Between Configurations**

### **To use simple CORS (allow all):**
```bash
cd backend
npm run start-simple
```

### **To use secure CORS (environment-based):**
```bash
cd backend
npm start
```

### **To use production CORS (restricted):**
```bash
cd backend
NODE_ENV=production npm start
```

## 📝 **Summary**

For your current setup with `10.200.7.77:6500`, **Option 1 (allow all origins)** is perfectly fine and will solve your connection issues immediately!