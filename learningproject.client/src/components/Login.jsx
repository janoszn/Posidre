import { useState } from 'react';
import { api } from '../services/api';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. On tente le login (le serveur pose le cookie)
            await api.login(email, password);

            // 2. Comme le login renvoie null, on va chercher les infos réelles
            // avec la route /auth/manage/info
            const realUserData = await api.getUserInfo();

            // 3. On envoie les vraies données au parent App.jsx
            onLoginSuccess(realUserData);

        } catch (err) {
            setError("Email ou mot de passe incorrect.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{ maxWidth: '300px', margin: '50px auto' }}>
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Mot de passe:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                {error && <p style={{ color: 'red', fontSize: '0.8em' }}>{error}</p>}

                <button type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
};

export default Login;
