import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LogIn, KeyRound, Mail } from 'lucide-react';
import { api } from '../services/api';

export default function SignInCard({ onLoginSuccess, onShowSignUp, onEnterIdQuestionnaire }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [idQuestionnaire, setIdQuestionnaire] = useState('');
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setErrors({});

        const newErrors = {};
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Veuillez entrer une adresse courriel valide.';
        }
        if (!password || password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await api.login(email, password);
            const userData = await api.getUserInfo();
            onLoginSuccess(userData);
        } catch (err) {
            setApiError("Courriel ou mot de passe incorrect.");
            console.error(err);
        }
    };

    const handleJoinSurvey = async (e) => {
        e.preventDefault();
        setApiError('');
        try {
            const surveyData = await api.getSurvey(idQuestionnaire);
            onEnterIdQuestionnaire(surveyData);
        } catch (err) {
            setApiError("Code PIN invalide ou questionnaire fermé.");
        }
    };

    return (
        <Card className="w-full shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-2 mb-2">

                    <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
                </div>
                <CardDescription>
                    Entrez vos identifiants pour accéder à votre compte
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {apiError && (
                    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                        <AlertDescription>{apiError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            Courriel
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="votre@courriel.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-slate-300 focus:border-primary focus:ring-primary"
                            required
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-primary" />
                                Mot de passe
                            </Label>
                            <button
                                type="button"
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                onClick={() => alert('Mot de passe oublié cliqué')}
                            >
                                Mot de passe oublié?
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-slate-300 focus:border-primary focus:ring-primary"
                            required
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Submit button with gradient */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold shadow-lg shadow-primary/20"
                    >
                        Se connecter
                    </Button>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        Vous n'avez pas de compte?{' '}
                        <button
                            type="button"
                            onClick={onShowSignUp}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            S'inscrire
                        </button>
                    </p>
                </form>

                {/* Separator with accent color */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 font-semibold">ou</span>
                    </div>
                </div>

                {/* Student questionnaire entry with accent */}
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm font-semibold text-center text-slate-700 dark:text-slate-300 mb-3">
                        🎓 Étudiant ? Entrez votre code :
                    </p>
                    <form onSubmit={handleJoinSurvey} className="flex gap-2">
                        <Input
                            placeholder="Code du questionnaire"
                            value={idQuestionnaire}
                            onChange={(e) => setIdQuestionnaire(e.target.value)}
                            className="bg-white dark:bg-slate-900 border-primary/30 focus:border-primary"
                        />
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 px-6"
                        >
                            Aller
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}