const API_BASE_URL = 'http://localhost:8000/api';
const AUTH_URL = 'http://localhost:8000/auth';

const LANGUAGES = {
  en: {
    direction: 'ltr',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    submit: 'Submit',
    addDough: 'Add Dough Recipe',
    myDoughs: 'My Dough Recipes',
    recipeName: 'Recipe Name',
    ingredients: 'Ingredients',
    flours: 'Flours',
    otherIngredients: 'Other Ingredients',
    addIngredient: 'Add Ingredient',
    name: 'Name',
    percentage: 'Percentage (%)',
    flourOrIngredient: 'Flour or Ingredient?',
    flour: 'Flour',
    ingredient: 'Ingredient',
    calculate: 'Calculate',
    doughUnitWeight: 'Dough Unit Weight (g)',
    unitsNumber: 'Number of Units',
    quantity: 'Quantity (g)',
    logout: 'Logout',
    languageSwitch: 'עברית',
    addNew: 'Add New Recipe',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    totalWeight: 'Total Weight',
    calculationResults: 'Calculation Results',
    noRecipes: 'No recipes found. Add your first recipe!',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    confirmDelete: 'Are you sure you want to delete this recipe?',
    yes: 'Yes',
    no: 'No'
  },
  he: {
    direction: 'rtl',
    login: 'התחברות',
    register: 'הרשמה',
    username: 'שם משתמש',
    password: 'סיסמה',
    email: 'אימייל',
    submit: 'שלח',
    addDough: 'הוסף מתכון בצק',
    myDoughs: 'מתכוני הבצק שלי',
    recipeName: 'שם המתכון',
    ingredients: 'מרכיבים',
    flours: 'קמחים',
    otherIngredients: 'מרכיבים אחרים',
    addIngredient: 'הוסף מרכיב',
    name: 'שם',
    percentage: 'אחוז (%)',
    flourOrIngredient: 'קמח או מרכיב?',
    flour: 'קמח',
    ingredient: 'מרכיב',
    calculate: 'חשב',
    doughUnitWeight: 'משקל יחידת בצק (גרם)',
    unitsNumber: 'מספר יחידות',
    quantity: 'כמות (גרם)',
    logout: 'התנתק',
    languageSwitch: 'English',
    addNew: 'הוסף מתכון חדש',
    edit: 'ערוך',
    delete: 'מחק',
    save: 'שמור',
    cancel: 'בטל',
    totalWeight: 'משקל כולל',
    calculationResults: 'תוצאות החישוב',
    noRecipes: 'לא נמצאו מתכונים. הוסף את המתכון הראשון שלך!',
    loading: 'טוען...',
    error: 'אירעה שגיאה',
    success: 'הצלחה!',
    confirmDelete: 'האם אתה בטוח שברצונך למחוק מתכון זה?',
    yes: 'כן',
    no: 'לא'
  }
};

let currentLanguage = localStorage.getItem('language') || 'en';

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGUAGES[lang].direction;
  
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (LANGUAGES[lang][key]) {
      element.textContent = LANGUAGES[lang][key];
    }
  });
  
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/pages/login.html';
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    if (response.status === 204) {
      return null; // No content
    }
    
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

async function isLoggedIn() {
  const token = localStorage.getItem('token');
  return !!token;
}

async function requireAuth() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

function calculateIngredientQuantities(ingredients, doughUnitWeight, unitsNumber) {
  const totalWeight = doughUnitWeight * unitsNumber;
  
  const totalPercentage = ingredients.reduce((sum, ingredient) => sum + ingredient.percentage, 0);
  
  return ingredients.map(ingredient => {
    const fixedPercentage = ingredient.percentage / totalPercentage;
    const quantity = fixedPercentage * totalWeight;
    
    return {
      ...ingredient,
      quantity: Math.round(quantity * 100) / 100 // Round to 2 decimal places
    };
  });
}

export {
  LANGUAGES,
  currentLanguage,
  setLanguage,
  apiRequest,
  isLoggedIn,
  requireAuth,
  calculateIngredientQuantities,
  API_BASE_URL,
  AUTH_URL
};
