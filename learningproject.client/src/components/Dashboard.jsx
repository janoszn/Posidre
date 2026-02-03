import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    Paper,
    Divider,
    Stack,
    CssBaseline
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import TodoList from './TodoList';
import WeatherForecast from './WeatherForecast';
import ColorModeSelect from "../shared-theme/ColorModeSelect"
import AppTheme from '../shared-theme/AppTheme';

const Dashboard = (props) => {
    return (
        <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Box sx={{ flexGrow: 1 }}>
            {/* Barre de navigation pro */}
            <AppBar position="static" color="primary" sx={{ mb: 4 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        POSIDRE
                    </Typography>
                    <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                        {props.user?.email}
                    </Typography>
                    
                    <Button
                        color="inherit"
                        onClick={props.onLogout}
                        startIcon={<LogoutIcon />}
                    >
                        Déconnexion
                    </Button>
                        <ColorModeSelect sx={{ml: 2} } />
                </Toolbar>
            </AppBar>

            <Container maxWidth="md">
                <Stack spacing={4}>
                    {/* Section Météo dans une carte discrète */}
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <WeatherForecast />
                    </Paper>

                    <Divider />

                    {/* Section TodoList */}
                    <Box>
                        <TodoList />
                    </Box>
                </Stack>
            </Container>
            </Box>
        </AppTheme>
    );
};

export default Dashboard;
