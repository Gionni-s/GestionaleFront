"use client"
import React, { useState } from "react"
import { axiosInstance as api } from "@/services/axios/index"
import { Button } from "@/components/ui/button"
import { Pencil, PlusCircle, Trash } from "lucide-react"
import Form from "@/components/Generator/form"
import { TagProps } from "@/components/Generator/tags"

interface FormData {
  name: string
}

const Foods: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [form, setForm] = useState<FormData>({ name: "" })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Configurazione dei campi per il modulo dinamico
  const formFields: TagProps[] = [
    {
      title: "Foods Management",
      url: "/foods",
      structures: [
        {
          type: "table",
          collaps: "label", // Colonna su cui effettuare il raggruppamento
          useApiResult: true,
          default: [
            {
              type: "button",
              label: "Actions",
              icon: <Pencil className="h-4 w-4" />,
              handleEvent: (e: any) => {
                setEditingId(e.value) // Setta l'ID in modifica
                setForm({ name: e.name }) // Imposta i dati dell'elemento da modificare
                setModalVisible(true) // Mostra il dialog per l'editing
              },
            },
            {
              type: "button",
              label: "Actions",
              icon: <Trash className="h-4 w-4" />,
              handleEvent: async (e: any) => {
                try {
                  console.log(e)
                  // await api.delete(`/foods/${e.value}`)
                  // console.log("Elemento eliminato:", e.value)
                  // Aggiorna i dati
                } catch (error) {
                  console.error("Errore durante l'eliminazione:", error)
                }
              },
            },
          ],
        },
      ],
      tagsInfo: [
        {
          type: "input",
          label: "Name",
          dataType: "text",
          placeholder: "Enter food name",
          handleEvent: (e: any) => {
            console.log(e.value)
          },
        },
      ],
    },
  ]

  // Funzione per salvare/modificare un alimento
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/foods/${editingId}`, form) // Modifica l'elemento esistente
      } else {
        await api.post("/foods", form) // Crea un nuovo elemento
      }
      setModalVisible(false)
      setForm({ name: "" })
      setEditingId(null)
    } catch (error) {
      console.error("Errore durante il salvataggio:", error)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Bottone per aggiungere un nuovo alimento */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Foods Management</h1>
        <Button
          onClick={() => {
            setForm({ name: "" })
            setEditingId(null)
            setModalVisible(true)
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Food
        </Button>
      </div>

      {/* Modulo dinamico */}
      <Form fields={formFields} />

      {/* Dialog per aggiungere/modificare un alimento */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              {editingId ? "Edit Food" : "Add Food"}

              <button
                onClick={() => {
                  setForm({ name: "" })
                  setEditingId(null)
                  setModalVisible(false)
                }}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
                aria-label="Close"
              >
                &#x2715; {/* Unicode per "X" */}
              </button>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="block w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Foods
