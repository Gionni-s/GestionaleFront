import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TagInfoType, TagProps } from './tags';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import axios from '@/services/axios/index';

interface ModalProps {
  formField: TagProps[];
  isVisible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  form: Record<string, any>;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const groupByLabel = (tags: TagInfoType[]) =>
  tags.reduce((acc, tag) => {
    const label = typeof tag.label === 'string' ? tag.label : 'default';
    if (!acc[label]) acc[label] = [];
    acc[label].push(tag);
    return acc;
  }, {} as Record<string, TagInfoType[]>);

const Modal: React.FC<ModalProps> = memo(
  ({ isVisible, formField, title, onClose, onSubmit, form, setForm }) => {
    const [apiResult, setApiResult] = useState<any[]>([]);

    const fetchResult = async () => {
      try {
        // Estrarre le URL dai formField
        const urls = formField.flatMap(({ structures }) =>
          structures
            .filter((structure) => structure.type === 'dialog')
            .flatMap(
              ({ default: fields }) =>
                fields?.filter((field) => field.url).map(({ url }) => url) || []
            )
        );

        // Eseguire tutte le richieste in parallelo
        const responses = await Promise.all(
          urls.map(async (url: any) => {
            try {
              const response = await axios.get(url);
              return { [url]: response.data };
            } catch (error) {
              console.error(`Error fetching data from ${url}:`, error);
              return { [url]: null }; // In caso di errore, restituire un valore nullo per questa URL
            }
          })
        );

        // Aggiornare lo stato con i risultati
        setApiResult(responses);
      } catch (error) {
        console.error('Error in fetchResult:', error);
      }
    };

    useEffect(() => {
      fetchResult();
    }, []);

    if (!isVisible) return null;

    // Memoized tag creation function
    const createTag = (tag: TagInfoType, index: number | string) => {
      const supportedTypes = ['text', 'number', 'date', 'email'];

      try {
        switch (tag.type?.toLowerCase()) {
          case 'input':
            const dataType = tag.dataType?.toLowerCase() || 'text';

            if (supportedTypes.includes(dataType)) {
              return (
                <Input
                  key={`input-${index}`}
                  id={`input-${index}`}
                  type={dataType as React.HTMLInputTypeAttribute}
                  placeholder={tag.placeholder || ''}
                  value={form[tag.label.toLowerCase()] || ''}
                  onChange={(e) =>
                    setForm((prev: any) => ({
                      ...prev,
                      [tag.label.toLowerCase()]: e.target.value,
                    }))
                  }
                  className={tag.class || 'w-full'}
                  required
                />
              );
            }
            console.warn(`Unsupported input dataType: ${dataType}`);
            return null;

          case 'select':
            const requestKey =
              tag.key?.indexOf('.') == -1
                ? form[tag.key.split('.')[0]][tag.key.split('.')[1]]
                : form[tag.key || tag.label];
            return (
              <select
                id="cookbook"
                value={requestKey}
                onChange={tag.handleEvent}
                className="border p-2 rounded w-full"
                required
              >
                <option value={tag.placeholder}>{tag.placeholder}</option>
                {apiResult
                  .filter((val) => {
                    const key = Object.keys(val);
                    if (key[0] == tag.url) return val[key[0]];
                  })
                  .map((val) => {
                    // console.log(val)
                    const key = Object.keys(val);
                    return val[key[0]];
                  })
                  .map((val, index) => {
                    // console.log({ val, index })
                    return val.map((element: any, secondIndex: number) => {
                      // console.log(element)
                      return (
                        <option value={element._id} key={index + secondIndex}>
                          {element.name}
                        </option>
                      );
                    });
                  })}
              </select>
            );
          case 'button':
            return (
              <Button
                key={`button-${index}`}
                type="button"
                size={tag.size || 'default'}
                variant={tag.variant || 'default'}
                onClick={tag.handleEvent}
                className={tag.class || ''}
              >
                {tag.icon || tag.value || tag.label}
              </Button>
            );

          default:
            console.warn(`Unsupported tag type: ${tag.type}`);
            return null;
        }
      } catch (error) {
        console.error('Error creating tag:', error);
        return null;
      }
    };

    // Memoized dialog fields generation
    const dialogFields = () => {
      try {
        return formField.flatMap((formItem) =>
          formItem.structures
            .filter((structure) => structure.type === 'dialog')
            .flatMap(
              (structure) =>
                structure.default?.map((field, index) => (
                  <div key={`dialog-field-${index}`} className="mb-4">
                    {field.label && (
                      <Label htmlFor={`input-${index}`} className="block mb-2">
                        {field.label}
                      </Label>
                    )}
                    {createTag(field, index)}
                  </div>
                )) || []
            )
        );
      } catch (error) {
        console.error('Error generating dialog fields:', error);
        return [];
      }
    };

    return (
      <Dialog open={isVisible} onOpenChange={onClose}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {dialogFields()}
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={Object.keys(form).length === 0}
              >
                {title.includes('Edit') ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
