from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from .models import DoughRecipe, Ingredient
from .serializers import UserSerializer, DoughRecipeSerializer, IngredientSerializer

class DoughRecipeViewSet(viewsets.ModelViewSet):
    serializer_class = DoughRecipeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return DoughRecipe.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_ingredient(request, recipe_id):
    try:
        recipe = DoughRecipe.objects.get(id=recipe_id, user=request.user)
    except DoughRecipe.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    data = request.data
    ingredient = Ingredient.objects.create(
        recipe=recipe,
        name=data['name'],
        percentage=data['percentage'],
        is_flour=data.get('is_flour', False)
    )
    serializer = IngredientSerializer(ingredient)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def calculate_quantities(request, recipe_id):
    try:
        recipe = DoughRecipe.objects.get(id=recipe_id, user=request.user)
    except DoughRecipe.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    dough_unit_weight = float(request.data.get('dough_unit_weight', 0))
    units_number = int(request.data.get('units_number', 0))
    
    if dough_unit_weight <= 0 or units_number <= 0:
        return Response({"error": "Invalid input values"}, status=status.HTTP_400_BAD_REQUEST)
        
    overall_weight = dough_unit_weight * units_number
    ingredients = recipe.ingredients.all()
    
    total_percentage = sum(ingredient.percentage for ingredient in ingredients)
    
    result = []
    for ingredient in ingredients:
        fixed_percentage = ingredient.percentage / total_percentage
        quantity = fixed_percentage * overall_weight
        result.append({
            'name': ingredient.name,
            'percentage': ingredient.percentage,
            'quantity': round(quantity, 2)
        })
        
    return Response({
        'recipe_name': recipe.name,
        'total_weight': overall_weight,
        'ingredients': result
    })
