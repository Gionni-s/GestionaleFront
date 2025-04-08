'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from '@/services/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';
import { logout } from '@/services/store/auth';
import { LogOut, Camera, UserCircle, Settings } from 'lucide-react';
import { store } from '@/services/store';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { t } from 'i18next';
import { useDispatch, useSelector } from 'react-redux';
import { settingsSave } from '@/services/store/setting';
import { Switch } from '@/components/ui/switch';
import Modal from '@/components/Modal';

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
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [form, setForm] = useState<UserProfile>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const router = useRouter();

  const dispatch = useDispatch();
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
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
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
        setSuccessMessage('Profilo aggiornato con successo!');
        setTimeout(() => setSuccessMessage(undefined), 3000);
      } catch (error) {
        console.error('Aggiornamento profilo fallito:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      store.dispatch(logout());
      router.replace('/Auth');
      router.refresh();
    } catch (error) {
      console.error('Logout fallito:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <UserCircle className="w-16 h-16 animate-pulse text-gray-400" />
      </div>
    );
  }

  return (
    <Card className="p-8 h-full w-full shadow-xl rounded-xl">
      <div className="relative">
        <div className="absolute right-0 top-0">
          <Dialog open={modalVisible} onOpenChange={setModalVisible}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setModalVisible(true);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                {t('settings')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('settings')}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="darkMode">{t('darkMode')}</Label>
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>

                {/* <Button
                  className="w-full"
                  onClick={() => {
                    applySettings(settings);
                    setModalVisible(false);
                  }}
                >
                  {t('saveSettings')}
                </Button> */}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Profilo
        </h1>
        {successMessage && (
          <Alert
            variant="default"
            className="mb-4 bg-green-100 border-green-300"
          >
            {successMessage}
          </Alert>
        )}
        {form && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center w-full mb-10">
              <div className="grid grid-cols-[1fr_2fr] gap-6 w-full max-w-4xl">
                {/* Avatar */}
                <div className="relative flex">
                  <Avatar className="w-48 h-48 border-2 border-gray-300 transition-transform">
                    <AvatarImage
                      src={previewImage || form.profileImage}
                      alt="Profilo"
                    />
                    <AvatarFallback>
                      {form.name?.charAt(0)} {form.surname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <Label
                        htmlFor="profileImage"
                        className="bg-black text-white rounded-full p-2 cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-center"
                      >
                        <Camera className="w-5 h-5" />
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

                {/* Form */}
                <div className="flex flex-col justify-center w-full">
                  <Label htmlFor="name" className="text-gray-700">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    required
                    disabled={!isEditing}
                    className="mt-1 w-full bg-white border-gray-300 focus:border-black transition-colors"
                  />
                  <Label htmlFor="surname" className="text-gray-700 mt-4">
                    Cognome
                  </Label>
                  <Input
                    id="surname"
                    value={form.surname}
                    onChange={(e) =>
                      handleFieldChange('surname', e.target.value)
                    }
                    required
                    disabled={!isEditing}
                    className="mt-1 w-full bg-white border-gray-300 focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                required
                disabled
                className="mt-1 bg-gray-100 border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-gray-700">
                Numero di Telefono
              </Label>
              <Input
                id="phoneNumber"
                type="number"
                value={form.phoneNumber}
                onChange={(e) =>
                  handleFieldChange('phoneNumber', Number(e.target.value))
                }
                required
                disabled={!isEditing}
                className="mt-1 bg-white border-gray-300 focus:border-black transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-gray-700">
                Colore
              </Label>
              <Input
                id="color"
                type="color"
                value={form.color}
                onChange={(e) => handleFieldChange('color', e.target.value)}
                required
                disabled={!isEditing}
                className="mt-1 bg-white border-gray-300 focus:border-black transition-colors"
              />
            </div>

            <div className="flex justify-between mt-6">
              <Button
                type="submit"
                disabled={!isEditing}
                className="bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Aggiorna Profilo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="border-black text-black hover:bg-gray-100 transition-colors"
              >
                {isEditing ? 'Annulla' : 'Modifica'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};

export default Profile;
