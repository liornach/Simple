
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

document.documentElement = {
  lang: 'en',
  dir: 'ltr'
};

document.querySelectorAll = jest.fn(() => []);

import { setLanguage, isLoggedIn, calculateIngredientQuantities, LANGUAGES } from '../utils.js';

describe('Language utilities', () => {
  beforeEach(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    localStorage.clear();
    jest.clearAllMocks();
    
    document.querySelectorAll.mockReturnValue([
      { getAttribute: () => 'login', textContent: 'Login' },
      { getAttribute: () => 'register', textContent: 'Register' }
    ]);
  });
  
  test('setLanguage should update HTML attributes and localStorage', () => {
    setLanguage('he');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('language', 'he');
    
    expect(document.documentElement.lang).toBe('he');
    expect(document.documentElement.dir).toBe('rtl');
    
    const elements = document.querySelectorAll('[data-i18n]');
    expect(elements[0].textContent).toBe(LANGUAGES.he.login);
    expect(elements[1].textContent).toBe(LANGUAGES.he.register);
  });
});

describe('Authentication utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('isLoggedIn should return true when token exists', async () => {
    localStorage.setItem('token', 'fake-token');
    
    const result = await isLoggedIn();
    
    expect(result).toBe(true);
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });
  
  test('isLoggedIn should return false when token does not exist', async () => {
    const result = await isLoggedIn();
    
    expect(result).toBe(false);
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });
});

describe('Calculation utilities', () => {
  test('calculateIngredientQuantities should calculate correct quantities', () => {
    const ingredients = [
      { name: 'Flour', percentage: 100, is_flour: true },
      { name: 'Water', percentage: 70, is_flour: false },
      { name: 'Salt', percentage: 2, is_flour: false }
    ];
    
    const doughUnitWeight = 500;
    const unitsNumber = 4;
    
    const result = calculateIngredientQuantities(ingredients, doughUnitWeight, unitsNumber);
    
    
    expect(result[0].quantity).toBeCloseTo(1162.79, 2);
    expect(result[1].quantity).toBeCloseTo(813.95, 2);
    expect(result[2].quantity).toBeCloseTo(23.26, 2);
  });
});
