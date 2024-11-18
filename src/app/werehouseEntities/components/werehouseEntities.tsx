"use client"
import React, { useState, useEffect } from "react"
import { axiosInstance as api } from "@/services/axios/index"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Input } from "@/components/ui/input"

// Define types for data
interface WerehouseEntitie {
  _id: string
  quantita: number
  scadenza: string
  foodId: string
  locationId: string
  warehouseId: string
  userId: string
  food: {
    _id: string
    name: string
  }
  location: {
    _id: string
    name: string
  }
  warehouse: {
    _id: string
    name: string
  }
}

interface AlthernativeWarehouse {
  message: string
}

interface FormData {
  foodId: string
  locationId: string
  warehouseId: string
  userId: string
  quantita: number
  scadenza: string
}

const WerehouseEntities: React.FC = () => {
  const [werehouseEntities, setWerehouseEntities] = useState<
    WerehouseEntitie[] | AlthernativeWarehouse
  >([])
  const [form, setForm] = useState<FormData>({
    foodId: "",
    locationId: "",
    warehouseId: "",
    userId: "",
    quantita: 1,
    scadenza: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [foods, setFoods] = useState<{ _id: string; name: string }[]>([])
  const [locations, setLocations] = useState<{ _id: string; name: string }[]>(
    []
  )
  const [warehouses, setWarehouses] = useState<{ _id: string; name: string }[]>(
    []
  )

  useEffect(() => {
    const fetchData = async () => {
      await fetchWerehouseEntities()
      await fetchFoods()
      await fetchLocations()
      await fetchWarehouses()
    }

    fetchData()
  }, [])

  const fetchWerehouseEntities = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<WerehouseEntitie[]>("/werehouseEntities")
      setWerehouseEntities(response.data || [])
    } catch (err) {
      setError("Failed to fetch warehouse entities.")
    } finally {
      setLoading(false)
    }
  }

  const fetchFoods = async () => {
    try {
      const response = await api.get("/foods")
      setFoods(response.data || [])
    } catch (error) {
      console.error("Failed to fetch foods:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await api.get("/locations")
      setLocations(response.data || [])
    } catch (error) {
      console.error("Failed to fetch locations:", error)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await api.get("/werehouses")
      setWarehouses(response.data || [])
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/werehouseEntities/${editingId}`, form)
      } else {
        await api.post("/werehouseEntities", form)
      }
      setModalVisible(false)
      resetForm()
      setEditingId(null)
      await fetchWerehouseEntities() // Refetch the updated list
    } catch (error) {
      console.error("Failed to save warehouse entity:", error)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await api.delete(`/werehouseEntities/${id}`)
      fetchWerehouseEntities() // Refetch after delete
    } catch (error) {
      console.error("Failed to delete warehouse entity:", error)
    }
  }

  const resetForm = () => {
    setForm({
      foodId: "",
      locationId: "",
      warehouseId: "",
      userId: "",
      quantita: 1,
      scadenza: "",
    })
  }

  const handleEdit = (werehouseEntitie: WerehouseEntitie) => {
    setForm({
      foodId: werehouseEntitie.foodId,
      locationId: werehouseEntitie.locationId,
      warehouseId: werehouseEntitie.warehouseId,
      userId: werehouseEntitie.userId,
      quantita: werehouseEntitie.quantita,
      scadenza: werehouseEntitie.scadenza.split("T")[0],
    })
    setEditingId(werehouseEntitie._id)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    resetForm()
    setEditingId(null)
  }

  const getExpirationColor = (expirationDate: string) => {
    const daysUntilExpiration =
      (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (daysUntilExpiration <= 0) return "text-red-600" // Expired
    if (daysUntilExpiration <= 7) return "text-red-500" // Less than a week
    if (daysUntilExpiration <= 30) return "text-orange-400" // Less than a month
    return "text-gray-700" // More than a month
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  const generate = () => {
    if (!Array.isArray(werehouseEntities)) {
      // This means 'foods' is of type 'AlternativeFood'
      return (
        <TableRow>
          <TableCell colSpan={2}>{werehouseEntities.message}</TableCell>
        </TableRow>
      )
    } else if (werehouseEntities.length === 0) {
      // Handle case when the array is empty
      return (
        <TableRow>
          <TableCell>Loading...</TableCell>
        </TableRow>
      )
    } else {
      werehouseEntities.map((entity) => (
        <TableRow key={entity._id}>
          <TableCell>{entity.food?.name}</TableCell>
          <TableCell>{entity.quantita}</TableCell>
          <TableCell>{entity.location?.name || "N/A"}</TableCell>
          <TableCell>{entity.warehouse?.name || "N/A"}</TableCell>
          <TableCell className={getExpirationColor(entity.scadenza)}>
            {new Date(entity.scadenza).getDate() <= new Date().getDate() &&
              "Scaduto (" +
                new Date(entity.scadenza).toLocaleDateString() +
                ")"}
            {new Date(entity.scadenza).getDate() > new Date().getDate() &&
              new Date(entity.scadenza).toLocaleDateString()}
          </TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleEdit(entity)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleDelete(entity._id)}
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
        <h1 className="text-3xl font-bold">Warehouse Entity Management</h1>
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingId(null)
                setModalVisible(true)
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Warehouse Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Warehouse Entity" : "Add Warehouse Entity"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="food">Food</Label>
                <Select
                  value={form.foodId}
                  onValueChange={(value) => setForm({ ...form, foodId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select food" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(werehouseEntities) &&
                      werehouseEntities.length > 0 &&
                      foods.map((food) => (
                        <SelectItem key={food._id} value={food._id}>
                          {food.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={form.locationId}
                  onValueChange={(value) =>
                    setForm({ ...form, locationId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(werehouseEntities) &&
                      werehouseEntities.length > 0 &&
                      locations.map((location) => (
                        <SelectItem key={location._id} value={location._id}>
                          {location.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select
                  value={form.warehouseId}
                  onValueChange={(value) =>
                    setForm({ ...form, warehouseId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(werehouseEntities) &&
                      werehouseEntities.length > 0 &&
                      warehouses.map((warehouse) => (
                        <SelectItem key={warehouse._id} value={warehouse._id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantita">Quantity</Label>
                <Input
                  id="quantita"
                  type="number"
                  value={form.quantita}
                  onChange={(e) =>
                    setForm({ ...form, quantita: +e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="scadenza">Expiration Date</Label>
                <Input
                  id="scadenza"
                  type="date"
                  value={form.scadenza}
                  onChange={(e) =>
                    setForm({ ...form, scadenza: e.target.value })
                  }
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
              <TableHead>Food</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{generate()}</TableBody>
        </Table>
      </div>
    </div>
  )
}

export default WerehouseEntities
