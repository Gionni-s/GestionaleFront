'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSidebarLinks } from './sidebar-links';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { languageSave } from '@/services/store/language';
import { useSelector, useDispatch } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { selectUser } from '@/services/store/auth';
import { appName } from '../../../config';
import { useSidebar } from './sidebar-context';

interface Language {
  code: string;
  name: string;
  flag: string;
}

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

export const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const dispatch = useDispatch();
  const language = useSelector((state: any) => state.language);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    getLanguageByCode(language?.code || 'en')
  );
  const sidebarLinks = getSidebarLinks(t);

  const user = useSelector(selectUser);

  useEffect(() => {
    if (language?.code) {
      i18n.changeLanguage(language.code);
      setCurrentLanguage(getLanguageByCode(language.code));
    }
  }, [language, i18n]);

  const handleLanguageChange = (lang: Language) => {
    dispatch(languageSave(lang));
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-full border-r bg-background transition-all duration-300 flex flex-col justify-between',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <div className="text-lg font-semibold whitespace-nowrap">
            <Link href="/">{appName}</Link>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1 px-1">
        <nav className="flex flex-col gap-1 pb-4">
          {sidebarLinks.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isOpen && <span className="truncate">{t(item.label)}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t">
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start gap-3 p-2 hover:bg-muted"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={currentLanguage.flag}
                    alt={currentLanguage.name}
                  />
                  <AvatarFallback>
                    <Globe className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                {isOpen && (
                  <span className="text-sm font-medium">
                    {currentLanguage.name}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={lang.flag} alt={lang.name} />
                      <AvatarFallback>{lang.code.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{lang.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 p-2 hover:bg-muted"
            asChild
          >
            <Link href="/profile">
              <Avatar>
                <AvatarImage src={user?.profileImage} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              {isOpen && (
                <span className="text-sm font-medium">{user.name}</span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
};
