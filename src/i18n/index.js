import i18n from 'i18n-js';
import * as Localization from 'expo-localization';

const translations = {
  en: {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    reports: 'Reports',
    settings: 'Settings',
    scan_barcode: 'Scan Barcode',
    add_product: 'Add Product',
    expiry_date: 'Expiry Date',
    quantity: 'Quantity',
    import_excel: 'Import Excel',
    branch: 'Branch',
    users: 'Users',
    chat: 'Chat',
    login: 'Login',
    logout: 'Logout',
    expiring_soon: 'Expiring Soon',
    expired_today: 'Expired Today',
    product_name: 'Product Name',
    barcode: 'Barcode',
    save: 'Save',
    cancel: 'Cancel',
    // ... more keys
  },
  es: {
    dashboard: 'Panel Principal',
    inventory: 'Inventario',
    reports: 'Reportes',
    settings: 'Configuración',
    scan_barcode: 'Escanear Código',
    add_product: 'Agregar Producto',
    expiry_date: 'Fecha de Vencimiento',
    quantity: 'Cantidad',
    import_excel: 'Importar Excel',
    branch: 'Sucursal',
    users: 'Usuarios',
    chat: 'Chat',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    expiring_soon: 'Vence Pronto',
    expired_today: 'Vence Hoy',
    product_name: 'Nombre del Producto',
    barcode: 'Código de Barras',
    save: 'Guardar',
    cancel: 'Cancelar',
    // ... more keys
  }
};

i18n.translations = translations;
i18n.locale = Localization.locale || 'es';
i18n.fallbacks = true;

export default i18n;
