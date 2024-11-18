"use client"
import React, { useState, useEffect } from "react"
import { axiosInstance as api } from "@/services/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { logout } from "@/services/store/auth" // Added logout import
import { LogOut } from "lucide-react" // Added for logout icon
import { store } from "@/services/store"
import { useRouter } from "next/navigation"

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
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>()
  const [form, setForm] = useState<UserProfile>()
  const [loading, setLoading] = useState<boolean>(true)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>()
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get<UserProfile>("/users/me")
      setUserProfile(response.data)
      setForm(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      setLoading(false)
    }
  }

  const handleFieldChange = (
    field: keyof UserProfile,
    value: string | number | boolean
  ) => {
    if (form) {
      setForm({ ...form, [field]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (form) {
      try {
        await api.put(`/users/me`, form)
        setUserProfile(form)
        setIsEditing(false)
        setSuccessMessage("Profile updated successfully!")
        setTimeout(() => setSuccessMessage(undefined), 3000)
      } catch (error) {
        console.error("Failed to update profile:", error)
      }
    }
  }

  const handleLogout = async () => {
    try {
      store.dispatch(logout())
      router.replace("/Auth")
      router.refresh()
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <div className="relative">
        <div className="absolute right-0 top-0">
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">Profile</h1>
        {successMessage && (
          <Alert variant="default" className="mb-4">
            {successMessage}
          </Alert>
        )}
        {userProfile && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form?.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                required
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                value={form?.surname}
                onChange={(e) => handleFieldChange("surname", e.target.value)}
                required
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form?.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                required
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="number"
                value={form?.phoneNumber}
                onChange={(e) =>
                  handleFieldChange("phoneNumber", Number(e.target.value))
                }
                required
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div className="flex justify-between mt-4">
              <Button type="submit" disabled={!isEditing}>
                Update Profile
              </Button>
              <Button type="button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
