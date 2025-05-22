from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import json
from .models import DoughRecipe, Ingredient

class DoughRecipeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        
        self.recipe = DoughRecipe.objects.create(
            name='Test Recipe',
            user=self.user
        )
        
        Ingredient.objects.create(
            recipe=self.recipe,
            name='Flour',
            percentage=100,
            is_flour=True
        )
        
        Ingredient.objects.create(
            recipe=self.recipe,
            name='Water',
            percentage=70,
            is_flour=False
        )
        
        Ingredient.objects.create(
            recipe=self.recipe,
            name='Salt',
            percentage=2,
            is_flour=False
        )
        
        self.client = APIClient()
        self.client.force_login(self.user)
    
    def test_create_recipe(self):
        """Test creating a new recipe"""
        url = '/api/recipes/'
        data = {'name': 'New Recipe'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DoughRecipe.objects.count(), 2)
        self.assertEqual(DoughRecipe.objects.get(pk=2).name, 'New Recipe')
    
    def test_get_recipes(self):
        """Test retrieving recipes"""
        url = '/api/recipes/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = json.loads(response.content)
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]['name'], 'Test Recipe')
    
    def test_add_ingredient(self):
        """Test adding an ingredient to a recipe"""
        url = f'/api/recipes/{self.recipe.pk}/ingredients/'
        data = {
            'name': 'Yeast',
            'percentage': 1.5,
            'is_flour': False
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ingredient.objects.count(), 4)
        self.assertEqual(Ingredient.objects.get(name='Yeast').percentage, 1.5)
    
    def test_calculate_quantities(self):
        """Test calculating ingredient quantities"""
        url = f'/api/recipes/{self.recipe.pk}/calculate/'
        data = {
            'dough_unit_weight': 500,
            'units_number': 4
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response_data = json.loads(response.content)
        self.assertEqual(response_data['total_weight'], 2000)
        
        ingredients = {item['name']: item['quantity'] for item in response_data['ingredients']}
        
        self.assertAlmostEqual(ingredients['Flour'], 1162.79, places=2)
        self.assertAlmostEqual(ingredients['Water'], 813.95, places=2)
        self.assertAlmostEqual(ingredients['Salt'], 23.26, places=2)
