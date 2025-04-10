import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { persistor, store } from '../store';

const resources = {
  en: {
    translation: {
      'Welcome to React': 'Welcome to React and react-i18next',
      labels: 'Labels',
      foods: 'Foods',
      recipes: 'Recipes',
      warehouseEntities: 'Warehouse Entity',
      warehouseEntityManagements: 'Warehouse Entity Management',
      budgets: 'Budgets',
      budgetGroups: 'Budget Groups',
      dashboards: 'Dashboard',
      foodGroups: 'Food Groups',
      locations: 'Locations',
      warehouses: 'Warehouses',
      cookBooks: 'CookBooks',
      addFoods: 'Add Food Entity',
      editFoods: 'Edit Food Entity',
      foodManagements: 'Food Management',
      selectFoods: 'Select Food Group',
      names: 'Name',
      actions: 'Actions',
      noElementFounds: 'No Element Found',
      loadings: 'Loading...',
      recipeManagements: 'Recipe Managements',
      addRecipes: 'Add Recipe',
      updateRecipes: 'Update Recipe',
      editRecipes: 'Edit Recipes',
      selectCookBooks: 'Select CookBook',
      ingredients: 'Ingredients',
      addIngredients: 'Add Ingredient',
      selectIngredients: 'Select Ingredient',
      removes: 'Removes',
      notes: 'Note',
      updates: 'Update',
      creates: 'Create',
      addWarehouseEntities: 'Add Warehouse Entity',
      editWarehouseEntities: 'Edit Warehouse Entity',
      name: 'Name',
      foodGroupSelectLabel: 'Seleziona un cibo',
      locationSelectLabel: 'Seleziona un Luogo',
      warehouseSelectLabel: 'Seleziona una Warehouse',
      quantities: 'Quantity',
      expirationDates: 'Expiration Date',
      update: 'Update',
      create: 'Create',
      foodGroupHeader: 'Food Group',
      locationHeader: 'Location',
      warehouseHeader: 'Warehouse',
      expirationDateHeader: 'Expiration Date',
      failedToFetchData: 'Failed to fetch initial data',
      failedToSaveEntity: 'Failed to save warehouse entity',
      failedToDeleteEntity: 'Failed to delete warehouse entity',
      noKpiSelected:
        'Nessun KPI selezionato. Seleziona un gruppo per visualizzare i KPI.',
      budgetManagements: 'Budget Management',
      addBudgets: 'Add Budget',
      editBudgets: 'Edit Budget',
      amounts: 'Amount',
      groups: 'Group',
      dates: 'Date',
      beneficiaries: 'Beneficiary',
      maxBudgets: 'Max Budget',
      resetIntervals: 'Reset interval',
      resetPeriods: 'Reset Period',
      selectGroups: 'Select Group',
      noGroupAvailables: 'No Group Available',
      selects: 'Select',
      types: 'Types',
      selectTypes: 'Select Type',
      addNewItem: 'Add New Item',
      updateItem: 'Update Item',
      enterName: 'Enter name',
      cancel: 'Cancel',
      darkMode: 'Dark Mode',
      add: 'Add Element',
    },
  },
  it: {
    translation: {
      'Welcome to React': 'Benvenuto in React e react-i18next',
      labels: 'Etichette',
      foods: 'Alimenti',
      recipes: 'Ricette',
      warehouseEntities: 'Entità Magazzino',
      warehouseEntityManagements: 'Gestione Entità Magazzino',
      budgets: 'Budget',
      budgetGroups: 'Gruppi di Budget',
      dashboards: 'Dashboard',
      foodGroups: 'Gruppi Alimentari',
      locations: 'Località',
      warehouses: 'Magazzini',
      cookBooks: 'Libri di Cucina',
      addFoods: 'Aggiungi Entità Alimentare',
      editFoods: 'Modifica Entità Alimentare',
      foodManagements: 'Gestione Alimenti',
      selectFoods: 'Seleziona Gruppo Alimentare',
      names: 'Nome',
      actions: 'Azioni',
      noElementFounds: 'Nessun Elemento Trovato',
      loadings: 'Caricamento...',
      recipeManagements: 'Gestione Ricette',
      addRecipes: 'Aggiungi Ricetta',
      updateRecipes: 'Aggiorna Ricetta',
      editRecipes: 'Modifica Ricette',
      selectCookBooks: 'Seleziona Libro di Cucina',
      ingredients: 'Ingredienti',
      addIngredients: 'Aggiungi Ingrediente',
      selectIngredients: 'Seleziona Ingrediente',
      removes: 'Rimuovi',
      notes: 'Nota',
      updates: 'Aggiorna',
      creates: 'Crea',
      addWarehouseEntities: 'Aggiungi Entità Magazzino',
      editWarehouseEntities: 'Modifica Entità Magazzino',
      name: 'Nome',
      foodGroupSelectLabel: 'Seleziona un cibo',
      locationSelectLabel: 'Seleziona un Luogo',
      warehouseSelectLabel: 'Seleziona una Warehouse',
      quantities: 'Quantità',
      expirationDates: 'Data di Scadenza',
      update: 'Aggiorna',
      create: 'Crea',
      foodGroupHeader: 'Gruppo Alimentare',
      locationHeader: 'Località',
      warehouseHeader: 'Magazzino',
      expirationDateHeader: 'Data di Scadenza',
      failedToFetchData: 'Impossibile recuperare i dati iniziali',
      failedToSaveEntity: "Impossibile salvare l'entità magazzino",
      failedToDeleteEntity: "Impossibile eliminare l'entità magazzino",
      noKpiSelected:
        'Nessun KPI selezionato. Seleziona un gruppo per visualizzare i KPI.',
      budgetManagements: 'Gestione Budget',
      addBudgets: 'Aggiungi Budget',
      editBudgets: 'Modifica Budget',
      amounts: 'Importo',
      groups: 'Gruppo',
      dates: 'Data',
      beneficiaries: 'Beneficiario',
      maxBudgets: 'Budget Massimo',
      resetIntervals: 'Intervallo di Reset',
      resetPeriods: 'Periodo di Reset',
      selectGroups: 'Seleziona Gruppo',
      noGroupAvailables: 'Nessun Gruppo Disponibile',
      selects: 'Seleziona',
      types: 'Tipo',
      selectTypes: 'Seleziona Il Tipo',
      addNewItem: 'Aggiungi Un Nuovo Elemento',
      updateItem: 'Modifica Elemento',
      enterName: 'Inserisci il nome',
      cancel: 'Cancella',
      darkMode: 'Modalità scura',
      add: 'Aggiungi Elemento',
    },
  },
};

const getInitialLanguage = () => {
  const state = store.getState();
  console.log(123);
  console.log(state.language.code);
  return state.language?.code || 'en';
};

const initialized = false;

const initializeI18n = () => {
  if (initialized) return;
  const state = store.getState();
  const lang = state.language.code || 'en';

  i18n.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

persistor.subscribe(() => {
  const { bootstrapped } = persistor.getState();
  if (bootstrapped) {
    initializeI18n();
  }
});

export const changeLanguage = async (langCode: string) => {
  return i18n.changeLanguage(langCode);
};

export default i18n;
