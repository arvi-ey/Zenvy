// lib/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


// api.interceptors.request.use(
//     (config) => {
//         // You can add auth tokens here
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );


// api.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         // Handle errors globally
//         if (error.response) {
//             // Server responded with error status
//             console.error('API Error:', error.response.data);

//             // Handle 401 Unauthorized
//             if (error.response.status === 401) {
//                 // Redirect to login or refresh token
//                 // router.push('/login');
//             }
//         } else if (error.request) {
//             // Request made but no response
//             console.error('No response from server');
//         } else {
//             // Something else happened
//             console.error('Error:', error.message);
//         }
//         return Promise.reject(error);
//     }
// );

export default api;