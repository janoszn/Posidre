import { useState, useEffect } from 'react';
import { api } from './services/api';
import SignInSide from "./SignInSide";
import SignUp from "./SignUp";
import Dashboard from "./components/Dashboard";
import PublicSurvey from "./components/Survey";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSignUp, setShowSignUp] = useState(false);
    const [activeQuestionnaire, setActiveQuestionnaire] = useState(null);

    // Check session on mount
    useEffect(() => {
        api.getUserInfo()
            .then(data => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        setShowSignUp(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="mt-2 text-slate-600">Vérification de la session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="App">
            {user ? (
                <Dashboard user={user} onLogout={handleLogout} />
            ) : activeQuestionnaire ? (
                <PublicSurvey
                    survey={activeQuestionnaire}
                    onCancel={() => setActiveQuestionnaire(null)}
                />
            ) : (
                showSignUp ? (
                    <SignUp
                        onRegisterSuccess={(userData) => setUser(userData)}
                        onShowLogin={() => setShowSignUp(false)}
                    />
                ) : (
                    <SignInSide
                        onLoginSuccess={(userData) => setUser(userData)}
                        onShowSignUp={() => setShowSignUp(true)}
                        onEnterIdQuestionnaire={(surveyData) => setActiveQuestionnaire(surveyData)}
                    />
                )
            )}
        </div>
    );
}

export default App;