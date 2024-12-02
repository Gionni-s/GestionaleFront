import { useEffect, useState } from "react"
import { axiosInstance as api } from "@/services/axios/index"
import Tag, { TagProps } from "./tags"

export interface Entity {
  _id: string
  name: string
  [key: string]: any
}

const Form = ({ fields }: { fields: TagProps[] }) => {
  const [formFields, setFields] = useState<TagProps[]>(fields)

  // Fetch data for a specific field
  const fetchData = async (url: string): Promise<Entity[]> => {
    try {
      const response = await api.get(url)
      return response.data || []
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error)
      return []
    }
  }

  useEffect(() => {
    const loadData = async () => {
      const updatedFields = await Promise.all(
        formFields.map(async (field) => {
          if (field.url) {
            const fetchedData = await fetchData(field.url)
            return { ...field, apiResult: fetchedData }
          }
          return field
        })
      )
      setFields(updatedFields)
    }

    loadData()
  }, [fields])

  return (
    <div className="space-y-4">
      {formFields.map((field, index) => {
        return (
          <Tag
            key={index}
            url={field.url}
            structures={field.structures}
            tagsInfo={field.tagsInfo}
            title={field.title}
            apiResult={field.apiResult}
          />
        )
      })}
    </div>
  )
}

export default Form
