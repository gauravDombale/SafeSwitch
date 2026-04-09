import axios from 'axios';

export interface FeatureFlag {
  id: number;
  name: string;
  description: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const api = axios.create({
  baseURL: '/api'
});

export const flagService = {
  getFlags: async () => {
    const res = await api.get<FeatureFlag[]>('/flags');
    return res.data;
  },
  createFlag: async (data: { name: string; description?: string }) => {
    const res = await api.post<FeatureFlag>('/flags', data);
    return res.data;
  },
  toggleFlag: async (id: number, is_enabled: boolean) => {
    const res = await api.patch<FeatureFlag>(`/flags/${id}`, { is_enabled });
    return res.data;
  },
  deleteFlag: async (id: number) => {
    await api.delete(`/flags/${id}`);
  }
};
