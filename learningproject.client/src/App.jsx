import { useState, useEffect } from 'react';
import { api } from './services/api';
import SignInSide from "./SignInSide";
import SignUp from "./SignUp";
import Dashboard from "./components/Dashboard"

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSignUp, setShowSignUp] = useState(false);

    // Wait for user info on refresh
    useEffect(() => {
        api.getUserInfo()
            .then(data => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    // Logout handler
    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        setShowSignUp(false);
    };


    if (loading) return <div>Vérification de la session...</div>;

    return (
        <div className="App">
            {user ? (
                // CAS 1 : UTILISATEUR CONNECTÉ
                <Dashboard user={user} onLogout={handleLogout} />
            ) : (
                // CAS 2 : UTILISATEUR NON CONNECTÉ (Affichage Login OU SignUp)
                showSignUp ? (
                        <SignUp
                            onRegisterSuccess={(userData) => setUser(userData)}
                            onShowLogin={() => setShowSignUp(false)} />
                ) : (
                    <SignInSide
                        onLoginSuccess={(userData) => setUser(userData)}
                        onShowSignUp={() => setShowSignUp(true)}
                    />
                )
            )}
        </div>
    );
}

export default App;
