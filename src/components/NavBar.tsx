import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"
import Link from "next/link"
import { store } from "../services/store"

export function NavBar() {
  const state = store.getState() // Access the store state directly
  const token = state.auth.token
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          {token && <Link href={"/Profile"}>Profile</Link>}
          {!token && <Link href={"/Auth"}>Login</Link>}
        </MenubarTrigger>
      </MenubarMenu>
      {token && (
        <>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href={"/Food"}>Food</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href={"/Location"}>Location</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href={"/CookBook"}>Recipe Book</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href={"/Recipe"}>Recipe</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href={"/werehouse"}>Werehouse</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link href={"/werehouseEntities"}>Werehouse Entities</Link>
            </MenubarTrigger>
          </MenubarMenu>
        </>
      )}
    </Menubar>
  )
}
