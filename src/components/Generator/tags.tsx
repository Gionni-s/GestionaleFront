import React from "react"
import { Input } from "../ui/input"
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  TableBody,
} from "../ui/table"
import { Button } from "../ui/button"
import { removeDuplicate } from "./utils"

interface TagInfoType {
  type: string
  label: string | boolean | string[]
  dataType?: string
  class?: string
  placeholder?: string
  variant?:
    | "default"
    | "link"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined
  size?: "default" | "sm" | "lg" | "icon" | null | undefined
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

// Helper function to group tags by label
const groupByLabel = (tags: TagInfoType[]) =>
  tags.reduce((acc, tag) => {
    const label = typeof tag.label === "string" ? tag.label : "default"
    if (!acc[label]) acc[label] = []
    acc[label].push(tag)
    return acc
  }, {} as Record<string, TagInfoType[]>)

// Helper function to create tag elements
const createTag = (tag: TagInfoType, index: number | string) => {
  switch (tag.type?.toLowerCase()) {
    case "input":
      if (
        ["text", "number", "date", "email"].includes(
          tag.dataType?.toLowerCase() || ""
        )
      ) {
        return (
          <Input
            key={index}
            id={index.toString()}
            type={tag.dataType}
            placeholder={tag.placeholder}
            value={tag.value}
            onChange={tag.handleEvent}
            className={tag.class || ""}
          />
        )
      }
      console.warn(`Unsupported dataType: ${tag.dataType}`)
      return null

    case "button":
      return (
        <Button
          key={index}
          id={index.toString()}
          size={tag?.size || "default"}
          variant={tag?.variant || "default"}
          onClick={tag.handleEvent}
          className={tag.class || ""}
        >
          {tag.icon || tag.label || "Click"}
        </Button>
      )

    default:
      console.warn(`Unsupported tag type: ${tag.type}`)
      return null
  }
}

const Tag: React.FC<TagProps> = ({
  tagsInfo,
  structures = [],
  apiResult = [],
}) => {
  // If no structures provided, return null
  if (!structures.length) return null

  return (
    <>
      {structures.map((structure, structureIndex) => {
        // Prepare tags based on structure type
        const tagInsert =
          structure.type === "table" && structure.default
            ? [...tagsInfo, ...structure.default]
            : tagsInfo

        // Group tags by label
        const groupedTags = groupByLabel(tagInsert)

        // Handle table structure
        if (structure.type === "table") {
          const structLabels = removeDuplicate(
            structure.default?.map((struct) => struct.label) || []
          ).map((label) =>
            typeof label === "string" ? label.toLowerCase() : ""
          )

          return (
            <div
              className="border rounded-lg overflow-hidden"
              key={structureIndex}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {structure.collaps
                      ? Object.keys(groupedTags).map((label, index) => (
                          <TableHead
                            key={index}
                            className={
                              structLabels.includes(label.toLowerCase())
                                ? "w-[150px]"
                                : ""
                            }
                          >
                            {label}
                          </TableHead>
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
                  {structure.collaps
                    ? structure.useApiResult
                      ? apiResult.map((item, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {Object.keys(groupedTags).map((key) => {
                              const lowerKey = key.toLowerCase()
                              return item[lowerKey] ? (
                                <TableCell key={rowIndex + lowerKey}>
                                  {item[lowerKey]}
                                </TableCell>
                              ) : structLabels.includes(lowerKey) ? (
                                <TableCell key={rowIndex}>
                                  <div className="flex space-x-2">
                                    {structure.default?.map((struct) => {
                                      const id = `tag-${rowIndex}-${
                                        item._id
                                      }-${Math.random()}`
                                      return createTag(struct, id)
                                    })}
                                  </div>
                                </TableCell>
                              ) : (
                                <TableCell key={rowIndex}>N/A</TableCell>
                              )
                            })}
                          </TableRow>
                        ))
                      : Object.keys(groupedTags).map((label, index) => (
                          <TableRow key={label}>
                            <TableCell>
                              {groupedTags[label].map((tag, idx) =>
                                createTag(tag, idx)
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    : structure.useApiResult
                    ? apiResult.map((item, index) => (
                        <TableRow key={index}>
                          {Object.keys(item).map((key, tagIndex) => (
                            <TableCell key={tagIndex}>{item[key]}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    : [
                        <TableRow key="default">
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

        return null // Placeholder for other structure types
      })}
    </>
  )
}

export default Tag
