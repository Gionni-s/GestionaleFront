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

interface Warehouse {
  _id: string
  name: string
  fkProprietario: string
}

interface AlthernativeWarehouse {
  message: string
}

interface FormData {
  name: string
}

const Werehouses: React.FC = () => {
  const [werehouses, setWerehouses] = useState<
    Warehouse[] | AlthernativeWarehouse
  >([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [form, setForm] = useState<FormData>({ name: "" })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/werehouses")
  }, [])

  const fetch = async (url: string): Promise<void> => {
    try {
      const response = await api.get<Warehouse[]>(url)
      setWerehouses(response.data)
    } catch (error) {
      console.error("Failed to fetch werehouses:", error)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/werehouses/${editingId}`, form)
      } else {
        await api.post("/werehouses", form)
      }
      setModalVisible(false)
      setForm({ name: "" })
      setEditingId(null)
      fetch("/werehouses")
    } catch (error) {
      console.error("Failed to save werehouse:", error)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`/werehouses/${id}`)
      fetch("/werehouses")
    } catch (error) {
      console.error("Failed to delete werehouse:", error)
    }
  }

  const renderTableContent = () => {
    if (!Array.isArray(werehouses)) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center">
            Loading...
          </TableCell>
        </TableRow>
      )
    }

    if (werehouses.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3}>No recipes found</TableCell>
        </TableRow>
      )
    }
    return werehouses.map((werehouse) => (
      <TableRow key={werehouse._id}>
        <TableCell>{werehouse.name}</TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setForm({ name: werehouse.name })
                setEditingId(werehouse._id)
                setModalVisible(true)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleDelete(werehouse._id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Werehouse Management</h1>
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setForm({ name: "" })
                setEditingId(null)
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Werehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Werehouse" : "Add Werehouse"}
              </DialogTitle>
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
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Werehouses
