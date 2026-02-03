import React from 'react';
import {
    Paper,
    Divider,
    Stack,
    Typography
} from '@mui/material';
import WeatherForecast from './WeatherForecast';

export default function TeacherContent() {
    return (
        <Stack spacing={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>🎓 My Courses</Typography>
                <Typography variant="body2" color="text.secondary">
                    Courses you're teaching and their enrolled students.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>📝 Assignments</Typography>
                <Typography variant="body2" color="text.secondary">
                    Create, manage and grade student assignments.
                </Typography>
            </Paper>

            <Divider />

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <WeatherForecast />
            </Paper>
        </Stack>
    );
}
