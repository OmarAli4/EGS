# Service Bay — نظام حجز صيانة عربيات متنقلة

نظام حجز مواعيد لمركز صيانة متنقل بيخدم **٦ أكتوبر والشيخ زايد**. العميل بيختار الخدمة، عربيته، والميعاد المتاح — والنظام بيطلع له رقم حجز.

مبني بـ Django + SQLite.

---

## المميزات

- كتالوج خدمات بالأسعار والمدة الزمنية لكل خدمة
- اختيار العربية من قايمة ماركات وموديلات
- نظام مواعيد (Time Slots) مقسّم صباحاً / بعد الضهر / بالليل
- توليد رقم حجز تلقائي لكل طلب
- لوحة تحكم Django Admin لإدارة الحجوزات والخدمات والمواعيد

---

## التشغيل محلياً

```bash
# 1. نسخ المشروع
git clone https://github.com/USERNAME/service-bay.git
cd service-bay

# 2. بيئة افتراضية
python -m venv .venv
source .venv/bin/activate      # على ويندوز: .venv\Scripts\activate

# 3. تثبيت المكتبات
pip install -r requirements.txt

# 4. إعداد متغيرات البيئة
cp .env.example .env
# افتح .env وحط SECRET_KEY جديد

# 5. قاعدة البيانات
python manage.py migrate
python manage.py createsuperuser

# 6. التشغيل
python manage.py runserver
```

الموقع هيشتغل على `http://127.0.0.1:8000`
لوحة التحكم على `http://127.0.0.1:8000/admin`

---

## توليد SECRET_KEY جديد

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## المشاركة عبر رابط عام (ngrok)

```bash
python run_tunnel.py
```

بيطلع رابط عام مؤقت للمشروع الشغال على البورت 8000. لازم `runserver` يكون شغال في تيرمنال تاني، ولازم تضيف الدومين في `ALLOWED_HOSTS`.

---

## هيكل المشروع

```
service_bay/          إعدادات المشروع
booking_app/          تطبيق الحجز
  ├── models.py       Service, Booking, TimeSlot, CarMake, CarModel
  ├── views.py
  ├── urls.py
  └── templates/
manage.py
run_tunnel.py         نفق ngrok للمشاركة
requirements.txt
```

### الموديلز

| الموديل | الوظيفة |
|---|---|
| `Service` | الخدمة: العنوان، السعر، المدة، التصنيف |
| `CarMake` / `CarModel` | ماركات وموديلات العربيات |
| `TimeSlot` | المواعيد المتاحة بالتاريخ والفترة |
| `Booking` | الحجز: بيانات العميل والعربية والميعاد ورقم التذكرة |

---

## ملاحظات مهمة

- `db.sqlite3` **مش** جزء من الريبو — كل واحد بيعمل قاعدة بيانات بنفسه بـ `migrate`
- `.env` مش بيترفع أبداً. استخدم `.env.example` كمرجع
- قبل النشر على سيرفر حقيقي: `DEBUG=False` وقاعدة بيانات PostgreSQL

---

## الرخصة

MIT
