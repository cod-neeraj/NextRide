// api/instances.ts
import { createApi } from "./apiClient";

export const userApi = createApi({
  baseURL: "http://localhost:2021/api" 
});


export const driverApi = createApi({
  baseURL: "http://localhost:2022/api"
});


export const rideApi = createApi({
  baseURL: "http://localhost:2023/api"
});

export const paymentApi = createApi({
  baseURL: "http://localhost:2023/api"
});