import axios from "axios";

// Создаем экземпляр со всеми базовыми настройками
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json",
  }
});

// ИНТЕРЦЕПТОР НА ЗАПРОС (Задание №10)
// Автоматически добавляет Access Token в каждый запрос
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ИНТЕРЦЕПТОР НА ОТВЕТ (Задание №9 и №10)
// Если сервер вернул 401 (токен протух), пытаемся обновить его через Refresh Token
apiClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, что ошибка 401 и мы еще не пытались обновиться
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Запрос на обновление токенов
        const res = await axios.post("http://localhost:3000/api/auth/refresh", { refreshToken });
        
        const { accessToken, newRefreshToken } = res.data;
        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        // Повторяем изначальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если рефреш тоже не сработал — разлогиниваем пользователя
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Экспортируем методы (твоя структура сохранена, но теперь они работают через защищенный клиент)
export const api = {
  // Твои методы работы с товарами
  createproduct: async (product) => {
    const response = await apiClient.post("/products", product);
    return response.data;
  },
  getproducts: async () => {
    const response = await apiClient.get("/products");
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
  },

  // НОВЫЕ МЕТОДЫ ДЛЯ АВТОРИЗАЦИИ (Задания №7, 8)
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    // Сохраняем токены при входе
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  }
};