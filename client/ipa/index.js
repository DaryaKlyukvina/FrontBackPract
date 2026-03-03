import axios from "axios";
const apiClient = axios.create({
baseURL: "http://localhost:3000/api",
headers: {
"Content-Type": "application/json",
"accept": "application/json",
}
});
export const api = {
createproduct: async (product) => {
let response = await apiClient.post("/products", product);
return response.data;
},
getproducts: async () => {
let response = await apiClient.get("/products");
return response.data;
},
getproductById: async (id) => {
let response = await apiClient.get(`/products/${id}`);
return response.data;
},
updateproduct: async (id, product) => {
let response = await apiClient.patch(`/products/${id}`, product);
return response.data;
},
deleteproduct: async (id) => {
let response = await apiClient.delete(`/products/${id}`);
return response.data;
}
}