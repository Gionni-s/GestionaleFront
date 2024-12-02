export interface FormType {
  visualName?: string[] // Labels for fields
  name: string // Field name (key for formData)
  url: string // API endpoint
  fieldType: string[] // Array of field types (e.g., input-text, button-submit)
  placeholder?: string[] // Optional placeholders
  table?: boolean // Flag for table rendering
  body?: boolean // Include body in table rendering
  dialog?: boolean // Dialog rendering
}
