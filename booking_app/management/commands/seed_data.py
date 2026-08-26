from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from booking_app.models import Service, CarMake, CarModel, TimeSlot, Booking

class Command(BaseCommand):
    help = 'Populate database with initial Service Bay automotive services, car makes/models, and time slots'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding Service Bay database...'))

        # 1. Mobile Van Services with Categories
        services_data = [
            {
                'title': 'صيانة دورية متنقلة 10,000 كم',
                'category': 'maintenance',
                'description': 'عربة الصيانة المتنقلة تصلك لباب بيتك: شفط وتغيير زيت تخليقي كامل بأجهزة شفط ألمانية نظيفة وبدون أي تسريب، تغيير الفلتر الأصلي، وفحص 24 نقطة فنية أمام عينك.',
                'price': 1450.00,
                'duration_mins': 45,
                'icon_type': 'gauge',
                'is_popular': True,
                'included_features': 'شفط وتغيير زيت تخليقي 10k, تغيير فلتر الزيت الأصلي, فحص 24 نقطة فنية بموقعك, تنظيف فلتر الهواء والمدخل, تقرير فني رقمي لحالة المحرك'
            },
            {
                'title': 'صيانة دورية موسعة 20k / 40k بموقعك',
                'category': 'maintenance',
                'description': 'صيانة شاملة تنفذ في مكان تواجد السيارة: تغيير فلاتر الزيت والهواء والتكييف، فحص شمعات الإشتعال، فحص الفرامل والعفشة، واختبار دينامو وبطارية السيارة.',
                'price': 2850.00,
                'duration_mins': 75,
                'icon_type': 'sliders',
                'is_popular': True,
                'included_features': 'تغيير فلاتر الزيت والهواء والمقصورة, فحص شمعات الإشعال (البوجيهات), فحص سائل الفرامل والتبريد, اختبار كفاءة البطارية والدينامو'
            },
            {
                'title': 'خدمة صيانة وتغيير الفرامل المتنقلة',
                'category': 'brakes',
                'description': 'تغيير تيل الفرامل الأمامي أو الخلفي في موقعك، تنظيف وتزييت الكاليبرات، قياس سمك الطنابير واختبار استجابة الفرامل الفورية.',
                'price': 980.00,
                'duration_mins': 45,
                'icon_type': 'disc',
                'is_popular': True,
                'included_features': 'تغيير وتركيب تيل الفرامل, تنظيف وتزييت أجزاء الكاليبر, قياس سماكة أقراص الفرامل, فحص واختبار دورة زيت الفرامل'
            },
            {
                'title': 'شحن وتطهير التكييف في مكانك',
                'category': 'ac',
                'description': 'قياس ضغط دورة التبريد، شحن غاز فريون R134a أصلي، تطهير أنابيب التكييف بالموجات الأيونية للتخلص من الروائح والبكتيريا وتغيير فلتر الكابينة.',
                'price': 750.00,
                'duration_mins': 40,
                'icon_type': 'wind',
                'is_popular': False,
                'included_features': 'شحن فريون أصلي معتمد, كشف تسريب الفريون بالأجهزة, تطهير كامل لدورة الهواء, تغيير فلتر تكييف المقصورة'
            },
            {
                'title': 'فحص وبرمجة كمبيوتر متنقل (OBD Scan)',
                'category': 'scan',
                'description': 'فحص شامل لوحدات التحكم الإلكترونية للسيارة (ECU)، مسح لمبات الأعطال، واختبار الحساسات والرشاشات مع تقرير تقني مفصل يشرحه لك المهندس.',
                'price': 450.00,
                'duration_mins': 30,
                'icon_type': 'cpu',
                'is_popular': True,
                'included_features': 'مسح كود الأعطال وقراءة الحساسات, اختبار أداء المحرك والفتيس, تقرير رقمي مفصل بالنتائج, استشارة فورية من مهندس الصيانة'
            },
            {
                'title': 'فحص وتغيير البطارية الفوري (Jump Start & Replace)',
                'category': 'engine',
                'description': 'وصول فوري لاختبار كفاءة البطارية ونظام الشحن، عمل Jump Start سريع أو استبدال البطارية بأخرى جديدة أصلية مع الضمان في موقع تعطل سيارتك.',
                'price': 650.00,
                'duration_mins': 25,
                'icon_type': 'droplet',
                'is_popular': False,
                'included_features': 'اختبار جهد وقدرة البطارية بالأجهزة, فحص أداء الدينامو ومنظومة الشحن, تركيب البطارية الجديدة وضبط الإعدادات, كفالة وضمان معتمد للبطارية'
            },
        ]

        for sdata in services_data:
            service, created = Service.objects.update_or_create(
                title=sdata['title'],
                defaults=sdata
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Service ID: {service.id}'))

        # 2. Car Makes & Models (Including Luxury Marques)
        cars_data = {
            'مرسيدس Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'CLA', 'A-Class'],
            'بي إم دبليو BMW': ['الفئة الثالثة 3 Series', 'الفئة الخامسة 5 Series', 'الفئة السابعة 7 Series', 'X3', 'X5', 'X6', 'X1'],
            'بورشه Porsche': ['كايين Cayenne', 'ماكان Macan', 'باناميرا Panamera', '911 Carrera', 'تايكان Taycan'],
            'أودي Audi': ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8', 'A3'],
            'رينج روفر Range Rover': ['Range Rover Sport', 'Range Rover Vogue', 'Velar', 'Evoque', 'Defender'],
            'لكزس Lexus': ['ES 350', 'RX 350', 'NX 300', 'LX 600', 'IS 300'],
            'فولكس فاجن Volkswagen': ['باسات Passat', 'تيجوان Tiguan', 'جولف Golf GTI', 'توارق Touareg', 'تيرامونت Teramont'],
            'تويوتا Toyota': ['كورولا Corolla', 'كامري Camry', 'ياريس Yaris', 'فورتشنر Fortuner', 'لاند كروزر Land Cruiser', 'راف 4 RAV4'],
            'هيوانداي Hyundai': ['إلنترا Elantra', 'توسان Tucson', 'أكسنت Accent', 'كريتا Creta', 'سوناتة Sonata'],
            'كيا Kia': ['سبورتاج Sportage', 'سيراتو Cerato', 'سول Soul', 'سلتوس Seltos', 'سورينتو Sorento'],
            'نيسان Nissan': ['صني Sunny', 'سنترا Sentra', 'قشقاي Qashqai', 'جوك Juke', 'باترول Patrol'],
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

        # 4. Sample Bookings for Admin Operations
        if not Booking.objects.exists():
            s1 = Service.objects.first()
            s2 = Service.objects.filter(category='brakes').first() or s1
            s3 = Service.objects.filter(category='scan').first() or s1

            Booking.objects.create(
                ticket_code='SB-2026-8942',
                customer_name='م. طارق العوضي',
                customer_phone='01098765432',
                district='Zayed',
                address_notes='كمبوند سوديك ويست - فيلا 14',
                car_make='مرسيدس Mercedes-Benz',
                car_model='E-Class',
                car_year=2023,
                plate_number='أ ب ج 1928',
                service=s1,
                booking_date=today,
                booking_time='10:30 AM',
                total_price=s1.price,
                status='on_the_way'
            )
            Booking.objects.create(
                ticket_code='SB-2026-5521',
                customer_name='د. رانيا عبد العزيز',
                customer_phone='01122334455',
                district='October',
                address_notes='بالم هيلز أكتوبر - بوابة 2',
                car_make='بورشه Porsche',
                car_model='كايين Cayenne',
                car_year=2024,
                plate_number='س ع د 7777',
                service=s2,
                booking_date=today,
                booking_time='01:00 PM',
                total_price=s2.price,
                status='in_progress'
            )
            Booking.objects.create(
                ticket_code='SB-2026-3109',
                customer_name='أ. حسام الدين شريف',
                customer_phone='01234567890',
                district='New_Cairo',
                address_notes='التجمع الخامس - شارع التسعين الشمالي',
                car_make='بي إم دبليو BMW',
                car_model='الفئة الخامسة 5 Series',
                car_year=2022,
                plate_number='ق ر ط 4512',
                service=s3,
                booking_date=today,
                booking_time='04:00 PM',
                total_price=s3.price,
                status='confirmed'
            )
            Booking.objects.create(
                ticket_code='SB-2026-1180',
                customer_name='م. كريم النجار',
                customer_phone='01005544332',
                district='Maadi',
                address_notes='دجلة المعادي - ش 200',
                car_make='رينج روفر Range Rover',
                car_model='Range Rover Sport',
                car_year=2023,
                plate_number='م هـ ن 9090',
                service=s1,
                booking_date=today - timedelta(days=1),
                booking_time='11:45 AM',
                total_price=s1.price,
                status='completed'
            )
            self.stdout.write(self.style.SUCCESS('Sample operational bookings seeded successfully!'))

        self.stdout.write(self.style.SUCCESS('Database seeding complete! Service Bay is ready.'))
