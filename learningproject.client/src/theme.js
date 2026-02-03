import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const theme = createTheme({
    cssVariables: true,
    palette: {
        mode: 'dark', // Active les couleurs sombres par défaut
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: red.A400,
        },
        background: {
            // #121212 est la couleur recommandée par Material Design
            default: '#121212',
            paper: '#1e1e1e', // Couleur pour les composants comme Card ou Paper
        },
    },
});

export default theme;

