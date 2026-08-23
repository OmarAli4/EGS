"""موديلز نظام الحجز."""
import random
import string
from django.db import models


class CarMake(models.Model):
    """ماركة العربية."""
    name = models.CharField('الماركة', max_length=100)
    icon_name = models.CharField('أيقونة', max_length=50, blank=True)

    class Meta:
        verbose_name = 'ماركة'
        verbose_name_plural = 'الماركات'
        ordering = ['name']

    def __str__(self):
        return self.name


class CarModel(models.Model):
    """موديل العربية."""
    name = models.CharField('الموديل', max_length=100)
    make = models.ForeignKey(CarMake, on_delete=models.CASCADE,
                             related_name='models', verbose_name='الماركة')

    class Meta:
        verbose_name = 'موديل'
        verbose_name_plural = 'الموديلات'
        ordering = ['name']

    def __str__(self):
        return f'{self.make.name} {self.name}'


class Service(models.Model):
    """خدمة الصيانة."""
    CATEGORY_CHOICES = [
        ('maintenance', 'صيانة دورية'),
        ('engine', 'المحرك والزيوت'),
        ('brakes', 'الفرامل والسلامة'),
        ('ac', 'التكييف والتبريد'),
        ('scan', 'فحص وتشخيص'),
        ('electric', 'كهرباء وبطارية'),
        ('care', 'عناية ونظافة'),
    ]

    title = models.CharField('اسم الخدمة', max_length=150)
    description = models.TextField('الوصف', blank=True)
    price = models.DecimalField('السعر', max_digits=10, decimal_places=2)
    duration_mins = models.IntegerField('المدة بالدقايق', default=45)
    icon_type = models.CharField('نوع الأيقونة', max_length=50, default='wrench')
    is_popular = models.BooleanField('الأكثر طلباً', default=False)
    included_features = models.TextField(
        'اللي شامله', blank=True,
        help_text='افصل كل بند بسطر جديد')
    category = models.CharField('التصنيف', max_length=50,
                                choices=CATEGORY_CHOICES, default='maintenance')

    class Meta:
        verbose_name = 'خدمة'
        verbose_name_plural = 'الخدمات'
        ordering = ['-is_popular', 'id']

    def __str__(self):
        return self.title

    @property
    def features_list(self):
        return [f.strip() for f in self.included_features.splitlines() if f.strip()]


class TimeSlot(models.Model):
    """ميعاد متاح."""
    PERIOD_CHOICES = [
        ('morning', 'صباحاً'),
        ('afternoon', 'بعد الضهر'),
        ('evening', 'بالليل'),
    ]

    date = models.DateField('التاريخ')
    time_label = models.CharField('الميعاد', max_length=50)
    period = models.CharField('الفترة', max_length=20, choices=PERIOD_CHOICES)
    is_available = models.BooleanField('متاح', default=True)

    class Meta:
        verbose_name = 'ميعاد'
        verbose_name_plural = 'المواعيد'
        ordering = ['date', 'id']

    def __str__(self):
        return f'{self.date} — {self.time_label}'


class Booking(models.Model):
    """حجز العميل."""
    STATUS_CHOICES = [
        ('pending', 'في انتظار التأكيد'),
        ('confirmed', 'مؤكد'),
        ('done', 'تم'),
        ('cancelled', 'ملغي'),
    ]
    DISTRICT_CHOICES = [
        ('zayed_3', 'الشيخ زايد — الحي الثالث'),
        ('zayed_16', 'الشيخ زايد — الحي السادس عشر'),
        ('beverly', 'بيفرلي هيلز'),
        ('arkan', 'أركان'),
        ('zayed_2000', 'زايد 2000'),
        ('dreamland', 'دريم لاند'),
        ('gardenia', 'جاردينيا هايتس'),
        ('oct_1', 'أكتوبر — الحي الأول'),
        ('oct_7', 'أكتوبر — الحي السابع'),
        ('oct_12', 'أكتوبر — الحي الثاني عشر'),
        ('palm', 'بالم هيلز أكتوبر'),
        ('othman', 'مساكن عثمان'),
        ('hadayek', 'حدائق أكتوبر'),
    ]

    ticket_code = models.CharField('رقم الحجز', max_length=30, unique=True, blank=True)
    customer_name = models.CharField('اسم العميل', max_length=150)
    customer_phone = models.CharField('الموبايل', max_length=20)
    district = models.CharField('المنطقة', max_length=50, choices=DISTRICT_CHOICES)
    address_notes = models.TextField('تفاصيل العنوان')
    car_make = models.CharField('الماركة', max_length=100)
    car_model = models.CharField('الموديل', max_length=100)
    car_year = models.IntegerField('سنة الصنع', null=True, blank=True)
    plate_number = models.CharField('رقم اللوحة', max_length=50, blank=True)
    booking_date = models.DateField('تاريخ الزيارة')
    booking_time = models.CharField('ميعاد الزيارة', max_length=50)
    total_price = models.DecimalField('الإجمالي', max_digits=10, decimal_places=2)
    status = models.CharField('الحالة', max_length=20,
                              choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField('اتعمل في', auto_now_add=True)
    service = models.ForeignKey(Service, on_delete=models.PROTECT,
                                related_name='bookings', verbose_name='الخدمة')

    class Meta:
        verbose_name = 'حجز'
        verbose_name_plural = 'الحجوزات'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.ticket_code} — {self.customer_name}'

    def save(self, *args, **kwargs):
        if not self.ticket_code:
            self.ticket_code = self._new_code()
        super().save(*args, **kwargs)

    @staticmethod
    def _new_code():
        while True:
            code = 'SB-' + ''.join(random.choices(string.digits, k=5))
            if not Booking.objects.filter(ticket_code=code).exists():
                return code
