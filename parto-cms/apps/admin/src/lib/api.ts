import axios from "axios";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";
const API_URL = `${RAW_API_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "")}/api/v1`;

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

// Add auth token to requests and let the browser set multipart boundaries
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData must not keep application/json or a bare multipart content-type
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("Content-Type", undefined as any);
    } else if (config.headers) {
      delete (config.headers as any)["Content-Type"];
      delete (config.headers as any)["content-type"];
    }
  }

  return config;
});

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/profile"),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),
};

const createCrudApi = (resource: string) => ({
  list: (params?: Record<string, unknown>) => api.get(`/${resource}`, { params }),
  getById: (id: string) => api.get(`/${resource}/${id}`),
  create: (data: any) => api.post(`/${resource}`, data),
  update: (id: string, data: any) => api.patch(`/${resource}/${id}`, data),
  delete: (id: string) => api.delete(`/${resource}/${id}`),
});

export const dashboardApi = {
  stats: () => api.get("/dashboard"),
};

export const clientsApi = createCrudApi("clients");
export const servicesApi = createCrudApi("services");
export const teamApi = createCrudApi("team");
export const postsApi = createCrudApi("posts");
export const pagesApi = createCrudApi("pages");
export const projectsApi = createCrudApi("projects");

export const settingsApi = {
  list: () => api.get("/settings"),
  getByKey: (key: string) => api.get(`/settings/${key}`),
  update: (key: string, value: any) => api.put(`/settings/${key}`, { value }),
  /** Saves the whole settings panel atomically. */
  updateMany: (values: Record<string, any>) => api.put("/settings/bulk", { values }),
};

export const mediaApi = {
  list: () => api.get("/media"),
  getById: (id: string) => api.get(`/media/${id}`),
  upload: (data: FormData) => api.post("/media/upload", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, data: any) => api.patch(`/media/${id}`, data),
  delete: (id: string) => api.delete("/media/" + id),
  getStats: () => api.get("/media/stats"),
};
