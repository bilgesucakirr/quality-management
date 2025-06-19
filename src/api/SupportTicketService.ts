import axiosInstance from "./AxiosInstance";
import type { SupportTicket, CreateSupportTicketRequest, UpdateSupportTicketRequest } from "../types/SupportTicket";

export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  const response = await axiosInstance.get("/api/support-tickets");
  return response.data;
};

export const getSupportTicketById = async (id: string): Promise<SupportTicket> => {
  const response = await axiosInstance.get(`/api/support-tickets/${id}`);
  return response.data;
};

export const createSupportTicket = async (data: CreateSupportTicketRequest): Promise<SupportTicket> => {
  const response = await axiosInstance.post("/api/support-tickets", data);
  return response.data;
};

export const updateSupportTicket = async (id: string, data: Partial<UpdateSupportTicketRequest>): Promise<SupportTicket> => {
  const response = await axiosInstance.put(`/api/support-tickets/${id}`, data);
  return response.data;
};

export const deleteSupportTicket = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/support-tickets/${id}`);
};