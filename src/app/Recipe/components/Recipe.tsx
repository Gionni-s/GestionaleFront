"use client"
import React, { useState, useEffect } from "react"
import { axiosInstance as api } from "@/services/axios/index"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle, Pencil, Trash } from "lucide-react"

// Interfacce per il tipo di dati
interface Recipe {
  _id: string
  name: string
  userId: string
  ingridients: RecipeIngredient[]
  bookId: string
}

interface AlthernativeRecipe {
  message: string
}

interface Ingredient {
  _id: string
  name: string
}

interface CookBook {
  _id: string
  name: string
}

interface RecipeIngredient {
  foodId: string
  quantity: number
}

interface FormData {
  name: string
  bookId: string
  ingridients: RecipeIngredient[]
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[] | AlthernativeRecipe>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [form, setForm] = useState<FormData>({
    name: "",
    bookId: "",
    ingridients: [
      { foodId: "", quantity: 1 },
      { foodId: "", quantity: 1 },
    ],
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ingredientOptions, setIngredientOptions] = useState<Ingredient[]>([])
  const [cookbookOptions, setCookbookOptions] = useState<CookBook[]>([])

  // Effetto per il caricamento delle ricette, ingredienti e libri di cucina
  useEffect(() => {
    fetchRecipes()
    fetchIngredients()
    fetchCookBooks()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await api.get<Recipe[]>("/recipes")
      setRecipes(response.data)
    } catch (error) {
      console.error("Failed to fetch recipes:", error)
    }
  }

  const fetchIngredients = async () => {
    try {
      const response = await api.get<Ingredient[]>("/foods")
      setIngredientOptions(response.data)
    } catch (error) {
      console.error("Failed to fetch ingridients:", error)
    }
  }

  const fetchCookBooks = async () => {
    try {
      const response = await api.get<CookBook[]>("/cookBooks")
      setCookbookOptions(response.data)
    } catch (error) {
      console.error("Failed to fetch cookbooks:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, form)
      } else {
        await api.post("/recipes", form)
      }
      setModalVisible(false)
      resetForm()
      fetchRecipes()
    } catch (error) {
      console.error("Failed to save recipe:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log(id)
      await api.delete(`/recipes/${id}`)
      fetchRecipes()
    } catch (error) {
      console.error("Failed to delete recipe:", error)
    }
  }

  const addIngredientField = () => {
    setForm({
      ...form,
      ingridients: [...form.ingridients, { foodId: "", quantity: 1 }],
    })
  }

  const removeIngredientField = (index: number) => {
    const updatedIngredients = form.ingridients.filter((_, i) => i !== index)
    setForm({ ...form, ingridients: updatedIngredients })
  }

  const handleFieldChange = (
    field: string,
    value: string | number,
    index?: number
  ) => {
    if (field === "name" || field === "fkBook") {
      setForm({ ...form, [field]: value })
    } else if (index !== undefined) {
      const updatedIngredients = form.ingridients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
      setForm({ ...form, ingridients: updatedIngredients })
    }
  }

  const resetForm = () => {
    setForm({
      name: "",
      bookId: "",
      ingridients: [
        { foodId: "", quantity: 1 },
        { foodId: "", quantity: 1 },
      ],
    })
    setEditingId(null)
  }

  const generate = () => {
    if (!Array.isArray(recipes)) {
      // This means 'foods' is of type 'AlternativeFood'
      return (
        <TableRow>
          <TableCell colSpan={2}>{recipes.message}</TableCell>
        </TableRow>
      )
    } else if (recipes.length === 0) {
      // Handle case when the array is empty
      return (
        <TableRow>
          <TableCell colSpan={2}>Loading...</TableCell>
        </TableRow>
      )
    } else {
      recipes.map((recipe) => (
        <TableRow key={recipe._id}>
          <TableCell>{recipe.name}</TableCell>
          <TableCell>
            {cookbookOptions.find((book) => book._id === recipe.bookId)?.name ||
              "N/A"}
          </TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setForm({
                    name: recipe.name,
                    bookId: recipe.bookId,
                    ingridients: recipe.ingridients.map((ingredient) => ({
                      foodId: ingredient.foodId,
                      quantity: ingredient.quantity,
                    })),
                  })
                  setEditingId(recipe._id)
                  setModalVisible(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleDelete(recipe._id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))
    }
  }

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
                {editingId ? "Edit Recipe" : "Add Recipe"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cookbook">CookBook</Label>
                <select
                  id="cookbook"
                  value={form.bookId}
                  onChange={(e) => handleFieldChange("bookId", e.target.value)}
                  className="border p-2 rounded w-full"
                  // required
                >
                  <option value="">Select Cookbook</option>
                  {recipes.length > 0 && cookbookOptions.map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ingredienti */}
              <div className="space-y-4">
                <Label>Ingredients</Label>
                {recipes.length > 0 && form.ingridients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={ingredient.foodId}
                      onChange={(e) =>
                        handleFieldChange("foodId", e.target.value, index)
                      }
                      className="border p-2 rounded"
                      required
                    >
                      <option value="">Select Ingredient</option>
                      {ingredientOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleFieldChange(
                          "quantity",
                          Number(e.target.value),
                          index
                        )
                      }
                      min="1"
                      className="w-20"
                      required
                    />
                    <Button
                      variant="outline"
                      onClick={() => removeIngredientField(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addIngredientField}>
                  Add Ingredient
                </Button>
              </div>

              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
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
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {generate()}
            {/* {recipes.length > 0 &&
              recipes.map((recipe) => (
                <TableRow key={recipe._id}>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>
                    {cookbookOptions.find((book) => book._id === recipe.bookId)
                      ?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setForm({
                            name: recipe.name,
                            bookId: recipe.bookId,
                            ingridients: recipe.ingridients.map(
                              (ingredient) => ({
                                foodId: ingredient.foodId,
                                quantity: ingredient.quantity,
                              })
                            ),
                          })
                          setEditingId(recipe._id)
                          setModalVisible(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDelete(recipe._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))} */}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Recipes
