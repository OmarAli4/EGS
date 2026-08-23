from django.urls import path
from . import views

app_name = 'booking'

urlpatterns = [
    path('', views.home, name='home'),
    path('api/book/', views.create_booking, name='create'),
    path('ticket/<str:code>/', views.ticket, name='ticket'),
]
