import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

        // Validation
        const newErrors = {};
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (!password || password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
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
            setApiError("Email ou mot de passe incorrect.");
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
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>

            <CardContent>
                {apiError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{apiError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-500"
                                onClick={() => alert('Forgot password clicked')}
                            >
                                Forgot password?
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full">
                        Sign in
                    </Button>

                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={onShowSignUp}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign up
                        </button>
                    </p>
                </form>

                {/* Student questionnaire entry */}
                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">ou</span>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-center text-slate-600 mb-2">
                        Étudiant ? Entrez votre code :
                    </p>
                    <form onSubmit={handleJoinSurvey} className="flex gap-2">
                        <Input
                            placeholder="Code Questionnaire"
                            value={idQuestionnaire}
                            onChange={(e) => setIdQuestionnaire(e.target.value)}
                        />
                        <Button type="submit">Aller</Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}