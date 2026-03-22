import axios from "axios";

// Создаем экземпляр со всеми базовыми настройками
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json",
  }
});

/* ==========================================
   ИНТЕРЦЕПТОР НА ЗАПРОС (Задание №10)
   Автоматически добавляет Access Token в каждый запрос
   ========================================== */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ==========================================
   ИНТЕРЦЕПТОР НА ОТВЕТ (Задание №9 и №10)
   Если сервер вернул 401, пытаемся обновить токен
   ========================================== */
apiClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;
    const storedRefreshToken = localStorage.getItem("refreshToken");

    // Если ошибка 401, мы еще не пробовали рефреш и у нас есть сам рефреш-токен
    if (error.response?.status === 401 && !originalRequest._retry && storedRefreshToken) {
      originalRequest._retry = true;
      try {
        // Запрос на обновление токенов
        const res = await axios.post("http://localhost:3000/api/auth/refresh", { 
          refreshToken: storedRefreshToken 
        });
        
        const { accessToken, refreshToken: newRefreshToken } = res.data;
        
        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        // Повторяем изначальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если рефреш не удался — разлогиниваем пользователя
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

/* ==========================================
   ЭКСПОРТ МЕТОДОВ API
   ========================================== */
export const api = {
  // --- АВТОРИЗАЦИЯ (Задания №7, 8) ---
  
  // Метод регистрации (был пропущен!)
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    // Сохраняем токены в localStorage сразу после успешного входа
    if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    return response.data;
  },

  getMe: async (token) => {
    // Если токен передан вручную (при логине), используем его. 
    // Если нет — axios сам возьмет из заголовков через интерцептор.
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await apiClient.get("/auth/me", config);
    return response.data;
  },
  // --- ТОВАРЫ (Задания №10, 11) ---

  getproducts: async () => {
    const response = await apiClient.get("/products");
    return response.data;
  },

  createproduct: async (product) => {
    const response = await apiClient.post("/products", product);
    return response.data;
  },

  getproductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  updateproduct: async (id, product) => {
    const response = await apiClient.patch(`/products/${id}`, product);
    return response.data;
  },

  deleteproduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};