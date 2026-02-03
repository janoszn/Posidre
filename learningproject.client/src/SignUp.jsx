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

        // Basic validation
        const newErrors = {};
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (!password || password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
        }
        if (!name || name.length < 1) {
            newErrors.name = 'Name is required.';
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
                setApiError(err.message || "Registration failed");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
                    <CardDescription>Create an account to get started</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                placeholder="Jon Snow"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
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

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Student">Student</SelectItem>
                                    <SelectItem value="Teacher">Teacher</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
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
                            Sign up
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">or</span>
                            </div>
                        </div>

                        {/* Link to sign in */}
                        <p className="text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={onShowLogin}
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                            >
                                Sign in
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}