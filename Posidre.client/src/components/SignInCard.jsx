import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LogIn, KeyRound, Mail, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function SignInCard({ onLoginSuccess, onShowSignUp, onEnterIdQuestionnaire }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState(''); // Changed from idQuestionnaire to pin
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setErrors({});
        setLoading(true);

        const newErrors = {};
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Veuillez entrer une adresse courriel valide.';
        }
        if (!password || password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            await api.login(email, password);
            const userData = await api.getUserInfo();
            onLoginSuccess(userData);
        } catch (err) {
            setApiError("Courriel ou mot de passe incorrect.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSurvey = async (e) => {
        e.preventDefault();
        setApiError('');
        setPinLoading(true);

        // Validate PIN format (6 digits)
        if (!pin || pin.trim().length !== 6 || !/^\d{6}$/.test(pin.trim())) {
            setApiError("Le code PIN doit être composé de 6 chiffres.");
            setPinLoading(false);
            return;
        }

        try {
            // UPDATED: Use new validatePin endpoint
            const response = await api.validatePin(pin.trim());

            if (response.isValid && response.survey) {
                // Pass both survey data AND the PIN to parent component
                onEnterIdQuestionnaire({
                    survey: response.survey,
                    pin: pin.trim()
                });
            } else {
                setApiError("Code PIN invalide ou déjà utilisé.");
            }
        } catch (err) {
            console.error("PIN validation error:", err);
            setApiError(
                err.response?.message ||
                "Code PIN invalide, déjà utilisé, ou questionnaire fermé."
            );
        } finally {
            setPinLoading(false);
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
                            disabled={loading}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
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
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
                                onClick={() => alert('Mot de passe oublié cliqué')}
                                disabled={loading}
                            >
                                Mot de passe oublié?
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            placeholder="Mot de passe"
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                    </div>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connexion...
                            </>
                        ) : (
                            'Se connecter'
                        )}
                    </Button>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Vous n'avez pas de compte?{' '}
                        <button
                            type="button"
                            onClick={onShowSignUp}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                            disabled={loading}
                        >
                            S'inscrire
                        </button>
                    </p>
                </form>

                {/* Separator */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground font-semibold">ou</span>
                    </div>
                </div>

                {/* Student PIN entry */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm font-semibold text-center text-foreground mb-3">
                        🎓 Étudiant ? Entrez votre code PIN :
                    </p>
                    <form onSubmit={handleJoinSurvey} className="space-y-3">
                        <Input
                            placeholder="Code à 6 chiffres (ex: 123456)"
                            value={pin}
                            onChange={(e) => {
                                // Only allow digits and limit to 6 characters
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setPin(value);
                            }}
                            className="bg-card border-primary/30 focus:border-primary text-lg"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            disabled={pinLoading}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-primary"
                            disabled={pinLoading || pin.length !== 6}
                        >
                            {pinLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Vérification...
                                </>
                            ) : (
                                'Accéder au questionnaire'
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            Entrez le code à 6 chiffres fourni par votre enseignant
                        </p>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}