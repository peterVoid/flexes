# 🛍️ Flexes

Flexes adalah platform e-commerce yang dirancang khusus untuk membantu satu seller menjual berbagai produk digital seperti kursus, buku, dan lainnya. Nama "Flexes" berasal dari kata "flex", karena seller bisa fleksibel menjual produk dari kategori apa pun.

## 🌐 Live Preview

🔗 https://flexes.vercel.app

---

## 🚀 Fitur Utama

### Untuk User (Customer):
- 🔍 Search & Filter produk berdasarkan kategori, harga, dan stok
- 🛒 Add to Cart dan checkout dengan Midtrans
- 📝 Dapat melihat daftar transaksi & memberikan review setelah pembelian
- 📦 Set alamat pengiriman di tombol user (via Clerk UserButton)

### Untuk Admin:
- 📊 Dashboard penjualan lengkap (revenue, new customers, products)
- 📦 CRUD produk & kategori
- 🔄 Ubah status pesanan (pending → paid → shipped → completed)
- 📆 Filter laporan berdasarkan waktu (last 7/30/90 days atau custom)

---

## 🛠️ Getting Started

1. Clone repositori:

```bash
git clone https://github.com/your-username/flexes.git
cd flexes
```

2. Install dependencies:

```bash
bun install
# atau bisa gunakan npm, yarn, pnpm
```

3. Copy file `.env.example` (jika ada) atau buat `.env` sendiri berdasarkan environment yang digunakan:

```env
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
RAJAONGKIR_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Jalankan project:

```bash
bun dev
```

---

## 👑 Admin Setup (via Clerk)

Untuk menjadikan seorang user sebagai admin:

1. Masuk ke [Clerk Dashboard](https://dashboard.clerk.com)
2. Pilih menu **Users**
3. Klik user yang ingin dijadikan admin
4. Scroll ke bawah ke bagian **Metadata** → **Public Metadata**
5. Tambahkan:

```json
{
  "role": "admin"
}
```

6. Simpan. Sekarang user tersebut memiliki akses ke halaman `/admin`.

---

## 📦 Order Status

Berikut urutan status pada setiap order:

```ts
export const ordersStatues = [
  "pending",
  "paid",
  "shipped",
  "completed",
] as const;
```

- **pending**: Order dibuat tapi belum dibayar
- **paid**: Pembayaran berhasil
- **shipped**: Barang sudah dikirim
- **completed**: Transaksi selesai

---

## 🧠 Teknologi yang Digunakan

- **Next.js App Router** + TypeScript
- **TailwindCSS** + ShadCN UI
- **Clerk Auth**
- **Drizzle ORM** + PostgreSQL
- **Midtrans** (Snap API)
- **Uploadthing** (untuk upload gambar)
- **Vercel** (deployment)
- **RAJAONGKIR API** (untuk ongkos kirim)

---

## 📂 Struktur Folder Penting

```bash
src/
├─ app/              # Routing & layout
├─ db/               # Schema drizzle ORM
├─ features/         # Komponen fitur modular
├─ lib/              # Utilities (midtrans, raja ongkir, dll)
├─ trpc/             # Server-side logic via tRPC
├─ types/            # TypeScript type sharing
```

---

## 🧪 Development Tips

- Gunakan `bun run build` untuk mengecek error sebelum deploy.
- Jangan lupa tambahkan folder `src/env` di GitHub kalau pakai custom env handler seperti `@t3-oss/env-nextjs`.
- Admin access hanya diberikan jika `role: "admin"` terdaftar di Clerk.

---

## 📜 Lisensi

MIT License