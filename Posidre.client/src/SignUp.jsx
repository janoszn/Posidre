import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from './services/api';

export default function SignUp({ onRegisterSuccess, onShowLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Student');
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
        if (!name || name.length < 1) {
            newErrors.name = 'Le nom est requis.';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {
            await api.register(email, password, role);
            const userData = await api.getUserInfo();
            onRegisterSuccess?.(userData);
        } catch (err) {
            const errorsList = err.response;
            if (Array.isArray(errorsList)) {
                const parsedErrors = {};
                errorsList.forEach(e => {
                    if (e.code?.startsWith('Password')) parsedErrors.password = e.description;
                    if (e.code?.startsWith('Email')) parsedErrors.email = e.description;
                });
                if (Object.keys(parsedErrors).length === 0) {
                    setApiError(errorsList.map(e => e.description).join(' '));
                } else {
                    setErrors(parsedErrors);
                }
            } else {
                setApiError(err.message || "L'inscription a échoué");
            }
        }
    };  

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-background dark:to-orange-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">S'inscrire</CardTitle>
                    <CardDescription>Créez un compte pour commencer</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                placeholder="Prénom Nom"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Courriel</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="votre@courriel.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Rôle</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Student">Étudiant</SelectItem>
                                    <SelectItem value="Teacher">Enseignant</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="SchoolAdmin">Admin-École</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* API error */}
                        {apiError && (
                            <Alert variant="destructive">
                                <AlertDescription>{apiError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Submit */}
                        <Button type="submit" className="w-full">
                            S'inscrire
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">OU</span>
                            </div>
                        </div>

                        {/* Link to sign in */}
                        <p className="text-center text-sm text-muted-foreground">
                            Vous avez déjà un compte ?{' '}
                            <button
                                type="button"
                                onClick={onShowLogin}
                                className="font-medium text-primary hover:text-primary/80 hover:underline"
                            >
                                Se connecter
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}