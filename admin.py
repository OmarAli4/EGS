from django.contrib import admin
from .models import Booking, CarMake, CarModel, Service, TimeSlot


class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1


@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    inlines = [CarModelInline]


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'duration_mins', 'is_popular')
    list_filter = ('category', 'is_popular')
    list_editable = ('price', 'is_popular')
    search_fields = ('title',)


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('date', 'time_label', 'period', 'is_available')
    list_filter = ('period', 'is_available', 'date')
    list_editable = ('is_available',)
    date_hierarchy = 'date'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'customer_name', 'customer_phone',
                    'service', 'booking_date', 'booking_time', 'status', 'total_price')
    list_filter = ('status', 'district', 'booking_date')
    search_fields = ('ticket_code', 'customer_name', 'customer_phone', 'plate_number')
    list_editable = ('status',)
    readonly_fields = ('ticket_code', 'created_at')
    date_hierarchy = 'booking_date'

    fieldsets = (
        ('الحجز', {'fields': ('ticket_code', 'status', 'service', 'total_price', 'created_at')}),
        ('العميل', {'fields': ('customer_name', 'customer_phone', 'district', 'address_notes')}),
        ('العربية', {'fields': ('car_make', 'car_model', 'car_year', 'plate_number')}),
        ('الميعاد', {'fields': ('booking_date', 'booking_time')}),
    )


admin.site.site_header = 'Service Bay — لوحة التحكم'
admin.site.site_title = 'Service Bay'
admin.site.index_title = 'إدارة الحجوزات'
