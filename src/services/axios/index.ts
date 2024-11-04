import { baseUrl } from "@/app/config"
import axios from "axios"
import { store } from "../store" // Adjust path to your Redux store

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    ContentType: "application/json",
  },
})

// Add a request interceptor to dynamically add the token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState() // Access the store state directly
    const token = state.token.value // Assuming `value` holds the token in your Redux store
    if (token) {
      config.headers.Authorization = "Barear " + token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export { axiosInstance }
