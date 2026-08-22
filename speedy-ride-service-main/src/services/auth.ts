import { userApi } from "./instances"; // wherever you created your axios instance from createApi()

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  role: string;
}

export async function checkAuth(): Promise<User | null> {
  try {
    const res = await userApi.get("/users/me");
    return res.data.data; 
  } catch (error) {
    return null;
  }
}