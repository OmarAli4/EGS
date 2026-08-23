from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from booking_app.models import Service, CarMake, CarModel, TimeSlot

class Command(BaseCommand):
    help = 'Populate database with initial Service Bay automotive services, car makes/models, and time slots'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding Service Bay database...'))

        # 1. Services with Categories
        services_data = [
            {
                'title': 'صيانة دورية 10.000 كم',
                'category': 'maintenance',
                'description': 'فحص شمولى لمكونات المحرك، تغيير زيت المحرك الاصطناعي مع الفلتر الأصلي، فحص سوائل الفامل والتبريد وتدوير الإطارات.',
                'price': 1450.00,
                'duration_mins': 60,
                'icon_type': 'gauge',
                'is_popular': True,
                'included_features': 'تغيير زيت تخليقي كامل, تغيير فلتر الزيت الأصلي, فحص 24 نقطة فنية, تنظيف فلتر الهواء والمدخل, تقرير فحص فوتوغرافي'
            },
            {
                'title': 'صيانة دورية 20.000 / 40.000 كم',
                'category': 'maintenance',
                'description': 'صيانة موسعة تشمل تغيير جميع الفلاتر (زيت، هواء، مكيف)، فحص البوجيهات، فحص منظومة الفرامل، وتربيط العفشة كاملة.',
                'price': 2850.00,
                'duration_mins': 90,
                'icon_type': 'sliders',
                'is_popular': True,
                'included_features': 'تغيير فلاتر الزيت والهواء والتكييف, فحص شمعات الإشتعال (البوجيهات), تربيط وإعادة ضبط العفشة, فحص كفاءة البطارية والدينامو'
            },
            {
                'title': 'خدمة منظومة الفرامل والسلامة',
                'category': 'brakes',
                'description': 'خرط وتحديد تيل الفرامل، قياس سمك الأقراص (الطنابير)، تغيير زيت الفرامل الهيدروليكي ونزف الهواء من الدورة.',
                'price': 980.00,
                'duration_mins': 45,
                'icon_type': 'disc',
                'is_popular': True,
                'included_features': 'فحص تيل الفرامل الأمامي والخلفي, قياس درجة غليان زيت الفرامل, تنظيف وتزييت الكاليبرات, اختبار التوقف على الأجهزة'
            },
            {
                'title': 'فحص وتطهير التكييف والتبريد',
                'category': 'ac',
                'description': 'قياس ضغط غاز الفريون، شحن فريون أصلي R134a، تطهير أنابيب التكييف بالموجات فوق الصوتية وتغيير فلتر المقصورة.',
                'price': 750.00,
                'duration_mins': 40,
                'icon_type': 'wind',
                'is_popular': False,
                'included_features': 'قياس ضغط غاز الفريون, كشف تسريب الغاز بالكمبيوتر, تطهير دورة التكييف وضبط البرودة, تغيير فلتر كابينة السيارة'
            },
            {
                'title': 'فحص شامل بالكمبيوتر (OBD Scan)',
                'category': 'scan',
                'description': 'قراءة وتقييم الأعطال المسجلة على كمبيوتر السيارة، مسح لمبات التحذير، واختبار أداء الحساسات والرشاشات.',
                'price': 450.00,
                'duration_mins': 30,
                'icon_type': 'cpu',
                'is_popular': True,
                'included_features': 'مسح كود الأعطال وقراءة الحساسات, اختبار كفاءة محرك السيارة, تقرير رقمي مفصل بالنتائج, استشارة مهندس الصيانة'
            },
            {
                'title': 'تغيير زيت المحرك الاصطناعي 10,000 كم',
                'category': 'engine',
                'description': 'استبدال زيت المحرك الاصطناعي بالكامل مع الفلتر الأصلي وتنظيف محيط المحرك وقياس الكثافة.',
                'price': 1100.00,
                'duration_mins': 35,
                'icon_type': 'droplet',
                'is_popular': False,
                'included_features': 'زيت اصطناعي 10,000 كم معتمد, فلتر زيت أصلي بمواصفات المصنع, فحص مستوى جميع السوائل, غسيل خارجي سري للمحرك'
            },
        ]

        for sdata in services_data:
            service, created = Service.objects.update_or_create(
                title=sdata['title'],
                defaults=sdata
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Service ID: {service.id}'))

        # 2. Car Makes & Models
        cars_data = {
            'تويوتا Toyota': ['كورولا Corolla', 'كامري Camry', 'ياريس Yaris', 'فورتشنر Fortuner', 'C-HR', 'راف 4 RAV4'],
            'هيوانداي Hyundai': ['إلنترا Elantra', 'توسان Tucson', 'أكسنت Accent', 'كريتا Creta', 'سوناتة Sonata'],
            'كيا Kia': ['سبورتاج Sportage', 'سيراتو Cerato', 'سول Soul', 'سلتوس Seltos', 'كارنز Carens'],
            'بي إم دبليو BMW': ['الفئة الثالثة 3 Series', 'الفئة الخامسة 5 Series', 'X3', 'X5', 'X1'],
            'مرسيدس Mercedes-Benz': ['C-Class', 'E-Class', 'A-Class', 'GLC', 'CLA'],
            'نيسان Nissan': ['صني Sunny', 'سنترا Sentra', 'قشقاي Qashqai', 'جوك Juke'],
        }

        for make_name, models in cars_data.items():
            make_obj, _ = CarMake.objects.get_or_create(name=make_name)
            for m_name in models:
                CarModel.objects.get_or_create(make=make_obj, name=m_name)
        self.stdout.write(self.style.SUCCESS('Car Makes and Models populated successfully.'))

        # 3. Time Slots for next 7 days
        today = datetime.now().date()
        slot_times = [
            ('09:00 AM', 'morning'),
            ('10:30 AM', 'morning'),
            ('11:45 AM', 'morning'),
            ('01:00 PM', 'afternoon'),
            ('02:30 PM', 'afternoon'),
            ('04:00 PM', 'afternoon'),
            ('05:30 PM', 'evening'),
            ('07:00 PM', 'evening'),
        ]

        for day_offset in range(7):
            current_date = today + timedelta(days=day_offset)
            for time_str, period in slot_times:
                TimeSlot.objects.get_or_create(
                    date=current_date,
                    time_label=time_str,
                    defaults={'period': period, 'is_available': True}
                )

        self.stdout.write(self.style.SUCCESS('Database seeding complete! Service Bay is ready.'))
