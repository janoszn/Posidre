import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import SurveyForm from './Survey';
import { api } from '../services/api';

export default function StudentContent() {
    const [pin, setPin] = useState('');
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleValidatePin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.validatePin(pin.trim());

            if (response.isValid) {
                setSurvey(response.survey);
            } else {
                setError('Code PIN invalide ou déjà utilisé');
            }
        } catch (err) {
            console.error('PIN validation error:', err);
            setError(err.response?.message || 'Code PIN invalide ou déjà utilisé');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (answers) => {
        setLoading(true);
        setError(null);

        try {
            await api.submitSurvey({
                pin: pin.trim(),
                answers: answers
            });

            setSubmitted(true);
            setSurvey(null);
        } catch (err) {
            console.error('Survey submission error:', err);
            setError(err.response?.message || 'Erreur lors de la soumission');
        } finally {
            setLoading(false);
        }
    };

    // Success screen
    if (submitted) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Merci!</CardTitle>
                    <CardDescription>
                        Vos réponses ont été enregistrées avec succès
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => {
                            setPin('');
                            setSubmitted(false);
                        }}
                        className="w-full"
                    >
                        Terminer
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Survey form
    if (survey) {
        return (
            <SurveyForm
                survey={survey}
                pin={pin}  // Pass PIN to survey component
                onSubmit={handleSubmit}
                onCancel={() => {
                    setSurvey(null);
                    setPin('');
                }}
                loading={loading}
            />
        );
    }

    // PIN entry screen
    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Accès au questionnaire</CardTitle>
                <CardDescription>
                    Entrez le code PIN fourni par votre enseignant
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleValidatePin} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="pin">Code PIN</Label>
                        <Input
                            id="pin"
                            type="text"
                            placeholder="Entrez votre code à 6 chiffres"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            className="text-center text-2xl font-mono tracking-wider"
                            disabled={loading}
                            required
                        />
                        <p className="text-xs text-muted-foreground text-center">
                            Code à 6 chiffres (ex: 123456)
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={loading || pin.length !== 6}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Vérification...
                            </>
                        ) : (
                            'Accéder au questionnaire'
                        )}
                    </Button>

                    <Alert>
                        <AlertDescription className="text-xs">
                            <strong>Note:</strong> Chaque code PIN ne peut être utilisé qu'une seule fois.
                            Assurez-vous d'avoir du temps pour compléter le questionnaire en une session.
                        </AlertDescription>
                    </Alert>
                </form>
            </CardContent>
        </Card>
    );
}