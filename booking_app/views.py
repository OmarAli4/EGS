import json
from datetime import datetime, timedelta
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from .models import Service, CarMake, CarModel, TimeSlot, Booking

@ensure_csrf_cookie
def index(request):
    services = Service.objects.all()
    popular_services = Service.objects.filter(is_popular=True)
    car_makes = CarMake.objects.prefetch_related('models').all()
    
    today = datetime.now().date()
    dates = [today + timedelta(days=i) for i in range(7)]
    
    context = {
        'services': services,
        'popular_services': popular_services if popular_services.exists() else services[:3],
        'car_makes': car_makes,
        'upcoming_dates': dates,
    }
    return render(request, 'index.html', context)

@require_GET
def api_services(request):
    category = request.GET.get('category')
    services = Service.objects.all()
    if category and category != 'all':
        services = services.filter(category=category)

    data = []
    for s in services:
        data.append({
            'id': s.id,
            'title': s.title,
            'category': s.category,
            'category_display': s.get_category_display(),
            'description': s.description,
            'price': float(s.price),
            'duration_mins': s.duration_mins,
            'icon_type': s.icon_type,
            'is_popular': s.is_popular,
            'features': s.features_list(),
        })
    return JsonResponse({'status': 'success', 'services': data})

@require_GET
def api_car_models(request):
    make_id = request.GET.get('make_id')
    if not make_id:
        return JsonResponse({'status': 'error', 'message': 'Missing make_id'}, status=400)
    models = CarModel.objects.filter(make_id=make_id)
    data = [{'id': m.id, 'name': m.name} for m in models]
    return JsonResponse({'status': 'success', 'models': data})

@require_GET
def api_slots(request):
    date_str = request.GET.get('date')
    if not date_str:
        target_date = datetime.now().date()
    else:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            target_date = datetime.now().date()

    slots = TimeSlot.objects.filter(date=target_date)
    
    if not slots.exists():
        demo_slots = [
            {'time_label': '09:00 AM', 'period': 'morning', 'is_available': True},
            {'time_label': '10:30 AM', 'period': 'morning', 'is_available': True},
            {'time_label': '11:45 AM', 'period': 'morning', 'is_available': False},
            {'time_label': '01:00 PM', 'period': 'afternoon', 'is_available': True},
            {'time_label': '02:30 PM', 'period': 'afternoon', 'is_available': True},
            {'time_label': '04:00 PM', 'period': 'afternoon', 'is_available': True},
            {'time_label': '05:30 PM', 'period': 'evening', 'is_available': True},
            {'time_label': '07:00 PM', 'period': 'evening', 'is_available': False},
        ]
        return JsonResponse({
            'status': 'success',
            'date': target_date.strftime('%Y-%m-%d'),
            'slots': demo_slots
        })

    data = []
    for slot in slots:
        data.append({
            'id': slot.id,
            'time_label': slot.time_label,
            'period': slot.period,
            'is_available': slot.is_available,
        })
    return JsonResponse({
        'status': 'success',
        'date': target_date.strftime('%Y-%m-%d'),
        'slots': data
    })

