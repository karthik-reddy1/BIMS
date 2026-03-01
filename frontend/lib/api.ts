import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Unwrap the { success, data } envelope the backend sends
api.interceptors.response.use(
    (response) => {
        // backend sends { success: true, data: ... }
        if (response.data && response.data.success !== undefined) {
            response.data = response.data.data
        }
        return response
    },
    (error) => {
        const message =
            error.response?.data?.message || error.message || 'An error occurred'
        return Promise.reject(new Error(message))
    }
)

export default api
