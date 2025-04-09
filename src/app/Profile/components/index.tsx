'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from '@/services/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { logout } from '@/services/store/auth';
import { store } from '@/services/store';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Camera,
  UserCircle,
  Settings,
  Edit,
  Check,
  X,
  Moon,
  Sun,
  User,
  Mail,
  Phone,
  Palette,
} from 'lucide-react';
import { t } from 'i18next';
import { useDispatch, useSelector } from 'react-redux';
import { settingsSave } from '@/services/store/setting';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  _id: string;
  name: string;
  surname: string;
  email: string;
  isConfimer: boolean;
  password: string;
  phoneNumber: number;
  dateCreation: Date;
  lastLogin: Date;
  profileImage?: string;
  color: string;
  role: string;
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const settings = useSelector((state: any) => state.settings);

  const handleDarkModeToggle = (value: boolean) => {
    dispatch(settingsSave({ darkMode: value }));
    document.documentElement.classList.toggle('dark', value);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get<UserProfile>('/users/me');
      setUserProfile(data);
      setForm(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: keyof UserProfile,
    value: string | number | boolean
  ) => {
    if (form) {
      setForm({ ...form, [field]: value });
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        if (form) {
          setForm({ ...form, profileImage: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form) {
      try {
        await axios.put(`/users/me`, form);
        setUserProfile(form);
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          variant: 'default',
        });
      } catch (error) {
        console.error('Profile update failed:', error);
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCancel = () => {
    setForm(userProfile);
    setPreviewImage(null);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      store.dispatch(logout());
      router.replace('/Auth');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="w-full space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="relative border-b pb-4">
          <div className="absolute right-6 top-6 flex gap-2">
            {/* Fixed implementation for settings button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{t('settings')}</SheetTitle>
                  <SheetDescription>
                    Configure your application preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {settings.darkMode ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                      <Label htmlFor="darkMode" className="text-base">
                        {t('darkMode')}
                      </Label>
                    </div>
                    <Switch
                      id="darkMode"
                      checked={settings.darkMode}
                      onCheckedChange={handleDarkModeToggle}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Tooltip for logout button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Profilo Utente
          </CardTitle>
        </CardHeader>

        {form && (
          <CardContent className="pt-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="personal">
                  Informazioni Personali
                </TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative">
                      <Avatar
                        className="w-40 h-40 border-4 shadow-md transition-all hover:scale-105"
                        style={{ borderColor: form.color }}
                      >
                        <AvatarImage
                          src={previewImage || form.profileImage}
                          alt="Profile"
                          className="object-cover"
                        />
                        <AvatarFallback
                          style={{ backgroundColor: form.color }}
                          className="text-white text-3xl"
                        >
                          {form.name?.charAt(0)}
                          {form.surname?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2">
                          <Label
                            htmlFor="profileImage"
                            className="bg-primary text-primary-foreground rounded-full p-3 cursor-pointer 
                            hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center"
                          >
                            <Camera className="w-5 w-5" />
                            <Input
                              id="profileImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </Label>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" /> Nome
                          </Label>
                          <Input
                            id="name"
                            value={form.name}
                            onChange={(e) =>
                              handleFieldChange('name', e.target.value)
                            }
                            required
                            disabled={!isEditing}
                            className={isEditing ? 'border-primary' : ''}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="surname"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" /> Cognome
                          </Label>
                          <Input
                            id="surname"
                            value={form.surname}
                            onChange={(e) =>
                              handleFieldChange('surname', e.target.value)
                            }
                            required
                            disabled={!isEditing}
                            className={isEditing ? 'border-primary' : ''}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phoneNumber"
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" /> Numero di Telefono
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={form.phoneNumber}
                          onChange={(e) =>
                            handleFieldChange(
                              'phoneNumber',
                              Number(e.target.value)
                            )
                          }
                          required
                          disabled={!isEditing}
                          className={isEditing ? 'border-primary' : ''}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="color"
                          className="flex items-center gap-2"
                        >
                          <Palette className="h-4 w-4" /> Colore Profilo
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="color"
                            type="color"
                            value={form.color}
                            onChange={(e) =>
                              handleFieldChange('color', e.target.value)
                            }
                            required
                            disabled={!isEditing}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <div
                            className="w-10 h-10 rounded-full border"
                            style={{ backgroundColor: form.color }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" /> Annulla
                        </Button>
                        <Button
                          type="submit"
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" /> Salva
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" /> Modifica
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="account">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      L'indirizzo email non può essere modificato.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" /> Ruolo
                    </Label>
                    <Input
                      id="role"
                      value={form.role}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" /> Data registrazione
                    </Label>
                    <Input
                      value={new Date(form.dateCreation).toLocaleDateString()}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" /> Ultimo accesso
                    </Label>
                    <Input
                      value={new Date(form.lastLogin).toLocaleDateString()}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Profile;
