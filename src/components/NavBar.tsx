import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from '@/services/axios';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

interface UserProfile {
  _id: string;
  name: string;
  surname: string;
  email: string;
  isConfimer: boolean;
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

export function NavBar() {
  const { token } = useSelector((state: any) => state.auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    flag: '../img/flag/UK.png',
  });

  // Available languages
  const languages: Language[] = [
    { code: 'en', name: 'English', flag: 'img/flag/italian.avif' },
    { code: 'it', name: 'Italiano', flag: '../img/flag/UK.png' },
  ];

  // Menu items with role-based access control
  const menuItems = [
    { href: '/Label', label: 'Labels', roleRequired: 'user' },
    { href: '/Food', label: 'Foods', roleRequired: 'user' },
    { href: '/Recipe', label: 'Recipe', roleRequired: 'user' },
    {
      href: '/werehouseEntities',
      label: 'Warehouse Entities',
      roleRequired: 'user',
    },
    { href: '/budget', label: 'Budget', roleRequired: 'user' },
    { href: '/budget-groups', label: 'Budget Group', roleRequired: 'user' },
    { href: '/Dashbord', label: 'Dashboard', roleRequired: 'user' },
  ];

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get<UserProfile>('/users/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Change language handler
  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    // Add language change logic here (e.g., i18n implementation)
    console.log(`Language changed to ${language.name}`);
  };

  // Check if the user has the necessary role for the menu item
  const hasPermission = (roleRequired: string | undefined): boolean => {
    if (!roleRequired) return true; // If no specific role required, allow access
    if (userProfile?.role === 'admin') return true; // Admin has access to everything
    if (userProfile?.role === 'user' && roleRequired === 'user') return true; // User can access user-level items
    return false; // If role does not match, deny access
  };

  return (
    <Menubar className="flex justify-between items-center p-2 bg-gray-100">
      {token && (
        <div className="flex items-center">
          {menuItems.map((item) => {
            // Check role-based access
            if (hasPermission(item.roleRequired)) {
              return (
                <MenubarMenu key={item.href}>
                  <MenubarTrigger>
                    <Link
                      href={item.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.label}
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
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleLanguageChange(language)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={language.flag} alt={language.name} />
                  <AvatarFallback>{language.code.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{language.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <Link href="/Profile">
          <Avatar className="w-8 h-8 cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-colors">
            <AvatarImage src={userProfile?.profileImage} alt="Profile" />
            <AvatarFallback>
              {userProfile?.name?.[0]}
              {userProfile?.surname?.[0]}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </Menubar>
  );
}
