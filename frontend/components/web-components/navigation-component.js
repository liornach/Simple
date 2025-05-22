class NavigationComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  
  async render() {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    
    const lang = localStorage.getItem('language') || 'en';
    const { LANGUAGES } = await import('../../js/utils.js');
    const translations = LANGUAGES[lang];
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: var(--primary-color, #a16207);
          color: white;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .nav-logo {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .nav-links {
          display: flex;
          gap: 1rem;
        }
        
        a {
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        a:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .nav-right {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        button {
          background: transparent;
          border: 1px solid white;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      </style>
      
      <nav dir="${translations.direction}">
        <div class="nav-logo">🍞 Dough Calculator</div>
        
        <div class="nav-links">
          ${isLoggedIn ? `
            <a href="/pages/add-dough.html">${translations.addDough}</a>
            <a href="/pages/my-doughs.html">${translations.myDoughs}</a>
          ` : ''}
        </div>
        
        <div class="nav-right">
          <button id="languageSwitch">${translations.languageSwitch}</button>
          ${isLoggedIn ? 
            `<button id="logoutBtn">${translations.logout}</button>` : 
            `<a href="/pages/login.html">${translations.login}</a>`
          }
        </div>
      </nav>
    `;
  }
  
  setupEventListeners() {
    this.shadowRoot.getElementById('languageSwitch')?.addEventListener('click', async () => {
      const { currentLanguage, setLanguage } = await import('../../js/utils.js');
      const newLang = currentLanguage === 'en' ? 'he' : 'en';
      setLanguage(newLang);
      this.render();
      
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: newLang } }));
    });
    
    this.shadowRoot.getElementById('logoutBtn')?.addEventListener('click', async () => {
      const { AUTH_URL } = await import('../../js/utils.js');
      const token = localStorage.getItem('token');
      
      try {
        await fetch(`${AUTH_URL}/token/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('token');
        window.location.href = '/pages/login.html';
      }
    });
  }
}

customElements.define('navigation-component', NavigationComponent);

export default NavigationComponent;
