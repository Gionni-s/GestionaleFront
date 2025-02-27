'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Select from '@/components/Select';
import { axiosInstance as api } from '@/services/axios/index';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash } from 'lucide-react';

// Interfaces for data types
interface Recipe {
  _id: string;
  name: string;
  userId: string;
  ingridients: RecipeIngridient[];
  cookbookId: string;
  cookBook: CookBook;
  food: Ingridient;
}

interface AlternativeRecipe {
  message: string;
}

interface Ingridient {
  _id: string;
  name: string;
}

interface CookBook {
  _id: string;
  name: string;
}

interface RecipeIngridient {
  foodId: string;
  name: string;
  quantity: number;
  food?: { _id: string; name: string };
}

interface FormData {
  name: string;
  cookbookId: string;
  ingridients: RecipeIngridient[];
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[] | AlternativeRecipe>({
    message: '',
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form, setForm] = useState<FormData>({
    name: '',
    cookbookId: '',
    ingridients: [
      { foodId: '', quantity: 1, name: '' },
      { foodId: '', quantity: 1, name: '' },
    ],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ingridientOptions, setIngridientOptions] = useState<Ingridient[]>([]);
  const [cookbookOptions, setCookbookOptions] = useState<CookBook[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [recipesRes, ingridientsRes, cookbooksRes] = await Promise.all([
        api.get<Recipe[]>('/recipes'),
        api.get<Ingridient[]>('/foods'),
        api.get<CookBook[]>('/cookBooks'),
      ]);
      setRecipes(recipesRes.data);
      setIngridientOptions(ingridientsRes.data);
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
      const response = await api.get<Recipe[]>('/recipes');
      setRecipes(response.data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes({ message: 'Failed to load recipes' });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setModalVisible(false);
      if (editingId) {
        await api.put(`/recipes/${editingId}`, form);
      } else {
        await api.post('/recipes', form);
      }
      resetForm();
      fetchRecipes();
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/recipes/${id}`);
      fetchRecipes();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const addIngridientField = () => {
    setForm({
      ...form,
      ingridients: [...form.ingridients, { foodId: '', name: '', quantity: 1 }],
    });
  };

  const removeIngridientField = (index: number) => {
    const updatedIngridients = form.ingridients.filter((_, i) => i !== index);
    setForm({ ...form, ingridients: updatedIngridients });
  };

  const handleFieldChange = (
    field: string,
    value: string | number,
    index?: number
  ) => {
    if (field === 'name' || field === 'bookId') {
      setForm({ ...form, [field]: value });
    } else if (index !== undefined) {
      const updatedIngridients = form.ingridients.map((ingridient, i) =>
        i === index ? { ...ingridient, [field]: value } : ingridient
      );
      setForm({ ...form, ingridients: updatedIngridients });
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      cookbookId: '',
      ingridients: [
        { foodId: '', name: '', quantity: 1 },
        { foodId: '', name: '', quantity: 1 },
      ],
    });
    setEditingId(null);
  };

  const renderTableRows = () => {
    if (!Array.isArray(recipes)) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center">
            No element found
          </TableCell>
        </TableRow>
      );
    }

    if (recipes.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3}>Loading...</TableCell>
        </TableRow>
      );
    }
    return recipes.map((recipe) => (
      <TableRow key={recipe._id}>
        <TableCell>{recipe.name}</TableCell>
        <TableCell>{recipe.cookBook?.name || 'N/A'}</TableCell>
        <TableCell>
          {recipe.ingridients.map((val, index) => (
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
            setForm({
              name: recipe.name,
              cookbookId: recipe.cookbookId,
              ingridients: recipe.ingridients.map((ingridient) => ({
                foodId: ingridient.foodId,
                quantity: ingridient.quantity,
                name: ingridient.name,
              })),
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Recipe Management</h1>
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Recipe' : 'Add Recipe'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cookbook">CookBook</Label>
                <Select
                  label="Seleziona un Libro di ricette"
                  body={cookbookOptions}
                  form={form}
                  setForm={setForm}
                  fieldToMap="cookbookId"
                />
              </div>

              {/* Ingridients */}
              <div className="space-y-4">
                <Label>Ingridients</Label>
                {form.ingridients.map((ingridient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={ingridient.foodId}
                      onChange={(e) =>
                        handleFieldChange('foodId', e.target.value, index)
                      }
                      className="border p-2 rounded"
                      required
                    >
                      <option value="">Select Ingridient</option>
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
                      value={ingridient.quantity}
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
                    {form.ingridients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeIngridientField(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={addIngridientField}>
                  Add Ingridient
                </Button>
              </div>

              <Button type="submit" className="w-full">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>CookBook</TableHead>
              <TableHead>Ingridients</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Recipes;
