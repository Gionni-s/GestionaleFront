import { axiosInstance } from "@/services/axios"

export const Auth = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  console.log("asd")
  try {
    console.log("start comunication...")
    const { data } = await axiosInstance.get("/user" + email + ":" + password)
    return data
  } catch (error) {
    console.error("Error retrieving data:", error)
    throw new Error("Could not get data")
  }
}

export const Register = async ({
  email,
  password,
  name,
  surname,
  phone,
}: {
  email: string
  password: string
  name: string
  surname: string
  phone: number
}) => {
  try {
    console.log("start comunication...")
    const response = await axiosInstance.post("/user", {
      email,
      password,
      name,
      surname,
      phone,
    })
    return response.data
  } catch (error) {
    console.error("Error retrieving data:", error)
    throw new Error("Could not get data")
  }
}
