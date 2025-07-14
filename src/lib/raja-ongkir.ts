import { env } from "@/env/server";
import axios from "axios";

const BASE_URL = "https://api.rajaongkir.com/starter";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    key: env.RAJAONGKIR_API_KEY,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

export const getProvinces = async () => {
  const response = await api.get("/province");
  return response.data.rajaongkir.results;
};

export const getCities = async (provinceId: string) => {
  const response = await api.get("/city", { params: { province: provinceId } });
  return response.data.rajaongkir.results;
};

export const getShippingCost = async (
  origin: string,
  destination: string,
  weight: number,
  courier: string,
) => {
  const response = await api.post("/cost", {
    origin,
    destination,
    weight,
    courier,
  });

  return response.data.rajaongkir.results;
};
