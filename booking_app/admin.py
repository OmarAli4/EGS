from django.contrib import admin
from .models import Service, CarMake, CarModel, TimeSlot, Booking

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'duration_mins', 'is_popular')
    list_filter = ('is_popular',)
    search_fields = ('title', 'description')

class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1

@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    inlines = [CarModelInline]

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('date', 'time_label', 'period', 'is_available')
    list_filter = ('date', 'period', 'is_available')
    ordering = ('date', 'time_label')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'customer_name', 'customer_phone', 'car_make', 'car_model', 'service', 'booking_date', 'booking_time', 'total_price', 'status')
    list_filter = ('status', 'district', 'booking_date')
    search_fields = ('ticket_code', 'customer_name', 'customer_phone', 'car_make')
    readonly_fields = ('ticket_code', 'created_at')
