import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { axiosInstance as api } from "@/services/axios"
import Link from "next/link"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"

interface UserProfile {
  _id: string
  name: string
  surname: string
  email: string
  isConfimer: boolean
  password: string
  phoneNumber: number
  dateCreation: Date
  lastLogin: Date
  profileImage?: string
}

export function NavBar() {
  const { token } = useSelector((state: any) => state.auth)
  const [userProfile, setUserProfile] = useState<UserProfile>()

  const menuItems = [
    { href: "/Food", label: "Food" },
    { href: "/Location", label: "Location" },
    { href: "/CookBook", label: "Recipe Book" },
    { href: "/Recipe", label: "Recipe" },
    { href: "/werehouse", label: "Warehouse" },
    { href: "/werehouseEntities", label: "Warehouse Entities" },
  ]

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      if (token) {
        const response = (await api.get<UserProfile>("/users/me")).data
        console.log("Fetched user profile:", response)
        setUserProfile(response)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  return (
    <Menubar className="flex justify-between items-center p-2 bg-gray-100">
      {token && (
        <div className="flex items-center">
          {menuItems.map((item) => (
            <MenubarMenu key={item.href}>
              <MenubarTrigger>
                <Link
                  href={item.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              </MenubarTrigger>
            </MenubarMenu>
          ))}
        </div>
      )}

      <div className="flex items-center">
        {token ? (
          <Link href="/Profile">
            <Avatar className="w-8 h-8 cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-colors">
              <AvatarImage src={userProfile?.profileImage} alt="Profile" />
              <AvatarFallback>
                {userProfile?.name?.[0]}
                {userProfile?.surname?.[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <MenubarMenu>
            <MenubarTrigger>
              <Link
                href="/Auth"
                className="hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
            </MenubarTrigger>
          </MenubarMenu>
        )}
      </div>
    </Menubar>
  )
}
