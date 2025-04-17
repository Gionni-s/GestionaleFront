'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Select from '@/components/Select';
import axios from '@/services/axios/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AlternativeRecipe,
  IngredientFormData,
  Ingredient,
  Recipe,
} from '../types';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';
import { Cookbook } from '@/app/Label/types';

const Recipes: React.FC = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[] | AlternativeRecipe>({
    message: '',
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form, setForm] = useState<IngredientFormData>({
    name: '',
    cookbookId: '',
    ingredients: [
      { foodId: '', quantity: 1, name: '' },
      { foodId: '', quantity: 1, name: '' },
    ],
  });
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [ingridientOptions, setIngredientOptions] = useState<Ingredient[]>([]);
  const [cookbookOptions, setCookbookOptions] = useState<Cookbook[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [recipesRes, ingredientsRes, cookbooksRes] = await Promise.all([
        axios.get<Recipe[]>('/recipes'),
        axios.get<Ingredient[]>('/foods'),
        axios.get<Cookbook[]>('/cookBooks'),
      ]);
      setRecipes(recipesRes.data);
      setIngredientOptions(ingredientsRes.data);
      setCookbookOptions(cookbooksRes.data);
    } catch (error) {
      // if(error.)
      console.error('Failed to fetch data:', error);
    }
  }, []);

  // Effect for loading recipes, ingridients, and cookbooks
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get<Recipe[]>('/recipes');
      setRecipes(response.data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes({ message: 'Failed to load recipes' });
    }
  };

  const handleSubmit = async () => {
    try {
      setModalVisible(false);
      if (editingId) {
        await axios.put(`/recipes/${editingId}`, form);
      } else {
        await axios.post('/recipes', form);
      }
      resetForm();
      fetchRecipes();
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/recipes/${id}`);
      fetchRecipes();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const addIngridientField = () => {
    setForm({
      ...form,
      ingredients: [...form.ingredients, { foodId: '', name: '', quantity: 1 }],
    });
  };

  const removeIngredientField = (index: number) => {
    const updatedIngridients = form.ingredients.filter((_, i) => i !== index);
    setForm({ ...form, ingredients: updatedIngridients });
  };

  const handleFieldChange = (
    field: string,
    value: string | number,
    index?: number
  ) => {
    if (field === 'name' || field === 'bookId' || field === 'note') {
      setForm({ ...form, [field]: value });
    } else if (index !== undefined) {
      const updatedIngridients = form.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      );
      setForm({ ...form, ingredients: updatedIngridients });
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      cookbookId: '',
      ingredients: [
        { foodId: '', name: '', quantity: 1 },
        { foodId: '', name: '', quantity: 1 },
      ],
      note: '',
    });
    setEditingId(undefined);
  };

  const renderTableRows = () => {
    if (!Array.isArray(recipes)) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center">
            {t('noElementFound')}
          </TableCell>
        </TableRow>
      );
    }

    if (recipes.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3}>{t('loadings')}</TableCell>
        </TableRow>
      );
    }
    return recipes.map((recipe) => (
      <TableRow key={recipe._id}>
        <TableCell>{recipe.name}</TableCell>
        <TableCell>{recipe.cookBook?.name || 'N/A'}</TableCell>
        <TableCell>
          {recipe.ingredients.map((val, index) => (
            <p key={index}>
              {val.food?.name || 'N/A'} : {val.quantity}
            </p>
          ))}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">{generateDefaultFields(recipe)}</div>
        </TableCell>
      </TableRow>
    ));
  };

  const generateDefaultFields = (recipe: Recipe) => {
    return (
      <>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            console.log(recipe._id);
            router.replace('/RecipeDetail?id=' + recipe._id);
          }}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setForm({
              name: recipe.name,
              cookbookId: recipe.cookbookId,
              ingredients: recipe.ingredients.map((ingredient) => ({
                foodId: ingredient.foodId,
                quantity: ingredient.quantity,
                name: ingredient.name,
              })),
              note: recipe.note,
            });
            setEditingId(recipe._id);
            setModalVisible(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={() => handleDelete(recipe._id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </>
    );
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('recipeManagements')}</h1>
        <Modal
          onCancel={() => {
            resetForm();
            setEditingId(undefined);
          }}
          onSave={handleSubmit}
          title={editingId ? t('editRecipes') : t('addRecipes')}
          triggerText={t('addRecipes')}
          isEdit={editingId}
          icon={<PlusCircle className="mr-2 h-4 w-4" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('names')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cookbook">{t('cookBooks')}</Label>
              <Select
                label={t('selectCookBooks')}
                body={cookbookOptions}
                form={form}
                setForm={setForm}
                fieldToMap="cookbookId"
                useCombobox={true}
              />
            </div>

            <div className="space-y-4">
              <Label>{t('ingredients')}</Label>
              <Button type="button" onClick={addIngridientField}>
                {t('addIngredients')}
              </Button>
              {form.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={ingredient.foodId}
                    onChange={(e) =>
                      handleFieldChange('foodId', e.target.value, index)
                    }
                    className="border p-2 rounded"
                    required
                  >
                    <option value="">{t('selectIngredients')}</option>
                    {(Array.isArray(ingridientOptions) &&
                      ingridientOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                          {option.name}
                        </option>
                      ))) ||
                      'N/A'}
                  </select>
                  <Input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleFieldChange(
                        'quantity',
                        Number(e.target.value),
                        index
                      )
                    }
                    min="1"
                    className="w-20"
                    required
                  />
                  {form.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeIngredientField(index)}
                    >
                      {t('removes')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Label>{t('notes')}</Label>
              <Textarea
                value={form.note}
                onChange={(e) => handleFieldChange('note', e.target.value)}
              ></Textarea>
            </div>
          </div>
        </Modal>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('names')}</TableHead>
              <TableHead>{t('cookBooks')}</TableHead>
              <TableHead>{t('ingredients')}</TableHead>
              <TableHead className="w-[100px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Recipes;
