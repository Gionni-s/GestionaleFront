"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { axiosInstance } from "@/services/axios"
import { loginSuccess } from "@/services/store/auth"
import { store } from "@/services/store"
import { useNavigate } from "react-router-dom"

export function AuthCard() {
  const navigate = useNavigate()
  const [isRegistration, setRegistration] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [phone, setPhone] = useState("")

  const handleLogin = async () => {
    try {
      const token = `${email}:${password}`
      const encodedToken = Buffer.from(token).toString("base64")
      const response = await axiosInstance.get("/users", {
        headers: { Authorization: `Basic ${encodedToken}` },
      })
      store.dispatch(loginSuccess(response.data))
      // navigate("/Profile", { replace: true })
      // navigate(0)
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  const handleRegistration = async () => {
    try {
      const response = await axiosInstance.post("/users", {
        name,
        surname,
        phone,
        psw: password,
        mail: email,
      })
      console.log(response.data)

      // Perform login after successful registration
      const token = `${email}:${password}`
      const encodedToken = Buffer.from(token).toString("base64")
      const loginResponse = await axiosInstance.get("/users", {
        headers: { Authorization: `Basic ${encodedToken}` },
      })
      store.dispatch(loginSuccess(loginResponse.data))

      // navigate("/Profile", { replace: true })
      // navigate(0)
    } catch (error) {
      console.error("Registration error:", error)
    }
  }

  const handleSubmit = () => {
    if (isRegistration) {
      handleRegistration()
    } else {
      handleLogin()
    }
  }

  const clearFields = () => {
    setEmail("")
    setPassword("")
    setName("")
    setSurname("")
    setPhone("")
  }

  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardHeader>
        <CardTitle>{isRegistration ? "Registrati" : "Login"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="example@example.com"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
            />
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="············"
              maxLength={20}
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          {isRegistration && (
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                placeholder="Username"
                value={name}
                onChange={({ target }) => setName(target.value)}
              />
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                placeholder="Surname"
                value={surname}
                onChange={({ target }) => setSurname(target.value)}
              />
              <Label htmlFor="phone">Phone number</Label>
              <Input
                type="tel"
                id="phone"
                placeholder="123456789"
                value={phone}
                onChange={({ target }) => setPhone(target.value)}
              />
            </div>
          )}
          <Button onClick={() => setRegistration(!isRegistration)}>
            {isRegistration
              ? "Sei già registrato? Fai l'accesso"
              : "Non hai un account? Registrati"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={clearFields}>
          Annulla
        </Button>
        <Button onClick={handleSubmit}>
          {isRegistration ? "Registrati" : "Login"}
        </Button>
      </CardFooter>
    </Card>
  )
}
