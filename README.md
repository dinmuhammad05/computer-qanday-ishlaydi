# Kompyuter qanday ishlaydi — onlayn darslik

"Kompyuter qanday ishlaydi. Tranzistordan Telegram botgacha" (2026) darsligining animatsiyali veb-nashri. Boshlovchi dasturchilar uchun.

## Tuzilishi

| Fayl | Mazmuni |
|---|---|
| `index.html` | Muqova, so'zboshi, mundarija |
| `bob/01.html` … `bob/14.html` | 14 bob, matn to'liq, har bir rasm animatsiya yoki interaktiv demo, har bob oxirida 5 savolli test |
| `bob/15.html` | Qo'shimcha bob: botni serverga joylash (VPS, SSH, systemd/PM2, Docker, Nginx, HTTPS, kuzatuv) |
| `simulyator.html` | Mini CPU simulyatori: assembler yozib, Fetch-Decode-Execute bo'yicha qadamlab bajarish |
| `lugat.html` | Atamalar lug'ati (qidiruv bilan) |
| `savollar.html` | 22 ta tekshiruv savoli, flesh-karta rejimi |
| `reja.html` | 4 haftalik o'quv rejasi, 5 qoida, har bobga topshiriq |
| `css/style.css`, `js/site.js` | Umumiy uslub (yorug'/qorong'i mavzu) va skript |
| `js/quiz.js`, `js/quiz-data.js` | Bob testlari tizimi va 75 ta savol banki |

Tashqi kutubxonalar yo'q, faqat Google Fonts. Telefonda ham ishlaydi. O'qilgan boblar va test natijalari brauzerda saqlanadi.

## GitHub Pages orqali chiqarish

1. Repozitoriyada **Settings → Pages** ga kiring.
2. **Source: Deploy from a branch**, branch sifatida shu saytni o'z ichiga olgan branchni va `/ (root)` papkasini tanlang, **Save** bosing.
3. Bir-ikki daqiqadan so'ng sayt `https://<foydalanuvchi>.github.io/computer-qanday-ishlaydi/` manzilida ochiladi.

Lokal ko'rish uchun `index.html` ni brauzerda oching yoki `python3 -m http.server` ishga tushiring.
