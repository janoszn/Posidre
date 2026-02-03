import { client } from './apiClient';

export const api = {
    // AUTH
    login: (email, password) => client.post('/api/auth/login?useCookies=true', { email, password }),
    register: (email, password, role) => client.post('/api/auth/register', { email, password, role }),
    logout: () => client.post('/api/auth/logout', {}),
    getUserInfo: () => client.get('/api/auth/me'),

    // TODOS
    getTodos: () => client.get('/api/todo'),
    addTodo: (title) => client.post('/api/todo', { title, isCompleted: false }),
    deleteTodo: (id) => client.delete(`/api/todo/${id}`),
    toggleTodo: (id, isCompleted) => client.put(`/api/todo/${id}`, { isCompleted }),

    // WEATHER
    getWeather: () => client.get('/api/weatherforecast'),

    //Survey
    getSurvey: (pin) => client.get(`/api/survey/public/${pin}`),
    submitSurvey: (data) => client.post('/api/survey/submit', data),

    // TEACHER ROUTES
    getTeacherSurveys: () => client.get('/api/teacher/surveys'),
    getSurveySubmissions: (id) => client.get(`/api/teacher/surveys/${id}/submissions`),
};
