import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    CssBaseline,
    Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import AppTheme from '../shared-theme/AppTheme';
import AdminContent from './AdminContent';
import StudentContent from './StudentContent';
import TeacherContent from './TeacherContent';

// Role → content mapping
const dashboardByRole = {
    Admin: <AdminContent />,
    Student: <StudentContent />,
    Teacher: <TeacherContent />,
};

// Role → chip color
const roleChipColor = {
    Admin: 'error',
    Student: 'info',
    Teacher: 'success',
};

const Dashboard = (props) => {
    const role = props.user?.role;

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Box sx={{ flexGrow: 1 }}>
                {/* Shared navbar across all roles */}
                <AppBar position="static" color="primary" sx={{ mb: 4 }}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            POSIDRE
                        </Typography>

                        {/* Role badge */}
                        <Chip
                            label={role}
                            color={roleChipColor[role] || 'default'}
                            size="small"
                            sx={{ mr: 2, fontWeight: 'bold' }}
                        />

                        {/* Email */}
                        <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                            {props.user?.email}
                        </Typography>

                        {/* Logout */}
                        <Button
                            color="inherit"
                            onClick={props.onLogout}
                            startIcon={<LogoutIcon />}
                        >
                            Déconnexion
                        </Button>

                        <ColorModeSelect sx={{ ml: 2 }} />
                    </Toolbar>
                </AppBar>

                {/* Role-specific content */}
                <Container maxWidth="md">
                    {dashboardByRole[role] ?? (
                        <Typography color="error">Unknown role: {role}</Typography>
                    )}
                </Container>
            </Box>
        </AppTheme>
    );
};

export default Dashboard;