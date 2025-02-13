'use client';

import React, { useState, useEffect } from 'react';
import { axiosInstance as api } from '@/services/axios/index';
import { Button } from '@/components/ui/button';
import { AlertCircle, Pencil, PlusCircle, Trash } from 'lucide-react';
import Form from '@/components/Generator/form';
import { TagProps } from '@/components/Generator/tags';
import Modal from '@/components/Generator/modal';

interface FormData {
  name: string;
}

const Foods: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form, setForm] = useState<FormData>({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const name = 'Food';
  const url = '/foods';

  // Configurazione dei campi per il modulo dinamico
  const formFields: TagProps[] = [
    {
      title: name + ' Management',
      url: url,
      structures: [
        {
          type: 'table',
          collaps: 'label', // Colonna su cui effettuare il raggruppamento
          useApiResult: true,
          default: [
            {
              type: 'button',
              label: 'Actions',
              icon: <Pencil className="h-4 w-4" />,
              variant: 'outline',
              size: 'icon',
              handleEvent: (e: any) => {
                const values: string[] = [];
                const id = e.currentTarget.id.split('-')[2]; //take the id

                //take all the row element
                const nodeListReference =
                  e.currentTarget.parentElement.parentElement.parentElement
                    .childNodes;

                nodeListReference.forEach(function (currentValue: any) {
                  values.push(currentValue.innerHTML);
                });
                values.pop();

                setEditingId(id); // Setta l'ID in modifica
                setForm({ name: values[0] }); // Imposta i dati dell'elemento da modificare
                setModalVisible(true); // Mostra il dialog per l'editing
              },
            },
            {
              type: 'button',
              label: 'Actions',
              icon: <Trash className="h-4 w-4" />,
              variant: 'destructive',
              size: 'icon',
              handleEvent: async (e: any) => {
                const id = e.currentTarget.id.split('-')[2];
                try {
                  await api.delete(`${url}/${id}`);
                } catch (error) {
                  console.error("Errore durante l'eliminazione:", error);
                }
              },
            },
          ],
        },
        {
          type: 'dialog',
          collaps: 'label', // Colonna su cui effettuare il raggruppamento
          default: [
            {
              type: 'input',
              dataType: 'text',
              label: 'Name',
              class: 'block w-full border rounded-md px-3 py-2',
            },
          ],
        },
      ],
      tagsInfo: [
        {
          type: 'input',
          label: 'Name',
          dataType: 'text',
          placeholder: `Enter ${name} name`,
          handleEvent: (e: any) => {
            console.log(e.value);
          },
        },
      ],
    },
  ];

  // Funzione per salvare/modificare un alimento
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      setModalVisible(false);
      if (editingId) {
        await api.put(`${url}/${editingId}`, form); // Modifica l'elemento esistente
      } else {
        await api.post(url, form); // Crea un nuovo elemento
      }
      setForm({ name: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Bottone per aggiungere un nuovo alimento */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{name} Management</h1>
        <Button
          onClick={() => {
            setForm({ name: '' });
            setEditingId(null);
            setModalVisible(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add {name}
        </Button>
      </div>

      {/* Modulo dinamico */}
      <Form fields={formFields} />

      {/* Dialog per aggiungere/modificare un alimento */}
      <Modal
        formField={formFields}
        isVisible={modalVisible}
        title={editingId ? `Edit ${name}` : `Add ${name}`}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
      />
    </div>
  );
};

export default Foods;
