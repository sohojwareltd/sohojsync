# SohojSync - Deployment Guide

## 🚀 একটা হোস্টেই সব চলবে!

### Local Development (লোকালে ডেভেলপমেন্ট)

1. **Frontend চালান:**
```bash
cd frontend
npm run dev
```
Frontend চলবে: `http://localhost:5174`

2. **Laravel API চালান:**
```bash
php artisan serve
```
API চলবে: `http://localhost:8000`

---

### Production Deployment (সার্ভারে ডিপ্লয়)

#### ধাপ ১: Frontend Build করুন

**Local এ build করার জন্য:**
```bash
cd frontend
npm run build
```

**Production এ build করার জন্য (server URL সহ):**
```bash
cd frontend
npm run build:prod
```

এটা `public/build` ফোল্ডারে build করবে।

#### ধাপ ২: Server এ আপলোড করুন

সার্ভারে পুরো প্রজেক্ট আপলোড করুন। শুধু **একটা Laravel app** চালালেই হবে।

#### ধাপ ৩: Server Environment Setup

**সার্ভারে `.env` ফাইল আপডেট করুন:**
```env
APP_URL=https://your-domain.com
```

#### ধাপ ৪: Routes

- **Laravel Inertia App:** `https://your-domain.com/`
- **React Standalone App:** `https://your-domain.com/app`
- **API:** `https://your-domain.com/api/*`

---

## 📝 Environment Variables

### Frontend Environment Files:

**`.env.local` (Local Development):**
```
VITE_API_URL=http://localhost:8000
```

**`.env.production` (Production Server):**
```
VITE_API_URL=https://your-domain.com
```

Server এ deploy করার আগে `.env.production` এ আপনার actual domain দিন।

---

## 🎯 একনজরে:

✅ **একটা হোস্ট যথেষ্ট** - Laravel app চালালেই সব চলবে  
✅ **React app** `/app` route এ serve হবে  
✅ **API calls** automatically সঠিক URL এ যাবে  
✅ **No CORS issues** - সব same domain থেকে  

---

## 🔧 Troubleshooting

**Build ফাইল দেখা যাচ্ছে না?**
```bash
# public/build check করুন
ls public/build
```

**API call হচ্ছে না?**
```bash
# .env.production এ সঠিক URL দিয়েছেন কিনা check করুন
cat frontend/.env.production
```

**Fresh build দরকার?**
```bash
cd frontend
rm -rf ../public/build
npm run build:prod
```
