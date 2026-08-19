# 🚀 Deploy QLMH to Vercel + PostgreSQL

Hướng dẫn deploy app Quản lý Mua Hàng cho 10-20 người sử dụng công khai.

## **Bước 1: Tạo GitHub Repository**

1. Tạo repo mới trên [github.com](https://github.com/new)
   - Repo name: `qlmh-app` (hoặc tên khác)
   - Public (để share được)
   - Click "Create repository"

2. Push code lên GitHub:
```bash
cd C:\Users\Administrator\qlmh-app
git init
git add .
git commit -m "Initial commit: QLMH with 12 modules"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/qlmh-app.git
git push -u origin main
```

---

## **Bước 2: Tạo PostgreSQL Database (Neon.tech)**

1. Vào [neon.tech](https://neon.tech) → Sign up (miễn phí)
2. Tạo project mới:
   - Project name: `qlmh`
   - Region: Singapore (gần Việt Nam)
3. Copy **DATABASE_URL** (dạng: `postgresql://user:pass@...`)

---

## **Bước 3: Deploy lên Vercel**

1. Vào [vercel.com](https://vercel.com) → Sign up với GitHub
2. Click "New Project" → Import repo `qlmh-app`
3. Cấu hình environment:
   - **Environment Variables:**
     - `DATABASE_URL` = [Paste từ Neon.tech]
     - `SESSION_COOKIE_NAME` = `qlmh_session`
4. Click "Deploy" ✨

---

## **Bước 4: Chạy Migration & Seed Database**

Sau khi deploy, chạy migration trên database:

```bash
# Local (trước khi push hoặc sau khi clone):
npx prisma migrate deploy
npx prisma db seed
```

Hoặc dùng Vercel CLI:
```bash
vercel env pull  # Lấy .env từ Vercel
npx prisma migrate deploy
npx prisma db seed
```

---

## **Bước 5: Share Link Công Khai**

Vercel sẽ cấp URL như: `https://qlmh-app-yourname.vercel.app`

**Share link này với 10-20 người:**
```
🔗 App: https://qlmh-app-yourname.vercel.app

📝 Demo Accounts:
- Admin: admin / admin123
- Purchaser: purchaser / user123
- Approver: approver / user123
```

---

## **Troubleshooting**

### Database connection error?
- Kiểm tra `DATABASE_URL` đúng format
- Neon: whitelist Vercel IP hoặc Allow all

### Dữ liệu mất sau deploy?
- Database nằm trên Neon, dữ liệu bền vững
- Kiểm tra migration chạy đúng

### App chậm?
- Neon free tier có giới hạn
- Upgrade plan nếu cần

---

## **Cập nhật App**

Mỗi khi thay đổi code:
```bash
git add .
git commit -m "Update: [mô tả]"
git push
# Vercel tự động deploy!
```

---

**Happy shipping!** 🎉
