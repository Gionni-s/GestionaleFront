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

interface Food {
  _id: string
  name: string
  userId: string
}

interface AlternativeFood {
  message: string
}

interface FormData {
  name: string
}

const Foods: React.FC = () => {
  const [foods, setFoods] = useState<Food[] | AlternativeFood>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [form, setForm] = useState<FormData>({ name: "" })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/foods")
  }, [])

  const fetch = async (url: string): Promise<void> => {
    try {
      const response = await api.get<Food[]>(url)
      setFoods(response.data)
    } catch (error) {
      console.error("Failed to fetch foods:", error)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/foods/${editingId}`, form)
      } else {
        await api.post("/foods", form)
      }
      setModalVisible(false)
      setForm({ name: "" })
      setEditingId(null)
      fetch("/foods")
    } catch (error) {
      console.error("Failed to save food:", error)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`/foods/${id}`)
      fetch("/foods")
    } catch (error) {
      console.error("Failed to delete food:", error)
    }
  }

  const generate = () => {
    if (!Array.isArray(foods)) {
      // This means 'foods' is of type 'AlternativeFood'
      return (
        <TableRow>
          <TableCell colSpan={2}>{foods.message}</TableCell>
        </TableRow>
      )
    } else if (foods.length === 0) {
      // Handle case when the array is empty
      return (
        <TableRow>
          <TableCell colSpan={2}>Loading...</TableCell>
        </TableRow>
      )
    } else {
      // 'foods' is a valid array of 'Food' items
      return foods.map((food) => (
        <TableRow key={food._id}>
          <TableCell>{food.name}</TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setForm({ name: food.name })
                  setEditingId(food._id)
                  setModalVisible(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleDelete(food._id)}
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
        <h1 className="text-3xl font-bold">Food Management</h1>
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setForm({ name: "" })
                setEditingId(null)
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Food
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Food" : "Add Food"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
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
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{generate()}</TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Foods
