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

interface Location {
  _id: string
  name: string
  fkProprietario: string
}

interface FormData {
  name: string
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [form, setForm] = useState<FormData>({ name: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await api.get<Location[]>("/locations")
      setLocations(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch locations:", error)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/locations/${editingId}`, form)
      } else {
        await api.post("/locations", form)
      }
      setModalVisible(false)
      setForm({ name: "" })
      setEditingId(null)
      fetchLocations()
    } catch (error) {
      console.error("Failed to save location:", error)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`/locations/${id}`)
      fetchLocations()
    } catch (error) {
      console.error("Failed to delete location:", error)
    }
  }

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={2} className="text-center">
            Loading...
          </TableCell>
        </TableRow>
      )
    }
    if (locations.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={2} className="text-center">
            No locations available
          </TableCell>
        </TableRow>
      )
    }
    return locations.map((location) => (
      <TableRow key={location._id}>
        <TableCell>{location.name}</TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setForm({ name: location.name })
                setEditingId(location._id)
                setModalVisible(true)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleDelete(location._id)}
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
        <h1 className="text-3xl font-bold">Location Management</h1>
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setForm({ name: "" })
                setEditingId(null)
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Location" : "Add Location"}
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

export default Locations