@require_POST
def api_register(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        password = data.get('password', '').strip()

        if not name or not phone or not password:
            return JsonResponse({'status': 'error', 'message': 'يرجى إكمال جميع الحقول المطلوب لإنشاء الحساب'}, status=400)

        # Return authenticated session user payload
        return JsonResponse({
            'status': 'success',
            'message': 'تم إنشاء الحساب بنجاح',
            'role': 'user',
            'name': name,
            'phone': phone,
            'token': f'USER_TOKEN_{phone}'
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_POST
def api_login(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        role = data.get('role', 'user') # 'user' or 'admin'
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if role == 'admin':
            if username.lower() == 'admin' and password in ['admin', 'admin123', 'pass']:
                return JsonResponse({
                    'status': 'success',
                    'role': 'admin',
                    'name': 'مهندس الصيانة المسؤول',
                    'token': 'ADMIN_SECRET_SESSION_TOKEN_8942'
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'بيانات دخول الأدمن غير صحيحة. استخدم: admin / admin123'
                }, status=401)
        else:
            if not username:
                return JsonResponse({'status': 'error', 'message': 'يرجى إدخال اسم الحساب أو رقم الهاتف'}, status=400)
            phone = data.get('phone', '01000000000')
            return JsonResponse({
                'status': 'success',
                'role': 'user',
                'name': username,
                'phone': phone,
                'token': 'USER_SESSION_TOKEN'
            })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_GET
def api_admin_bookings(request):
    bookings = Booking.objects.all().order_by('-created_at')
    data = []
    total_revenue = 0
    for b in bookings:
        total_revenue += float(b.total_price)
        data.append({
            'ticket_code': b.ticket_code,
            'customer_name': b.customer_name,
            'customer_phone': b.customer_phone,
            'car_info': f"{b.car_make} {b.car_model} ({b.car_year})",
            'plate_number': b.plate_number or '---',
            'service_title': b.service.title,
            'district_display': b.get_district_display(),
            'booking_date': b.booking_date.strftime('%Y-%m-%d'),
            'booking_time': b.booking_time,
            'total_price': float(b.total_price),
            'status': b.status,
            'status_display': b.get_status_display(),
            'created_at': b.created_at.strftime('%Y-%m-%d %H:%M'),
        })

    return JsonResponse({
        'status': 'success',
        'total_revenue': total_revenue,
        'total_count': len(data),
        'bookings': data
    })

@require_POST
def api_admin_update_status(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        ticket_code = data.get('ticket_code')
        new_status = data.get('status')
        
        booking = Booking.objects.get(ticket_code=ticket_code)
        booking.status = new_status
        booking.save()
        
        return JsonResponse({
            'status': 'success',
            'message': f'تم تحديث حالة أمر العمل {ticket_code} إلى {booking.get_status_display()}'
        })
    except Booking.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'أمر العمل غير موجود'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_POST
def api_create_booking(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        
        service_id = data.get('service_id')
        service = Service.objects.get(id=service_id)
        
        booking_date_str = data.get('booking_date')
        booking_date = datetime.strptime(booking_date_str, '%Y-%m-%d').date()
        
        booking = Booking.objects.create(
            customer_name=data.get('customer_name', 'عميل مسجل'),
            customer_phone=data.get('customer_phone', ''),
            district=data.get('district', 'October'),
            address_notes=data.get('address_notes', ''),
            car_make=data.get('car_make', ''),
            car_model=data.get('car_model', ''),
            car_year=int(data.get('car_year', 2022)),
            plate_number=data.get('plate_number', ''),
            service=service,
            booking_date=booking_date,
            booking_time=data.get('booking_time', '10:00 AM'),
            total_price=service.price,
            status='confirmed'
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'تم اعتماد امر العمل بنجاح',
            'job_card': {
                'ticket_code': booking.ticket_code,
                'customer_name': booking.customer_name,
                'customer_phone': booking.customer_phone,
                'service_title': service.title,
                'duration_mins': service.duration_mins,
                'car_info': f"{booking.car_make} {booking.car_model} ({booking.car_year})",
                'district_display': booking.get_district_display(),
                'address_notes': booking.address_notes,
                'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
                'booking_time': booking.booking_time,
                'total_price': float(booking.total_price),
                'status_display': booking.get_status_display(),
                'created_at': booking.created_at.strftime('%Y-%m-%d %H:%M'),
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_GET
def api_booking_status(request, ticket_code):
    try:
        booking = Booking.objects.get(ticket_code=ticket_code)
        return JsonResponse({
            'status': 'success',
            'job_card': {
                'ticket_code': booking.ticket_code,
                'customer_name': booking.customer_name,
                'service_title': booking.service.title,
                'car_info': f"{booking.car_make} {booking.car_model} ({booking.car_year})",
                'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
                'booking_time': booking.booking_time,
                'total_price': float(booking.total_price),
                'status_display': booking.get_status_display(),
            }
        })
    except Booking.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'امر العمل غير موجود'}, status=404)
