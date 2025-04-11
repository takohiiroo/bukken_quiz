from django.urls import path
from . import views

urlpatterns = [
    path('api/get_bukken/', views.get_bukken, name='get_bukken'),
]

