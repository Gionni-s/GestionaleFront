'use client';
import React, { useState, useEffect } from 'react';
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
  ingridients: RecipeIngredient[];
  cookbookId: { _id: string; name: string };
}

interface AlternativeRecipe {
  message: string;
}

interface Ingredient {
  _id: string;
  name: string;
}

interface CookBook {
  _id: string;
  name: string;
}

interface RecipeIngredient {
  foodId: { _id: string; name: string };
  name?: string;
  quantity: number;
}

interface FormData {
  name: string;
  cookbookId: string;
  ingridients: RecipeIngredient[];
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
      { foodId: { _id: '', name: '' }, quantity: 1 },
      { foodId: { _id: '', name: '' }, quantity: 1 },
    ],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ingredientOptions, setIngredientOptions] = useState<Ingredient[]>([]);
  const [cookbookOptions, setCookbookOptions] = useState<CookBook[]>([]);

  // Effect for loading recipes, ingredients, and cookbooks
  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
    fetchCookBooks();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await api.get<Recipe[]>('/recipes');
      setRecipes(response.data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes({ message: 'Failed to load recipes' });
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get<Ingredient[]>('/foods');
      setIngredientOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    }
  };

  const fetchCookBooks = async () => {
    try {
      const response = await api.get<CookBook[]>('/cookBooks');
      setCookbookOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch cookbooks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, form);
      } else {
        await api.post('/recipes', form);
      }
      setModalVisible(false);
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

  const addIngredientField = () => {
    setForm({
      ...form,
      ingridients: [
        ...form.ingridients,
        { foodId: { _id: '', name: '' }, quantity: 1 },
      ],
    });
  };

  const removeIngredientField = (index: number) => {
    const updatedIngredients = form.ingridients.filter((_, i) => i !== index);
    setForm({ ...form, ingridients: updatedIngredients });
  };

  const handleFieldChange = (
    field: string,
    value: string | number,
    index?: number
  ) => {
    if (field === 'name' || field === 'bookId') {
      setForm({ ...form, [field]: value });
    } else if (index !== undefined) {
      const updatedIngredients = form.ingridients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      );
      setForm({ ...form, ingridients: updatedIngredients });
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      cookbookId: '',
      ingridients: [
        { foodId: { _id: '', name: '' }, quantity: 1 },
        { foodId: { _id: '', name: '' }, quantity: 1 },
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
        <TableCell>{recipe.cookbookId?.name || 'N/A'}</TableCell>
        <TableCell>
          {recipe.ingridients.map((val, index) => (
            <p key={index}>
              {val.foodId?.name || 'N/A'} : {val.quantity}
            </p>
          ))}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setForm({
                  name: recipe.name,
                  cookbookId: recipe.cookbookId._id,
                  ingridients: recipe.ingridients.map((ingredient) => ({
                    foodId: ingredient.foodId,
                    quantity: ingredient.quantity,
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
          </div>
        </TableCell>
      </TableRow>
    ));
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

              {/* Ingredients */}
              <div className="space-y-4">
                <Label>Ingredients</Label>
                {form.ingridients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={ingredient.foodId._id}
                      onChange={(e) =>
                        handleFieldChange('foodId', e.target.value, index)
                      }
                      className="border p-2 rounded"
                      required
                    >
                      <option value="">Select Ingredient</option>
                      {(Array.isArray(ingredientOptions) &&
                        ingredientOptions.map((option) => (
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
                    {form.ingridients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeIngredientField(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={addIngredientField}>
                  Add Ingredient
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
