"use client"
import React, { useState, useEffect } from "react"
import { axiosInstance as api } from "@/services/axios" // Update with your axios instance
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert" // Optional: Use an alert for success messages

interface UserProfile {
  _id: string
  name: string
  surname: string
  email: string
  isConfimer: boolean
  password: string // Consider removing or masking this in a real application
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

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get<UserProfile>("/users/me") // Adjust your API endpoint
      setUserProfile(response.data)
      setForm(response.data) // Set form state to current user data
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
        await api.put(`/users/me`, form) // Update user profile
        setUserProfile(form) // Update local state with new data
        setIsEditing(false) // Stop editing mode
        setSuccessMessage("Profile updated successfully!")
        setTimeout(() => setSuccessMessage(undefined), 3000) // Clear message after 3 seconds
      } catch (error) {
        console.error("Failed to update profile:", error)
      }
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-center">Profile</h1>
        {successMessage && (
          <Alert variant="success" className="mb-4">
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
