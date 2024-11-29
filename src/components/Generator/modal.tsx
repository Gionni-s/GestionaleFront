import { Button } from "../ui/button"

interface FormData {
  name: string
}

const Modal: React.FC<{
  isVisible: boolean
  title: string
  onClose: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
}> = ({ isVisible, title, onClose, onSubmit, form, setForm }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
          {title}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 focus:outline-none"
            aria-label="Close"
          >
            &#x2715;
          </button>
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
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
              {title.includes("Edit") ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Modal
