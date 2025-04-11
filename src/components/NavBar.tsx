import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import axios from '@/services/axios';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languageSave } from '@/services/store/language';
import { changeLanguage } from '@/services/i18n';
import { ShoppingBasket, LogOut } from 'lucide-react';
import ShoppingListApi from '@/services/axios/ShoppingList';

interface UserProfile {
  _id: string;
  name: string;
  surname: string;
  email: string;
  isConfirm: boolean;
  password: string;
  phoneNumber: number;
  dateCreation: Date;
  lastLogin: Date;
  role: string;
  profileImage?: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

// Available languages
const languages: Language[] = [
  { code: 'en', name: 'English', flag: 'img/flag/UK.png' },
  { code: 'it', name: 'Italiano', flag: 'img/flag/italian.avif' },
];

function getLanguageByCode(code: string): Language {
  return (
    languages.find((lang) => lang.code === code) || {
      code: 'en',
      name: 'English',
      flag: 'img/flag/UK.png',
    }
  );
}

export function NavBar() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { token } = useSelector((state: any) => state.auth);
  const language = useSelector((state: any) => state.language);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    getLanguageByCode(language?.code || 'en')
  );
  const [shoppingItemsCount, setShoppingItemsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Menu items with role-based access control
  const menuItems = [
    { href: '/Label', label: 'labels', roleRequired: 'user' },
    { href: '/Food', label: 'foods', roleRequired: 'user' },
    { href: '/Recipe', label: 'recipes', roleRequired: 'user' },
    {
      href: '/warehouseEntities',
      label: 'warehouseEntities',
      roleRequired: 'user',
    },
    { href: '/budget', label: 'budgets', roleRequired: 'user' },
    { href: '/budget-groups', label: 'budgetGroups', roleRequired: 'user' },
    { href: '/Dashbord', label: 'Dashboards', roleRequired: 'user' },
  ];

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      if (token) {
        await Promise.all([fetchUserProfile(), fetchShoppingItemsCount()]);
      }
      setLoading(false);
    };

    initializeApp();
  }, [token]);

  // Effect to sync i18n with persisted language from Redux
  useEffect(() => {
    if (language?.code) {
      // Set language when Redux state is loaded/rehydrated
      i18n.changeLanguage(language.code);
      setCurrentLanguage(getLanguageByCode(language.code));
    }
  }, [language, i18n]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get<UserProfile>('/users/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchShoppingItemsCount = async () => {
    try {
      // Assuming there's an endpoint that returns the shopping list items count
      const response = await ShoppingListApi.getShoppingLists();
      setShoppingItemsCount(Array.isArray(response) ? response.length : 0);
    } catch (error) {
      console.error('Failed to fetch shopping items count:', error);
      setShoppingItemsCount(0);
    }
  };

  // Change language handler
  const handleLanguageChange = async (selectedLanguage: Language) => {
    await changeLanguage(selectedLanguage.code);
    dispatch(languageSave(selectedLanguage));
    setCurrentLanguage(selectedLanguage);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      // Redirect to login page or clear auth state
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Check if the user has the necessary role for the menu item
  const hasPermission = (roleRequired: string | undefined): boolean => {
    if (!roleRequired) return true; // If no specific role required, allow access
    if (userProfile?.role === 'admin') return true; // Admin has access to everything
    if (userProfile?.role === 'user' && roleRequired === 'user') return true; // User can access user-level items
    return false; // If role does not match, deny access
  };

  if (loading) {
    return <div className="p-2 bg-gray-100">Loading...</div>;
  }

  return (
    <Menubar className="flex justify-between items-center p-2 bg-gray-100">
      {token && (
        <div className="flex items-center space-x-1">
          {menuItems.map((item) => {
            // Check role-based access
            if (hasPermission(item.roleRequired)) {
              return (
                <MenubarMenu key={item.href}>
                  <MenubarTrigger className="px-3 py-2">
                    <Link
                      href={item.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {t(item.label)}
                    </Link>
                  </MenubarTrigger>
                </MenubarMenu>
              );
            }
            return null; // If user doesn't have permission, return null (hide the menu item)
          })}
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* Shopping List with Badge */}
        <div className="relative">
          <Link href="/ShippingList" className="flex items-center">
            <ShoppingBasket className="h-5 w-5 text-gray-700 hover:text-blue-600 transition-colors" />
            {shoppingItemsCount > 0 && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {shoppingItemsCount}
              </Badge>
            )}
          </Link>
        </div>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center">
              <Avatar className="w-8 h-8 cursor-pointer border border-gray-300 hover:border-blue-500 transition-colors">
                <AvatarImage
                  src={currentLanguage.flag}
                  alt={currentLanguage.name}
                />
                <AvatarFallback>
                  {currentLanguage.code.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleLanguageChange(lang)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={lang.flag} alt={lang.name} />
                  <AvatarFallback>{lang.code.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="w-8 h-8 cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-colors">
              <AvatarImage src={userProfile?.profileImage} alt="Profile" />
              <AvatarFallback>
                {userProfile?.name?.[0]}
                {userProfile?.surname?.[0]}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/Profile" className="flex items-center w-full">
                {t('profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center w-full">
                {t('settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Menubar>
  );
}
