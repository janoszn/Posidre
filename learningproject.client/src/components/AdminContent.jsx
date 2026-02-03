import React from 'react';
import {
    Paper,
    Divider,
    Stack,
    Typography
} from '@mui/material';
import WeatherForecast from './WeatherForecast';

export default function AdminContent() {
    return (
        <Stack spacing={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>👥 User Management</Typography>
                <Typography variant="body2" color="text.secondary">
                    View and manage all users, assign roles, and monitor activity.
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>📊 Platform Overview</Typography>
                <Typography variant="body2" color="text.secondary">
                    System stats, course stats, and overall platform health.
                </Typography>
            </Paper>

            <Divider />

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <WeatherForecast />
            </Paper>
        </Stack>
    );
}
