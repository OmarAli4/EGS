import random
import string
from django.db import models

class Service(models.Model):
    CATEGORY_CHOICES = (
        ('maintenance', 'صيانة دورية'),
        ('brakes', 'فرامل وسلامة'),
        ('ac', 'تكييف وتبريد'),
        ('scan', 'كشف كمبيوتر'),
        ('engine', 'محرك وزيوت'),
    )
    title = models.CharField("عنوان الخدمة", max_length=150)
    category = models.CharField("قسم الخدمة", max_length=50, choices=CATEGORY_CHOICES, default='maintenance')
    description = models.TextField("وصف الخدمة")
    price = models.DecimalField("السعر (ج.م)", max_digits=10, decimal_places=2)
    duration_mins = models.IntegerField("المدة بالدقائق", default=45)
    icon_type = models.CharField("أيقونة الخدمة", max_length=50, default="wrench")
    is_popular = models.BooleanField("الأكثر طلباً / الأكثر مبيعاً", default=False)
    included_features = models.TextField("المميزات المشمولة (مفصولة بفارزة)", help_text="مثال: فحص الزيوت, قياس ضغط الإطارات, تقرير فوتوغرافي")

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title} - {self.price} ج.م"

    def features_list(self):
        if not self.included_features:
            return []
        return [f.strip() for f in self.included_features.split(',') if f.strip()]

    class Meta:
        verbose_name = "خدمة"
        verbose_name_plural = "الخدمات"

class CarMake(models.Model):
    name = models.CharField("ماركة السيارة", max_length=100, unique=True)
    icon_name = models.CharField("رمز الماركة", max_length=50, blank=True, default="car")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "ماركة سيارة"
        verbose_name_plural = "ماركات السيارات"

class CarModel(models.Model):
    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models", verbose_name="الماركة")
    name = models.CharField("موديل السيارة", max_length=100)

    def __str__(self):
        return f"{self.make.name} {self.name}"

    class Meta:
        verbose_name = "موديل سيارة"
        verbose_name_plural = "موديلات السيارات"

class TimeSlot(models.Model):
    PERIOD_CHOICES = (
        ('morning', 'صباحاً (09:00 - 12:00)'),
        ('afternoon', 'ظهراً (12:00 - 04:00)'),
        ('evening', 'مساءً (04:00 - 08:00)'),
    )
    date = models.DateField("التاريخ")
    time_label = models.CharField("الوقت", max_length=50)
    period = models.CharField("الفترة", max_length=20, choices=PERIOD_CHOICES, default='morning')
    is_available = models.BooleanField("متاح", default=True)

    def __str__(self):
        return f"{self.date} - {self.time_label} ({self.get_period_display()})"

    class Meta:
        verbose_name = "موعد صيانة"
        verbose_name_plural = "مواعيد الصيانة"

def generate_ticket_code():
    chars = ''.join(random.choices(string.digits, k=4))
    return f"SB-2026-{chars}"

class Booking(models.Model):
    DISTRICT_CHOICES = (
        ('October', 'مدينة 6 أكتوبر'),
        ('Zayed', 'الشيخ زايد'),
    )
    STATUS_CHOICES = (
        ('confirmed', 'مؤكد'),
        ('in_progress', 'قيد الصيانة'),
        ('completed', 'مكتمل'),
        ('cancelled', 'ملغى'),
    )
    ticket_code = models.CharField("رقم أمر العمل", max_length=30, default=generate_ticket_code, unique=True)
    customer_name = models.CharField("اسم العميل", max_length=150)
    customer_phone = models.CharField("رقم الهاتف", max_length=20)
    district = models.CharField("المنطقة", max_length=50, choices=DISTRICT_CHOICES, default='October')
    address_notes = models.TextField("ملاحظات العنوان / الموقع", blank=True)
    
    car_make = models.CharField("ماركة السيارة", max_length=100)
    car_model = models.CharField("موديل السيارة", max_length=100)
    car_year = models.IntegerField("سنة الصنع")
    plate_number = models.CharField("رقم اللوحة", max_length=50, blank=True)
    
    service = models.ForeignKey(Service, on_delete=models.PROTECT, verbose_name="الخدمة المختارة")
    booking_date = models.DateField("تاريخ الحجز")
    booking_time = models.CharField("وقت الحجز", max_length=50)
    
    total_price = models.DecimalField("الإجمالي (ج.م)", max_digits=10, decimal_places=2)
    status = models.CharField("حالة أمر العمل", max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField("تاريخ الإنشاء", auto_now_add=True)

    def __str__(self):
        return f"{self.ticket_code} - {self.customer_name} ({self.service.title})"

    class Meta:
        verbose_name = "حجز صيانة"
        verbose_name_plural = "حجوزات الصيانة"
