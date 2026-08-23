"""فيوز نظام الحجز."""
import json
from datetime import date, timedelta

from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST

from .models import Booking, CarMake, Service, TimeSlot

PHONE_OK = lambda p: p.isdigit() and len(p) == 11 and p.startswith('01')


def home(request):
    """صفحة الحجز الرئيسية."""
    services = Service.objects.all()
    makes = CarMake.objects.prefetch_related('models').all()
    slots = (TimeSlot.objects
             .filter(date__gte=date.today(), date__lte=date.today() + timedelta(days=13))
             .order_by('date', 'id'))

    slot_map = {}
    for s in slots:
        slot_map.setdefault(s.date.isoformat(), []).append({
            'id': s.id, 'label': s.time_label,
            'period': s.period, 'available': s.is_available,
        })

    payload = {
        'services': [{
            'id': s.id, 'title': s.title, 'desc': s.description,
            'price': float(s.price), 'mins': s.duration_mins,
            'popular': s.is_popular, 'category': s.get_category_display(),
            'features': s.features_list, 'icon': s.icon_type,
        } for s in services],
        'makes': [{'id': m.id, 'name': m.name,
                   'models': [x.name for x in m.models.all()]} for m in makes],
        'slots': slot_map,
        'districts': [{'v': v, 'n': n} for v, n in Booking.DISTRICT_CHOICES],
    }
    return render(request, 'booking_app/home.html', {
        'data': payload,
        'service_count': services.count(),
    })


@require_POST
def create_booking(request):
    """استقبال الحجز وإنشاء تذكرة."""
    try:
        d = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'البيانات غير صالحة'}, status=400)

    name = (d.get('name') or '').strip()
    phone = (d.get('phone') or '').strip()
    notes = (d.get('notes') or '').strip()

    if len(name) < 3:
        return JsonResponse({'ok': False, 'error': 'اكتب اسمك كامل'}, status=400)
    if not PHONE_OK(phone):
        return JsonResponse({'ok': False, 'error': 'رقم الموبايل لازم يكون ١١ رقم ويبدأ بـ 01'}, status=400)
    if len(notes) < 5:
        return JsonResponse({'ok': False, 'error': 'اكتب تفاصيل العنوان'}, status=400)

    service = get_object_or_404(Service, pk=d.get('service_id'))

    try:
        with transaction.atomic():
            slot = TimeSlot.objects.select_for_update().get(pk=d.get('slot_id'))
            if not slot.is_available:
                return JsonResponse({'ok': False, 'error': 'الميعاد ده اتحجز. اختار ميعاد تاني'}, status=409)

            booking = Booking.objects.create(
                customer_name=name,
                customer_phone=phone,
                district=d.get('district', ''),
                address_notes=notes,
                car_make=d.get('car_make', ''),
                car_model=d.get('car_model', ''),
                car_year=d.get('car_year') or None,
                plate_number=(d.get('plate') or '').strip(),
                booking_date=slot.date,
                booking_time=slot.time_label,
                total_price=service.price,
                service=service,
            )
            slot.is_available = False
            slot.save(update_fields=['is_available'])
    except TimeSlot.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'الميعاد مش موجود'}, status=404)

    return JsonResponse({
        'ok': True,
        'code': booking.ticket_code,
        'date': booking.booking_date.strftime('%Y-%m-%d'),
        'time': booking.booking_time,
        'total': float(booking.total_price),
    })


def ticket(request, code):
    """صفحة تفاصيل الحجز برقم التذكرة."""
    booking = get_object_or_404(Booking, ticket_code=code)
    return render(request, 'booking_app/ticket.html', {'b': booking})
