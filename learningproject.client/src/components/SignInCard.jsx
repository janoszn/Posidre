import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import { api } from '../services/api';
import Alert from '@mui/material/Alert';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard({ onLoginSuccess, onShowSignUp }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [apiError, setApiError] = React.useState(''); // Pour les erreurs 401
  const [open, setOpen] = React.useState(false);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError('');

        // On valide avant d'envoyer
        if (!validateInputs()) return;

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

        try {
            await api.login(email, password);
            const realUserData = await api.getUserInfo();
            onLoginSuccess(realUserData);
        } catch (err) {
            setApiError("Email ou mot de passe incorrect.");
            console.error(err);
        }
    };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

    return (
        <Card variant="outlined">
            <SitemarkIcon />
            <Typography component="h1" variant="h4">Sign in</Typography>

            {/* AFFICHAGE DE L'ERREUR API SI ELLE EXISTE */}
            {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField error={emailError} helperText={emailErrorMessage} id="email" type="email" name="email" placeholder="your@email.com" required fullWidth variant="outlined" />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link component="button" type="button" onClick={() => setOpen(true)} variant="body2">Forgot password?</Link>
                    </Box>
                    <TextField error={passwordError} helperText={passwordErrorMessage} name="password" type="password" id="password" required fullWidth variant="outlined" />
                </FormControl>

                <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
                <ForgotPassword open={open} handleClose={() => setOpen(false)} />

                <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
                    Sign in
                </Button>

                <Typography sx={{ textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <Link component="button" variant="body2" onClick={onShowSignUp}>
                        Sign up
                    </Link>
                </Typography>
            </Box>
            <Divider>or</Divider>
            {/* ... Boutons Google/Facebook ... */}
        </Card>
    );
}
