"""أمر لتعبئة الخدمات والماركات والمواعيد.

    python manage.py seed_data
    python manage.py seed_data --days 21
"""
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from booking_app.models import CarMake, CarModel, Service, TimeSlot

SERVICES = [
    dict(title='صيانة دورية 10.000 كم', price=1450, duration_mins=60, icon_type='gauge',
         category='maintenance', is_popular=True,
         description='الصيانة الأساسية اللي العربية بتحتاجها كل ١٠ آلاف كيلو',
         included_features='تغيير زيت المحرك\nفلتر زيت\nفلتر هواء\nفحص ٣٠ نقطة'),
    dict(title='صيانة دورية 20.000 / 40.000 كم', price=2850, duration_mins=90, icon_type='sliders',
         category='maintenance',
         description='صيانة موسّعة بتشمل الفلاتر والسوائل كلها',
         included_features='كل بنود صيانة ١٠ آلاف\nفلتر بنزين\nفلتر تكييف\nتغيير بوجيهات'),
    dict(title='خدمة منظومة الفرامل والسلامة', price=980, duration_mins=45, icon_type='disc',
         category='brakes',
         description='فحص التيل والاسطوانات وزيت الفرامل',
         included_features='قياس سُمك التيل\nفحص زيت الفرامل\nفحص الإطارات'),
    dict(title='فحص وتطهير التكييف والتبريد', price=750, duration_mins=40, icon_type='wind',
         category='ac',
         description='تنضيف مجاري الهوا وفحص الفريون',
         included_features='قياس ضغط الفريون\nتطهير المجاري\nتغيير فلتر التكييف'),
    dict(title='فحص شامل بالكمبيوتر (OBD Scan)', price=450, duration_mins=30, icon_type='cpu',
         category='scan', is_popular=True,
         description='قراءة أعطال العربية من الكمبيوتر وتقرير مكتوب',
         included_features='قراءة أكواد الأعطال\nتقرير مفصّل\nمسح الأكواد القديمة'),
    dict(title='تغيير زيت المحرك الاصطناعي 10,000 كم', price=1100, duration_mins=35,
         icon_type='droplet', category='engine',
         description='زيت اصطناعي بالكامل مع فلتر أصلي',
         included_features='زيت اصطناعي\nفلتر زيت أصلي\nفحص باقي السوائل'),
]

MAKES = {
    'تويوتا Toyota': ['كورولا', 'ياريس', 'RAV4', 'C-HR', 'لاند كروزر'],
    'هيوانداي Hyundai': ['إلنترا', 'توسان', 'أكسنت', 'كريتا', 'i10'],
    'كيا Kia': ['سيراتو', 'سبورتاج', 'بيكانتو', 'ريو', 'كرنفال'],
    'بي إم دبليو BMW': ['الفئة الثالثة', 'الفئة الخامسة', 'X1', 'X3', 'X5'],
    'مرسيدس Mercedes-Benz': ['C180', 'C200', 'E200', 'GLA', 'GLC'],
    'نيسان Nissan': ['صني', 'قشقاي', 'جوك', 'إكس تريل', 'صني كلاسيك'],
}

SLOTS = [
    ('09:00 AM', 'morning'), ('10:30 AM', 'morning'), ('11:45 AM', 'morning'),
    ('01:00 PM', 'afternoon'), ('02:30 PM', 'afternoon'), ('04:00 PM', 'afternoon'),
    ('06:00 PM', 'evening'), ('07:30 PM', 'evening'),
]


class Command(BaseCommand):
    help = 'تعبئة الخدمات والماركات والمواعيد'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=14,
                            help='عدد الأيام اللي هتتولّد مواعيد ليها')

    def handle(self, *args, **opts):
        for row in SERVICES:
            Service.objects.get_or_create(title=row['title'], defaults=row)
        self.stdout.write(self.style.SUCCESS(f'الخدمات: {Service.objects.count()}'))

        for make_name, models in MAKES.items():
            make, _ = CarMake.objects.get_or_create(name=make_name,
                                                    defaults={'icon_name': 'car'})
            for m in models:
                CarModel.objects.get_or_create(name=m, make=make)
        self.stdout.write(self.style.SUCCESS(
            f'الماركات: {CarMake.objects.count()} · الموديلات: {CarModel.objects.count()}'))

        made = 0
        today = date.today()
        for i in range(opts['days']):
            day = today + timedelta(days=i)
            for label, period in SLOTS:
                _, created = TimeSlot.objects.get_or_create(
                    date=day, time_label=label,
                    defaults={'period': period, 'is_available': True})
                made += int(created)
        self.stdout.write(self.style.SUCCESS(f'مواعيد جديدة: {made}'))
        self.stdout.write(self.style.SUCCESS('تمام — البيانات جاهزة.'))
