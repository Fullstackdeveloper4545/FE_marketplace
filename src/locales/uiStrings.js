/**
 * UI copy for storefront + admin (separate from API `locale` for catalog data).
 * Keys use dot notation, e.g. t('store.cart').
 */
export const UI_LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
];

const STRINGS = {
  en: {
    store: {
      title: 'Dynamic Marketplace',
      tagline: 'Curated products · secure checkout',
      manageStore: 'Manage store',
      cart: 'Cart',
      language: 'Language',
      footer: 'Storefront · API `/api/v1`',
      staffAria: 'Store admin sign-in (API key)',
      staffTitle: 'Store admin — sign in with your API key',
    },
    home: {
      category: 'Category',
      all: 'All',
      any: 'Any',
      loading: 'Loading catalogue…',
      noProducts: 'No products yet.',
      noProductsHint:
        'Run the demo seed migration and `npm run db:push`, or use the admin API.',
      productCount: '{{count}} product',
      productCountPlural: '{{count}} products',
      missingTranslation: 'Missing {{lang}} translation',
      loadError: 'Failed to load products',
    },
    admin: {
      language: 'Language',
      tenant: 'Tenant',
      tenantAria: 'Active tenant',
      logout: 'Logout',
      logoutConfirmTitle: 'Logout confirmation',
      logoutConfirmText: 'Do you want to log out of admin?',
      logoutConfirm: 'Log out',
      logoutCancel: 'Cancel',
      nav: {
        dashboard: 'Dashboard',
        pending: 'Pending',
        orders: 'Orders',
        invoices: 'Invoices',
        schedules: 'Schedules',
        routing: 'Routing',
        products: 'Products',
        attributes: 'Attributes',
        categories: 'Categories',
        shopify: 'Shopify',
        modules: 'Modules',
        shipping: 'Shipping',
      },
      login: {
        title: 'Admin login',
        lead: 'Enter the API key used to protect admin routes.',
        keyLabel: 'ADMIN_API_KEY',
        submit: 'Sign in',
        keyRequired: 'Admin key is required.',
        keyInvalid: 'Invalid admin key or API unreachable.',
        signedInTitle: 'Signed in',
        signedInText: 'Welcome to the admin dashboard.',
      },
    },
  },
  pt: {
    store: {
      title: 'Dynamic Marketplace',
      tagline: 'Produtos selecionados · checkout seguro',
      manageStore: 'Gerir loja',
      cart: 'Carrinho',
      language: 'Idioma',
      footer: 'Loja · API `/api/v1`',
      staffAria: 'Entrar na administração (chave API)',
      staffTitle: 'Administração — inicie sessão com a chave API',
    },
    home: {
      category: 'Categoria',
      all: 'Todas',
      any: 'Qualquer',
      loading: 'A carregar catálogo…',
      noProducts: 'Ainda sem produtos.',
      noProductsHint:
        'Execute a migração de demo e `npm run db:push`, ou use a API de administração.',
      productCount: '{{count}} produto',
      productCountPlural: '{{count}} produtos',
      missingTranslation: 'Tradução em {{lang}} em falta',
      loadError: 'Falha ao carregar produtos',
    },
    admin: {
      language: 'Idioma',
      tenant: 'Tenant',
      tenantAria: 'Tenant ativo',
      logout: 'Sair',
      logoutConfirmTitle: 'Confirmar saída',
      logoutConfirmText: 'Quer sair da administração?',
      logoutConfirm: 'Sair',
      logoutCancel: 'Cancelar',
      nav: {
        dashboard: 'Painel',
        pending: 'Pendentes',
        orders: 'Encomendas',
        invoices: 'Faturas',
        schedules: 'Agendamentos',
        routing: 'Encaminhamento',
        products: 'Produtos',
        attributes: 'Atributos',
        categories: 'Categorias',
        shopify: 'Shopify',
        modules: 'Módulos',
        shipping: 'Envios',
      },
      login: {
        title: 'Entrar na administração',
        lead: 'Introduza a chave API que protege as rotas de administração.',
        keyLabel: 'ADMIN_API_KEY',
        submit: 'Entrar',
        keyRequired: 'A chave de administração é obrigatória.',
        keyInvalid: 'Chave inválida ou API indisponível.',
        signedInTitle: 'Sessão iniciada',
        signedInText: 'Bem-vindo ao painel de administração.',
      },
    },
  },
  es: {
    store: {
      title: 'Dynamic Marketplace',
      tagline: 'Productos seleccionados · pago seguro',
      manageStore: 'Gestionar tienda',
      cart: 'Carrito',
      language: 'Idioma',
      footer: 'Tienda · API `/api/v1`',
      staffAria: 'Acceso administración (clave API)',
      staffTitle: 'Administración — inicia sesión con tu clave API',
    },
    home: {
      category: 'Categoría',
      all: 'Todas',
      any: 'Cualquiera',
      loading: 'Cargando catálogo…',
      noProducts: 'Aún no hay productos.',
      noProductsHint:
        'Ejecuta la migración demo y `npm run db:push`, o usa la API de administración.',
      productCount: '{{count}} producto',
      productCountPlural: '{{count}} productos',
      missingTranslation: 'Falta traducción {{lang}}',
      loadError: 'Error al cargar productos',
    },
    admin: {
      language: 'Idioma',
      tenant: 'Inquilino',
      tenantAria: 'Inquilino activo',
      logout: 'Cerrar sesión',
      logoutConfirmTitle: 'Confirmar cierre de sesión',
      logoutConfirmText: '¿Quieres salir de la administración?',
      logoutConfirm: 'Salir',
      logoutCancel: 'Cancelar',
      nav: {
        dashboard: 'Panel',
        pending: 'Pendientes',
        orders: 'Pedidos',
        invoices: 'Facturas',
        schedules: 'Programación',
        routing: 'Enrutado',
        products: 'Productos',
        attributes: 'Atributos',
        categories: 'Categorías',
        shopify: 'Shopify',
        modules: 'Módulos',
        shipping: 'Envíos',
      },
      login: {
        title: 'Acceso administración',
        lead: 'Introduce la clave API que protege las rutas de administración.',
        keyLabel: 'ADMIN_API_KEY',
        submit: 'Entrar',
        keyRequired: 'La clave de administración es obligatoria.',
        keyInvalid: 'Clave no válida o API no disponible.',
        signedInTitle: 'Sesión iniciada',
        signedInText: 'Bienvenido al panel de administración.',
      },
    },
  },
};

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Replace {{name}} placeholders */
export function interpolate(template, vars) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : ''
  );
}

export function makeTranslator(uiLocale) {
  const primary = STRINGS[uiLocale] || STRINGS.en;
  const fallback = STRINGS.en;

  return function t(key, vars) {
    let raw = getByPath(primary, key);
    if (raw === undefined) raw = getByPath(fallback, key);
    if (raw === undefined) return key;
    return vars ? interpolate(raw, vars) : raw;
  };
}

export { STRINGS };
