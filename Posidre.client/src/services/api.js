import { client } from './apiClient';

export const api = {
    // AUTH
    login: (email, password) => client.post('/api/auth/login?useCookies=true', { email, password }),
    register: (email, password, role) => client.post('/api/auth/register', { email, password, role }),
    logout: () => client.post('/api/auth/logout', {}),
    getUserInfo: () => client.get('/api/auth/me'),

    //Survey
    getSurvey: (pin) => client.get(`/api/survey/public/${pin}`),
    submitSurvey: (data) => client.post('/api/survey/submit', data),

    // TEACHER ROUTES
    getTeacherSurveys: () => client.get('/api/teacher/surveys'),
    getSurveySubmissions: (id) => client.get(`/api/teacher/surveys/${id}/submissions`),
    createSurvey: () => client.post('/api/teacher/surveys/create', {}),
    deleteSurvey: (id) => client.delete(`/api/teacher/surveys/${id}`),

    // SCHOOL ADMIN ROUTES
    getSchoolAdminSurveys: () => client.get('/api/schooladmin/surveys'),
    getSchoolAdminSubmissions: (id) => client.get(`/api/schooladmin/surveys/${id}/submissions`),
    createSchoolAdminSurvey: (data) => client.post('/api/schooladmin/surveys/create', data),
    deleteSchoolAdminSurvey: (id) => client.delete(`/api/schooladmin/surveys/${id}`),

    // STUDENT ROUTE (Updated)
    validatePin: (pin) => client.get(`/api/survey/validate/${pin}`),
};
