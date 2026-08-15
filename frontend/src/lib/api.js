import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        Accept: 'application/json',
    },
})

// A passer sur chaque appel admin : { headers: authHeader() }
export function authHeader() {
    return { Authorization: 'Bearer ' + localStorage.getItem('token') }
}

export default api
