'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import '../services/i18n';
import { selectLanguageCode } from '../services/store/language';
import {
  Calendar,
  ChefHat,
  Package,
  PieChart,
  ListCheck,
  ShoppingCart,
} from 'lucide-react';
import ShoppingListApi from '@/services/axios/ShoppingList';
import Link from 'next/link';
import warehouseApi from '@/services/axios/Warehouse';

function Home() {
  const { t, i18n } = useTranslation();
  const languageCode = useSelector(selectLanguageCode);
  const [itemToExpire, setItemToExpire] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

  useEffect(() => {
    if (languageCode && i18n.language !== languageCode) {
      i18n.changeLanguage(languageCode);
      console.log(`Home component: Language synced to ${languageCode}`);
    }
  }, [languageCode, i18n]);

  useEffect(() => {
    const getShoppingListAmount = async () => {
      const result = await ShoppingListApi.getShoppingLists('status=toBuy');
      setLowStockItems(result.length);
    };

    const getItemToExpire = async () => {
      const result = await warehouseApi.getWarehouses();
      setItemToExpire(result.length);
    };

    getItemToExpire();
    getShoppingListAmount();
  }, []);

  const features = [
    {
      title: t('Gestione Magazzino'),
      description: t(
        'Tieni traccia di tutti i tuoi alimenti e la loro posizione'
      ),
      icon: <Package className="text-emerald-600 mb-2" size={32} />,
      color: 'bg-emerald-100',
    },
    {
      title: t('Ricette Disponibili'),
      description: t(
        'Scopri quali ricette puoi preparare con ciò che hai in casa'
      ),
      icon: <ChefHat className="text-amber-600 mb-2" size={32} />,
      color: 'bg-amber-100',
    },
    {
      title: t('Scadenze'),
      description: t('Monitora quando scadono i tuoi prodotti'),
      icon: <Calendar className="text-red-600 mb-2" size={32} />,
      color: 'bg-red-100',
    },
    {
      title: t('Budget'),
      description: t('Gestisci spese e risparmi legati alla spesa alimentare'),
      icon: <PieChart className="text-blue-600 mb-2" size={32} />,
      color: 'bg-blue-100',
    },
  ];

  return (
    <div className="max-w-8xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('Benvenuto nella Tua Dispensa Digitale')}
        </h1>
        <p className="text-lg opacity-90">
          {t(
            'Gestisci il tuo cibo, risparmia e pianifica i pasti in un unico posto'
          )}
        </p>
        <p className="mt-4 text-sm">
          {t('Lingua corrente')}: {i18n.language}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex items-start">
          <div className="mr-4 bg-red-100 p-3 rounded-full">
            <ListCheck className="text-red-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t('Da controllare')}
            </h2>
            <p className="text-gray-600">
              {t('Hai 5 prodotti in scadenza questa settimana')}
            </p>
            <button className="mt-3 text-red-600 font-medium">
              {t('Controlla ora')} →
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex items-start">
          <div className="mr-4 bg-amber-100 p-3 rounded-full">
            <ShoppingCart className="text-amber-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t('Lista della spesa')}
            </h2>
            <p className="text-gray-600">
              {lowStockItems > 0
                ? `Hai ${lowStockItems} prodotti da acquistare`
                : t('La tua lista della spesa è vuota')}
            </p>
            <Link
              href="/ShoppingList"
              className="mt-3 text-amber-600 font-medium inline-block"
            >
              {t('Vedi lista')} →
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <h2 className="text-2xl font-bold mb-6">
        {t('Gestisci tutto in un unico posto')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {features.map((feature, index) => (
          <div key={index} className={`${feature.color} p-6 rounded-lg`}>
            {feature.icon}
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h2 className="text-2xl font-bold mb-4">{t('Attività recenti')}</h2>
        <div className="space-y-4">
          <div className="flex items-center pb-3 border-b border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
            <p className="text-gray-700">
              {t('Hai aggiunto 3 nuovi prodotti ieri')}
            </p>
            <span className="ml-auto text-sm text-gray-500">1g fa</span>
          </div>
          <div className="flex items-center pb-3 border-b border-gray-100">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
            <p className="text-gray-700">{t('Il latte scade domani')}</p>
            <span className="ml-auto text-sm text-gray-500">2g fa</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
            <p className="text-gray-700">
              {t('Hai risparmiato €15 questo mese')}
            </p>
            <span className="ml-auto text-sm text-gray-500">3g fa</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Home;
