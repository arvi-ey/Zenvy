import api from "@/api/api";

export type AddressType = "home" | "office" | "others";

export interface Address {
  id: number;
  street: string;
  landmark: string | null;
  pincode: string;
  state: string;
  district: string;
  type: AddressType;
  createdAt: string;
}

export interface CreateAddressInput {
  street: string;
  landmark?: string;
  pincode: string;
  state: string;
  district: string;
  type: AddressType;
}

interface AddressListResponse {
  success: boolean;
  message: string;
  data: Address[];
}

interface AddressResponse {
  success: boolean;
  message: string;
  data: Address;
}

export async function getAddresses(): Promise<Address[]> {
  const response = await api.get<AddressListResponse>("/address");
  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || "Unable to load your addresses.");
  }
  return response.data.data;
}

export async function createAddress(address: CreateAddressInput): Promise<Address> {
  const response = await api.post<AddressResponse>("/address", address);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Unable to save your address.");
  }
  return response.data.data;
}

export async function deleteAddress(addressId: number): Promise<void> {
  await api.delete(`/address/${addressId}`);
}
