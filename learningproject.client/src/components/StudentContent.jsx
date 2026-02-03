import React from 'react';
import {
    Paper,
    Divider,
    Stack,
    Typography,
    Box
} from '@mui/material';
import TodoList from './TodoList';
import WeatherForecast from './WeatherForecast';

export default function StudentContent() {
    return (
        <Stack spacing={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>📚 My Courses</Typography>
                <Typography variant="body2" color="text.secondary">
                    Courses you're enrolled in and your progress.
                </Typography>
            </Paper>

            <Divider />

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <TodoList />
            </Paper>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <WeatherForecast />
            </Paper>
        </Stack>
    );
}
