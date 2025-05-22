from django.db import models
from django.contrib.auth.models import User

class DoughRecipe(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Ingredient(models.Model):
    recipe = models.ForeignKey(DoughRecipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=200)
    percentage = models.FloatField()
    is_flour = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} ({self.percentage}%)"
