'use client';
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useMemo,
} from 'react';
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
  PlusCircle,
  Loader2,
} from 'lucide-react';
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
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import { useTranslation } from 'react-i18next';
import { MinStockLevel, RootState } from '../types';
import { User as UserProfile } from '@/app/Profile/types';
import { Food } from '@/app/Food/types';
import UserApi from '@/services/axios/User';
import axios from '@/services/axios'; // Keep for non-user API calls

const Profile: React.FC = () => {
  // Profile states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // MinStock states
  const [foods, setFoods] = useState<Food[]>([]);
  const [minStockLevel, setMinStockLevel] = useState<MinStockLevel[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [minStockForm, setMinStockForm] = useState<Partial<MinStockLevel>>({});
  const [isLoadingMinStock, setIsLoadingMinStock] = useState<boolean>(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { t } = useTranslation();

  const settings = useSelector((state: RootState) => state.settings);

  const handleDarkModeToggle = useCallback(
    (value: boolean) => {
      dispatch(settingsSave({ darkMode: value }));
      document.documentElement.classList.toggle('dark', value);
    },
    [dispatch]
  );

  // Data fetching functions
  const fetchUserProfile = useCallback(async () => {
    try {
      // Use userApi instead of direct axios call
      const data = await UserApi.getUserById('me');
      setUserProfile(data);
      setForm(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadProfile'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  const fetchFoods = useCallback(async () => {
    try {
      const response = await axios.get<Food[]>('/foods');
      setFoods(response.data || []);
    } catch (error) {
      console.error('Failed to fetch food:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadFoodGroups'),
        variant: 'destructive',
      });
    }
  }, [toast, t]);

  const fetchMinStock = useCallback(async () => {
    setIsLoadingMinStock(true);
    try {
      const response = await axios.get<MinStockLevel[]>('/min-stock-levels');
      setMinStockLevel(response.data || []);
    } catch (error) {
      console.error('Failed to fetch min stock levels:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadMinStockLevels'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMinStock(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchUserProfile();
    fetchFoods();
    fetchMinStock();
  }, [fetchUserProfile, fetchFoods, fetchMinStock]);

  // Profile form handlers
  const handleFieldChange = useCallback(
    (field: keyof UserProfile, value: string | number | boolean) => {
      setForm((prevForm) =>
        prevForm ? { ...prevForm, [field]: value } : null
      );
    },
    []
  );

  const handleImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast({
            title: t('error'),
            description: t('imageSizeTooLarge'),
            variant: 'destructive',
          });
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreviewImage(result);
          setForm((prevForm) =>
            prevForm ? { ...prevForm, profileImage: result } : null
          );
        };
        reader.readAsDataURL(file);
      }
    },
    [toast, t]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;

    setIsSubmitting(true);
    try {
      // Use userApi instead of direct axios call
      await UserApi.updateMe(form);
      setUserProfile(form);
      setIsEditing(false);
      toast({
        title: t('success'),
        description: t('profileUpdatedSuccessfully'),
        variant: 'default',
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateProfile'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    setForm(userProfile);
    setPreviewImage(null);
    setIsEditing(false);
  }, [userProfile]);

  // MinStock handlers
  const resetMinStockForm = useCallback(() => {
    setMinStockForm({});
    setEditingId(undefined);
  }, []);

  const handleMinStockFormChange = useCallback((field: string, value: any) => {
    setMinStockForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleMinStockSubmit = useCallback(async () => {
    if (!minStockForm.foodId || minStockForm.quantity === undefined) {
      toast({
        title: t('error'),
        description: t('pleaseCompleteAllFields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/min-stock-levels/${editingId}`, minStockForm);
        toast({
          title: t('success'),
          description: t('minStockUpdatedSuccessfully'),
          variant: 'default',
        });
      } else {
        await axios.post('/min-stock-levels', minStockForm);
        toast({
          title: t('success'),
          description: t('minStockAddedSuccessfully'),
          variant: 'default',
        });
      }
      fetchMinStock();
      resetMinStockForm();
    } catch (error) {
      console.error('Min stock operation failed:', error);
      toast({
        title: t('error'),
        description: t('operationFailed'),
        variant: 'destructive',
      });
    }
  }, [minStockForm, editingId, toast, t, fetchMinStock, resetMinStockForm]);

  const handleEdit = useCallback((item: MinStockLevel) => {
    setEditingId(item._id);
    setMinStockForm({
      foodId: item.food._id,
      quantity: item.quantity,
    });
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`/min-stock-levels/${id}`);
        toast({
          title: t('success'),
          description: t('minStockDeletedSuccessfully'),
          variant: 'default',
        });
        fetchMinStock();
      } catch (error) {
        console.error('Delete failed:', error);
        toast({
          title: t('error'),
          description: t('deleteFailed'),
          variant: 'destructive',
        });
      }
    },
    [toast, t, fetchMinStock]
  );

  const handleLogout = useCallback(async () => {
    try {
      store.dispatch(logout());
      router.replace('/Auth');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: t('error'),
        description: t('logoutFailed'),
        variant: 'destructive',
      });
    }
  }, [router, toast, t]);

  // Memoized content for better performance
  const loadingContent = useMemo(
    () => (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-2xl">{t('profile')}</CardTitle>
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
    ),
    [t]
  );

  const minStockContent = useMemo(
    () => (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-l font-bold" htmlFor="minStockList">
            {t('minStockList')}
          </Label>
          <Modal
            onSave={handleMinStockSubmit}
            onCancel={resetMinStockForm}
            title={editingId ? t('editMinStock') : t('addMinStock')}
            triggerText={t('addMinStock')}
            icon={<PlusCircle className="mr-2 h-4 w-4" />}
            isEdit={editingId}
            editText={t('edit')}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="foodId">{t('food')}</Label>
                <Select
                  label={t('selectFoods')}
                  body={foods}
                  form={minStockForm}
                  setForm={setMinStockForm}
                  fieldToMap="foodId"
                  useCombobox={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={minStockForm.quantity ?? ''}
                  onChange={(e) =>
                    handleMinStockFormChange('quantity', Number(e.target.value))
                  }
                />
              </div>
            </div>
          </Modal>
        </div>

        {isLoadingMinStock ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table
            head={[
              t('name'),
              t('quantity'),
              { label: t('actions'), className: 'w-[100px]' },
            ]}
            body={minStockLevel}
            bodyKeys={['food.name', 'quantity']}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    ),
    [
      t,
      handleMinStockSubmit,
      resetMinStockForm,
      editingId,
      foods,
      minStockForm,
      isLoadingMinStock,
      minStockLevel,
      handleEdit,
      handleDelete,
    ]
  );

  if (loading) {
    return loadingContent;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="relative border-b pb-4">
          <div className="absolute right-6 top-6 flex gap-2">
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
                    {t('configurePreferences')}
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

                  {minStockContent}
                </div>
              </SheetContent>
            </Sheet>

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
                  <p>{t('logout')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            {t('userProfile')}
          </CardTitle>
        </CardHeader>

        {form && (
          <CardContent className="pt-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="personal">
                  {t('personalInformation')}
                </TabsTrigger>
                <TabsTrigger value="account">{t('account')}</TabsTrigger>
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
                          className="object-cover aspect-square"
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

                    <div className="flex-1 w-full space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" /> {t('firstName')}
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
                            <User className="h-4 w-4" /> {t('lastName')}
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
                          <Phone className="h-4 w-4" /> {t('phoneNumber')}
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={form.phoneNumber || ''}
                          onChange={(e) =>
                            handleFieldChange(
                              'phoneNumber',
                              Number(e.target.value) || 0
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
                          <Palette className="h-4 w-4" /> {t('profileColor')}
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="color"
                            type="color"
                            value={form.color || '#000000'}
                            onChange={(e) =>
                              handleFieldChange('color', e.target.value)
                            }
                            required
                            disabled={!isEditing}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <div
                            className="w-10 h-10 rounded-full border"
                            style={{ backgroundColor: form.color || '#000000' }}
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
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" /> {t('cancel')}
                        </Button>
                        <Button
                          type="submit"
                          className="flex items-center gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {t('save')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" /> {t('edit')}
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="account">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {t('email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('emailNotModifiable')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" /> {t('role')}
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
                      <UserCircle className="h-4 w-4" /> {t('registrationDate')}
                    </Label>
                    <Input
                      value={new Date(form.dateCreation).toLocaleDateString()}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" /> {t('lastLogin')}
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

export default React.memo(Profile);
