// 백엔드 REST API 클라이언트 (관리자)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getToken = () => localStorage.getItem("jwt_token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  },
  post: async (path: string, body?: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST", headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
  },
  patch: async (path: string, body?: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH", headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
    return res.json();
  },
  delete: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: headers() });
    if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
    return res.json();
  },
};

// 인증
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("로그인 실패");
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("user_info", JSON.stringify({
        email: data.email || email,
        name: data.name || email,
        roles: data.roles || ["SITE_MANAGER"],
      }));
    }
    return data;
  },
  logout: () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_info");
  },
  isLoggedIn: () => !!localStorage.getItem("jwt_token"),
  getUserInfo: () => {
    try { return JSON.parse(localStorage.getItem("user_info") || "{}"); }
    catch { return {}; }
  },
};

// 대시보드
export const dashboardApi = {
  get: () => api.get("/api/admin/dashboard"),
};

// 현장
export const siteApi = {
  getList: () => api.get("/api/admin/sites"),
  getById: (id: string) => api.get(`/api/admin/sites/${id}`),
  create: (data: unknown) => api.post("/api/admin/sites", data),
};

// 세대
export const unitApi = {
  getList: (siteId?: string) => api.get(`/api/admin/units${siteId ? `?siteId=${siteId}` : ""}`),
  updateStatus: (id: string, status: string) => api.patch(`/api/admin/units/${id}/status`, { status }),
};

// 입주민
export const residentApi = {
  getList: () => api.get("/api/admin/residents"),
  getById: (id: string) => api.get(`/api/admin/residents/${id}`),
  create: (data: unknown) => api.post("/api/admin/residents", data),
  update: (id: string, data: unknown) => api.patch(`/api/admin/residents/${id}`, data),
};

// 하자
export const defectApi = {
  getList: () => api.get("/api/admin/defects"),
  getById: (id: string) => api.get(`/api/admin/defects/${id}`),
  updateStatus: (id: string, data: unknown) => api.patch(`/api/admin/defects/${id}/status`, data),
};

// 공지
export const noticeApi = {
  getList: () => api.get("/api/admin/notices"),
  create: (data: unknown) => api.post("/api/admin/notices", data),
  update: (id: string, data: unknown) => api.patch(`/api/admin/notices/${id}`, data),
  remove: (id: string) => api.delete(`/api/admin/notices/${id}`),
};

// 납부
export const paymentApi = {
  getByResident: (residentId: string) => api.get(`/api/admin/payments/resident/${residentId}`),
  create: (data: unknown) => api.post("/api/admin/payments", data),
  approve: (id: string) => api.patch(`/api/admin/payments/${id}/approve`),
};

// 이사
export const movingApi = {
  getList: () => api.get("/api/admin/moving"),
  getByDate: (date: string) => api.get(`/api/admin/moving/date?date=${date}`),
  update: (id: string, data: unknown) => api.patch(`/api/admin/moving/${id}`, data),
};

// 입주증
export const permitApi = {
  getList: (siteId: string) => api.get(`/api/admin/permits?siteId=${siteId}`),
  approve: (id: string) => api.patch(`/api/admin/permits/${id}/approve`),
  approveBatch: (ids: string[]) => api.post("/api/admin/permits/approve-batch", { ids }),
};

// 차량
export const vehicleApi = {
  getList: (siteId: string) => api.get(`/api/admin/vehicles?siteId=${siteId}`),
  create: (data: unknown) => api.post("/api/admin/vehicles", data),
  issueQr: (id: string) => api.patch(`/api/admin/vehicles/${id}/qr`),
  remove: (id: string) => api.delete(`/api/admin/vehicles/${id}`),
};

// 동의서
export const agreementApi = {
  getList: (siteId: string) => api.get(`/api/admin/agreements?siteId=${siteId}`),
  getByResident: (residentId: string) => api.get(`/api/admin/agreements/resident/${residentId}`),
};

// 사전점검
export const inspectionApi = {
  getList: (siteId: string) => api.get(`/api/admin/inspections?siteId=${siteId}`),
  schedule: (data: unknown) => api.post("/api/admin/inspections", data),
  updateStatus: (id: string, data: unknown) => api.patch(`/api/admin/inspections/${id}/status`, data),
};

// 담당자 계정
export const accountApi = {
  getList: () => api.get("/api/admin/accounts"),
  create: (data: unknown) => api.post("/api/admin/accounts", data),
  toggleActive: (id: string, active: boolean) => api.patch(`/api/admin/accounts/${id}/active`, { active }),
  resetPassword: (id: string, password: string) => api.patch(`/api/admin/accounts/${id}/password`, { password }),
};

// 엑셀 일괄 업로드
export const excelApi = {
  uploadResidents: (file: File, siteId: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("siteId", siteId);
    return fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/admin/excel/residents`, {
      method: "POST",
      headers: { ...(localStorage.getItem("jwt_token") ? { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` } : {}) },
      body: form,
    }).then(r => r.json());
  },
  uploadUnits: (file: File, siteId: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("siteId", siteId);
    return fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/admin/excel/units`, {
      method: "POST",
      headers: { ...(localStorage.getItem("jwt_token") ? { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` } : {}) },
      body: form,
    }).then(r => r.json());
  },
  uploadVehicles: (file: File, siteId: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("siteId", siteId);
    return fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/admin/excel/vehicles`, {
      method: "POST",
      headers: { ...(localStorage.getItem("jwt_token") ? { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` } : {}) },
      body: form,
    }).then(r => r.json());
  },
};
