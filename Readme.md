# ระบบขอเลื่อนกำหนดตรวจสอบอุปกรณ์

เว็บสำหรับยื่นขอเลื่อนวันตรวจอุปกรณ์ แล้วให้หัวหน้างานหรือผู้จัดการฝ่ายกดอนุมัติ

หลังบ้านใช้ NestJS + Prisma ต่อกับ PostgreSQL ส่วนหน้าบ้านใช้ React (Vite)

## ก่อนเริ่ม

ต้องลง Node.js (เวอร์ชัน 20 ขึ้นไป) กับ Docker Desktop ไว้ก่อน แล้วเปิด Docker Desktop ค้างไว้

## วิธีรัน

**1. เปิด database**

```bash
docker compose up -d
```

**2. รันหลังบ้าน**

```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

`npx prisma db push` คือสร้างตาราง `deferral_request` ที่ใช้เก็บคำขอเพิ่มเข้าไป

ถ้าขึ้น `server running on port: 8001` แปลว่าใช้ได้แล้ว

**3. รันหน้าบ้าน**

เปิด terminal ใหม่อีกอัน แล้ว

```bash
cd frontend
npm install
npm run dev
```

เข้าเว็บที่ http://localhost:8002

## ลองใช้งาน

ไม่มีหน้า login สามารถเลือก user ได้จาก dropdown มุมขวาบน เมื่อเลือกคนไหนระบบก็จะทำงานในชื่อคนนั้น

- Somchai, Nattaya เป็นคนขอ ยื่นคำขอได้อย่างเดียว อนุมัติไม่ได้
- Wichai, Pensri เป็นหัวหน้างาน อนุมัติคำขอทั่วไปได้
- Anan เป็นผู้จัดการฝ่าย อนุมัติได้ทุกคำขอ

อุปกรณ์ระดับ A ถ้าขอเลื่อนเกิน 30 วันจากกำหนดเดิม หรือเป็นการขอเลื่อนครั้งที่ 2 ขึ้นไป ต้องให้ผู้จัดการฝ่ายเป็นคนอนุมัติ (ตามนโยบายหมวด 4.2)

## รัน test

```bash
cd backend
npm run test
```

test ของนโยบายหมวด 4.2 อยู่ที่ `backend/src/utils/policy.spec.ts`

## อยากล้างข้อมูลแล้วเริ่มใหม่

ลบข้อมูลใน database ทิ้งทั้งหมด แล้วสร้างใหม่จาก `seed.sql`

```bash
docker compose down -v
docker compose up -d
cd backend
npx prisma db push
```