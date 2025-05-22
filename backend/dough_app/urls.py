from django.urls import path
from . import views

urlpatterns = [
    path('recipes/<int:recipe_id>/ingredients/', views.add_ingredient, name='add_ingredient'),
    path('recipes/<int:recipe_id>/calculate/', views.calculate_quantities, name='calculate_quantities'),
]
