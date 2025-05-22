from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DoughRecipe, Ingredient

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'percentage', 'is_flour']
        
class DoughRecipeSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True, read_only=True)
    
    class Meta:
        model = DoughRecipe
        fields = ['id', 'name', 'user', 'created_at', 'updated_at', 'ingredients']
