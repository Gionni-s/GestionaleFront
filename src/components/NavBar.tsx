import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { axiosInstance as api } from '@/services/axios';
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
  role: string; // User role (e.g., "user" or "admin")
  profileImage?: string;
}

export function NavBar() {
  const { token } = useSelector((state: any) => state.auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Menu items with role-based access control
  const menuItems = [
    { href: '/Label', label: 'Labels' },
    // { href: '/Food', label: 'Food' },
    // { href: '/Location', label: 'Location' },
    // { href: '/CookBook', label: 'Cook Book' },
    { href: '/Recipe', label: 'Recipe' },
    // { href: '/werehouse', label: 'Warehouse' },
    { href: '/werehouseEntities', label: 'Warehouse Entities' },
    { href: '/Dashbord', label: 'Dashboard', roleRequired: 'admin' }, // Only admins should see this
  ];

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get<UserProfile>('/users/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
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

      <div className="flex items-center">
        {token ? (
          <Link href="/Profile">
            <Avatar className="w-8 h-8 cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-colors">
              <AvatarImage src={userProfile?.profileImage} alt="Profile" />
              <AvatarFallback>
                {userProfile?.name?.[0]}
                {userProfile?.surname?.[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <MenubarMenu>
            <MenubarTrigger>
              <Link
                href="/Auth"
                className="hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
            </MenubarTrigger>
          </MenubarMenu>
        )}
      </div>
    </Menubar>
  );
}
