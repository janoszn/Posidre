import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from '../services/api';
import RenderQuestion from "./ui/RenderQuestion";
import { Progress } from "@/components/ui/progress";
import { Info } from 'lucide-react';

export default function PublicSurvey({ survey, pin, onCancel }) {
    const [isStarted, setIsStarted] = useState(false);
    const [answers, setAnswers] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const questionsPerPage = 5;

    const sortedQuestions = useMemo(() => {
        return [...survey.questions].sort((a, b) => a.order - b.order);
    }, [survey.questions]);

    const totalPages = Math.ceil(sortedQuestions.length / questionsPerPage);
    const currentQuestions = sortedQuestions.slice(
        currentPage * questionsPerPage,
        (currentPage + 1) * questionsPerPage
    );
    const isLastPage = currentPage === totalPages - 1;

    const handleNext = () => {
        const allRequiredAnswered = currentQuestions
            .filter(q => q.isRequired)
            .every(q => answers[q.id] !== undefined && answers[q.id] !== '');

        if (!allRequiredAnswered) {
            alert("Veuillez répondre à toutes les questions obligatoires avant de continuer.");
            return;
        }

        if (!isLastPage) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmitAnswers = async () => {
        try {
            const formattedAnswers = Object.keys(answers).map(qId => ({
                questionId: parseInt(qId),
                value: typeof answers[qId] === 'object'
                    ? JSON.stringify(answers[qId])
                    : answers[qId].toString()
            }));

            // UPDATED: New submission format with PIN
            const submissionData = {
                pin: pin, // Use PIN instead of surveyId
                answers: formattedAnswers
                // REMOVED: studentName - complete anonymity
            };

            await api.submitSurvey(submissionData);

            alert("Merci ! Vos réponses ont été enregistrées de manière anonyme.");
            onCancel();
        } catch (err) {
            console.error("Erreur d'envoi:", err);

            // Better error messages
            if (err.response?.message) {
                alert(err.response.message);
            } else if (err.message?.includes('already used')) {
                alert("Ce code PIN a déjà été utilisé.");
            } else {
                alert("Erreur lors de l'envoi. Veuillez réessayer.");
            }
        }
    };

    const handleUpdateAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleMultipleChoiceToggle = (questionId, option) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            const newAnswers = currentAnswers.includes(option)
                ? currentAnswers.filter(a => a !== option)
                : [...currentAnswers, option];
            return { ...prev, [questionId]: newAnswers };
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-2xl">
                {!isStarted ? (
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl font-bold">{survey.title}</h1>
                            <p className="text-muted-foreground">{survey.description}</p>

                            {/* UPDATED: Privacy notice instead of name input */}
                            <Alert className="mt-6">
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-left">
                                    <strong>Questionnaire anonyme:</strong> Vos réponses sont complètement anonymes.
                                    Aucun nom ne sera enregistré. Assurez-vous d'avoir du temps pour compléter
                                    le questionnaire en une session, car votre code PIN ne peut être utilisé qu'une seule fois.
                                </AlertDescription>
                            </Alert>

                            <Button
                                className="w-full mt-4"
                                onClick={() => setIsStarted(true)}
                                size="lg"
                            >
                                Commencer le questionnaire ({sortedQuestions.length} questions)
                            </Button>

                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="w-full"
                            >
                                Annuler
                            </Button>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="border-b pb-4">
                            <div className="flex justify-between items-center mb-2">
                                <CardTitle className="text-lg">{survey.title}</CardTitle>
                                <span className="text-sm font-medium text-muted-foreground">
                                    Page {currentPage + 1} sur {totalPages}
                                </span>
                            </div>
                            <Progress value={((currentPage + 1) / totalPages) * 100} className="h-2" />
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            {currentQuestions.map((q) => (
                                <div key={q.id} className="space-y-2 p-4 bg-muted/50 rounded-lg border">
                                    <Label className="text-base font-semibold flex items-start gap-2">
                                        <span className="text-primary">{q.order}.</span>
                                        {q.text}
                                        {q.isRequired && <span className="text-destructive">*</span>}
                                    </Label>

                                    <RenderQuestion
                                        q={q}
                                        answers={answers}
                                        handleUpdateAnswer={handleUpdateAnswer}
                                        handleMultipleChoiceToggle={handleMultipleChoiceToggle}
                                    />
                                </div>
                            ))}

                            <div className="flex justify-between gap-4 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentPage === 0}
                                >
                                    Précédent
                                </Button>

                                {!isLastPage ? (
                                    <Button className="flex-1" onClick={handleNext}>
                                        Suivant
                                    </Button>
                                ) : (
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSubmitAnswers}>
                                        Terminer et envoyer
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}