import React, { useState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  TableBody,
} from "../ui/table"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

interface TagInfoType {
  type: string
  label: string | boolean | string[]
  dataType?: string
  class?: string
  placeholder?: string
  icon?: React.ReactNode
  value?: string
  handleEvent?: (event: React.SyntheticEvent) => void
}

interface StructureType {
  type: "table" | "dialog" | "default"
  useApiResult?: boolean
  collaps?: string
  default?: TagInfoType[]
}

export interface TagProps {
  title?: string
  url?: string
  apiResult?: any[]
  structures?: StructureType[]
  tagsInfo: TagInfoType[]
}

const Tag: React.FC<TagProps> = ({
  tagsInfo,
  structures,
  url,
  title,
  apiResult,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  // Helper function to create tags (input, button, etc.)
  const createTag = (tag: TagInfoType, index: any) => {
    switch (tag.type?.toLowerCase()) {
      case "input":
        switch (tag.dataType?.toLowerCase()) {
          case "text":
          case "number":
          case "date":
          case "email":
            return (
              <Input
                key={index}
                id={index}
                type={tag.dataType}
                placeholder={tag.placeholder}
                value={tag.value}
                onChange={tag.handleEvent}
                className={tag.class || ""}
              />
            )
          default:
            console.warn(`Unsupported dataType: ${tag.dataType}`)
            return null
        }

      case "button":
        return (
          <Button
            key={index}
            id={index}
            onClick={tag.handleEvent}
            className={tag.class || ""}
          >
            {tag.icon ? tag.icon : tag.label ? tag.label : "Click"}
          </Button>
        )

      default:
        console.warn(`Unsupported tag type: ${tag.type}`)
        return null
    }
  }

  // Grouping the tagInfo by labels
  const groupByLabel = (tags: TagInfoType[]) => {
    return tags.reduce((acc, tag) => {
      const label = typeof tag.label === "string" ? tag.label : "default"
      if (!acc[label]) {
        acc[label] = []
      }
      acc[label].push(tag)
      return acc
    }, {} as Record<string, TagInfoType[]>)
  }

  // Render nothing if no structures
  if (!structures || structures.length === 0) {
    return null
  }

  return (
    <>
      {structures.map((structure, structureIndex) => {
        // If structure is a table, we add default tags to the group
        const tagInsert =
          structure?.type === "table" && structure.default
            ? [...tagsInfo, ...structure.default]
            : tagsInfo

        // Group tags by label
        const groupedTags = groupByLabel(tagInsert)

        // Render table structure
        if (structure?.type === "table") {
          return (
            <div
              className="border rounded-lg overflow-hidden"
              key={structureIndex}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {structure?.collaps
                      ? Object.keys(groupedTags).map((val, index) => (
                          <TableHead key={index}>{val}</TableHead>
                        ))
                      : tagInsert.map((tag, index) => (
                          <TableHead key={index}>
                            {typeof tag.label === "string"
                              ? tag.label
                              : "Column"}
                          </TableHead>
                        ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structure?.collaps
                    ? structure?.useApiResult
                      ? Object.keys(groupedTags).map((key, index) => {
                          const lowercaseKey = key.toLowerCase()

                          if (!apiResult) {
                            return (
                              <TableRow key={`error-${index}`}>
                                <TableCell>Loading...</TableCell>
                              </TableRow>
                            )
                          }

                          return apiResult
                            .filter((item) => item[lowercaseKey])
                            .map((item, rowIndex) => {
                              const exCell: any =
                                structure.default?.map((struct) => {
                                  const id = `tag-${rowIndex}-${
                                    item._id
                                  }-${Math.random()}`
                                  return createTag(struct, id)
                                }) || []

                              return (
                                <TableRow key={`row-${rowIndex}`}>
                                  {/* Display only the value */}
                                  <TableCell>{item[lowercaseKey]}</TableCell>
                                  {structure?.collaps && (
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        {exCell}
                                      </div>
                                    </TableCell>
                                  )}
                                </TableRow>
                              )
                            })
                        })
                      : Object.keys(groupedTags).map((val, index) => (
                          <TableRow key={val}>
                            <TableCell>
                              {groupedTags[val].map((i, idx) =>
                                createTag(i, idx)
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    : structure?.useApiResult
                    ? apiResult?.map((item, index) => (
                        <TableRow key={index}>
                          {/* Only render values from apiResult */}
                          {Object.keys(item).map((key, tagIndex) => (
                            <TableCell key={tagIndex}>{item[key]}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    : [
                        <TableRow key="default">
                          {/* Only render default inputs if useApiResult is false */}
                          {tagInsert.map((tag, index) => (
                            <TableCell key={index}>
                              {createTag(tag, index)}
                            </TableCell>
                          ))}
                        </TableRow>,
                      ]}
                </TableBody>
              </Table>
            </div>
          )
        }

        // if (structure?.type === "dialog") {
        //   return (
        //     <div
        //       key={structureIndex}
        //       className="flex justify-between items-center mb-6"
        //     >
        //       {title && <h1 className="text-3xl font-bold">{title}</h1>}
        //       <Dialog open={modalVisible} onOpenChange={setModalVisible}>
        //         <DialogTrigger asChild>
        //           <Button
        //             onClick={() => {
        //               setForm({})
        //               setEditingId(null)
        //             }}
        //           >
        //             {/* <PlusCircle className="mr-2 h-4 w-4" /> */}
        //             Add {title || "Item"}
        //           </Button>
        //         </DialogTrigger>
        //         <DialogContent>
        //           <DialogHeader>
        //             <DialogTitle>
        //               {editingId
        //                 ? `Edit ${structure.dialogTitle || "Item"}`
        //                 : `Add ${structure.dialogTitle || "Item"}`}
        //             </DialogTitle>
        //           </DialogHeader>
        //           <form
        //             onSubmit={(e) => {
        //               e.preventDefault()
        //               structure.formSubmit?.(e)
        //               setModalVisible(false)
        //             }}
        //             className="space-y-4"
        //           >
        //             {tagInsert.map((tag, index) => (
        //               <div key={index}>
        //                 {typeof tag.label === "string" && (
        //                   <Label htmlFor={tag.label}>{tag.label}</Label>
        //                 )}
        //                 {createTag(tag, index)}
        //               </div>
        //             ))}
        //             <Button type="submit">
        //               {editingId ? "Update" : "Create"}
        //             </Button>
        //           </form>
        //         </DialogContent>
        //       </Dialog>
        //     </div>
        //   )
        // }

        return null
      })}
    </>
  )

  // // Render for not structure
  // return (
  //   <div className="border rounded-lg overflow-hidden">
  //     {Object.entries(groupedTags).map(([label, tags], index) => (
  //       <div key={index} className="tag-wrapper">
  //         {/* Render a label only if it's a string */}
  //         {label !== "default" && <Label>{label}</Label>}
  //         <div className="tags">
  //           {tags.map((tag, idx) => (
  //             <div key={idx}>{createTag(tag, idx)}</div>
  //           ))}
  //         </div>
  //       </div>
  //     ))}
  //   </div>
  // )
}

export default Tag
