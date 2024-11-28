import { FormField } from "./form"
import Tag from "./tags"

/*
<div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">Food Management</h1>
  <Dialog open={modalVisible} onOpenChange={setModalVisible}>
    <DialogTrigger asChild>
      <Button
        onClick={() => {
          setForm({ name: "" })
          setEditingId(null)
        }}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Food
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editingId ? "Edit Food" : "Add Food"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <Button type="submit">{editingId ? "Update" : "Create"}</Button>
      </form>
    </DialogContent>
  </Dialog>
</div>
*/

const Dialog = (props: { fields: FormField[] }) => {}

export default Dialog
