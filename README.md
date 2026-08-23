# Service Bay — نظام حجز صيانة سيارات متنقلة

بوابة حجز مواعيد لمركز صيانة سيارات متنقل يخدم **مدينة ٦ أكتوبر والشيخ زايد**.
العميل يختار الخدمة، يحدد سيارته والموعد، ويستلم أمر عمل برقم تذكرة.

مبني بـ **Django** مع واجهة تفاعلية (HTML / CSS / JavaScript) تدعم العربية والاتجاه من اليمين لليسار.

---

## المميزات

- كتالوج خدمات مقسّم لأقسام (صيانة دورية · فرامل · تكييف · كشف كمبيوتر · محرك وزيوت)
- اختيار السيارة من ماركات وموديلات مرتبطة ببعضها
- مواعيد مقسّمة على ثلاث فترات: صباحاً · ظهراً · مساءً
- توليد رقم أمر عمل تلقائي لكل حجز
- لوحة إدارة لمتابعة الحجوزات وتغيير حالتها
- لوحة تحكم Django Admin لإدارة الخدمات والمواعيد

---

## التشغيل محلياً

```bash
git clone https://github.com/abhamido69/project1.git
cd project1

python -m venv .venv
source .venv/bin/activate          # ويندوز: .venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py seed_data         # تعبئة الخدمات والسيارات والمواعيد
python manage.py createsuperuser

python manage.py runserver
```

- الموقع: `http://127.0.0.1:8000`
- لوحة التحكم: `http://127.0.0.1:8000/admin`

---

## مشاركة رابط عام (ngrok)

شغّل `runserver` في نافذة، وفي نافذة تانية:

```bash
python run_tunnel.py
```

يطبع رابط عام مؤقت للمشروع.

---

## هيكل المشروع

```
service_bay/              إعدادات المشروع
  settings.py
  urls.py
  wsgi.py

booking_app/              تطبيق الحجز
  models.py               Service · CarMake · CarModel · TimeSlot · Booking
  views.py                الصفحة الرئيسية + واجهات API
  urls.py
  admin.py
  templates/index.html    الواجهة
  static/css/style.css
  static/js/app.js
  management/commands/seed_data.py

manage.py
run_tunnel.py
```

### الموديلز

| الموديل | الوظيفة |
|---|---|
| `Service` | الخدمة: العنوان، القسم، السعر، المدة، المميزات المشمولة |
| `CarMake` / `CarModel` | ماركات وموديلات السيارات |
| `TimeSlot` | المواعيد بالتاريخ والفترة وحالة الإتاحة |
| `Booking` | الحجز: بيانات العميل والسيارة والموعد ورقم أمر العمل |

### واجهات API

| المسار | الوظيفة |
|---|---|
| `GET /api/services/` | قائمة الخدمات (تقبل `?category=`) |
| `GET /api/car-models/?make_id=` | موديلات ماركة معينة |
| `GET /api/slots/?date=` | مواعيد يوم معين |
| `POST /api/bookings/create/` | إنشاء حجز جديد |
| `GET /api/bookings/<ticket_code>/` | حالة حجز برقم التذكرة |
| `POST /api/login/` · `POST /api/register/` | الدخول والتسجيل |
| `GET /api/admin/bookings/` | كل الحجوزات وإجمالي الإيرادات |
| `POST /api/admin/update-status/` | تغيير حالة أمر عمل |

---

## ملاحظات

- `db.sqlite3` غير مرفوع مع المشروع — كل نسخة تبني قاعدة بياناتها بـ `migrate` ثم `seed_data`
- قبل النشر على سيرفر حقيقي:
  - `DEBUG = False` و `ALLOWED_HOSTS` بنطاقات محددة بدل `['*']`
  - نقل `SECRET_KEY` لمتغير بيئة بدل كتابته في `settings.py`
  - إضافة تحقق فعلي من الصلاحيات على مسارات `/api/admin/`
