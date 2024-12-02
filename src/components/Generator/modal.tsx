import React, { memo, useMemo, useCallback } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { TagInfoType, TagProps } from "./tags"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

// Comprehensive type definitions

interface ModalProps {
  formField: TagProps[]
  isVisible: boolean
  title: string
  onClose: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  form: Record<string, any>
  setForm: React.Dispatch<React.SetStateAction<any>>
}

const Modal: React.FC<ModalProps> = memo(
  ({ isVisible, formField, title, onClose, onSubmit, form, setForm }) => {
    // Early return if not visible
    if (!isVisible) return null

    // Memoized tag creation function
    const createTag = (tag: TagInfoType, index: number | string) => {
      const supportedTypes = ["text", "number", "date", "email"]

      try {
        switch (tag.type?.toLowerCase()) {
          case "input":
            const dataType = tag.dataType?.toLowerCase() || "text"

            if (supportedTypes.includes(dataType)) {
              return (
                <Input
                  key={`input-${index}`}
                  id={`input-${index}`}
                  type={dataType as React.HTMLInputTypeAttribute}
                  placeholder={tag.placeholder || ""}
                  value={form[tag.label.toLowerCase()] || ""}
                  onChange={(e) =>
                    setForm((prev: any) => ({
                      ...prev,
                      [tag.label.toLowerCase()]: e.target.value,
                    }))
                  }
                  className={tag.class || "w-full"}
                  required
                />
              )
            }
            console.warn(`Unsupported input dataType: ${dataType}`)
            return null

          case "button":
            return (
              <Button
                key={`button-${index}`}
                type="button"
                size={tag.size || "default"}
                variant={tag.variant || "default"}
                onClick={tag.handleEvent}
                className={tag.class || ""}
              >
                {tag.icon || tag.value || tag.label}
              </Button>
            )

          default:
            console.warn(`Unsupported tag type: ${tag.type}`)
            return null
        }
      } catch (error) {
        console.error("Error creating tag:", error)
        return null
      }
    }

    // Memoized dialog fields generation
    const dialogFields = () => {
      try {
        return formField.flatMap((formItem) =>
          formItem.structures
            .filter((structure) => structure.type === "dialog")
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
        )
      } catch (error) {
        console.error("Error generating dialog fields:", error)
        return []
      }
    }

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
                {title.includes("Edit") ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

Modal.displayName = "Modal"

export default Modal
