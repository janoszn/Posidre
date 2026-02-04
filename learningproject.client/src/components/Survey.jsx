import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { api } from '../services/api';
import RenderQuestion from "./ui/RenderQuestion";
import { Progress } from "@/components/ui/progress"; // Si tu as le composant Progress de Shadcn

export default function PublicSurvey({ survey, onCancel }) {
    const [studentName, setStudentName] = useState('');
    const [alreadyDone, setAlreadyDone] = useState(() => {
        return !!localStorage.getItem(`survey_${survey.id}`);
    });
    const [isStarted, setIsStarted] = useState(false);
    const [answers, setAnswers] = useState({});

    // --- LOGIQUE DE PAGINATION ---
    const [currentPage, setCurrentPage] = useState(0);
    const questionsPerPage = 5; // Tu peux changer ce nombre (ex: 10)

    // Trier les questions une seule fois pour éviter les sauts d'ordre
    const sortedQuestions = useMemo(() => {
        return [...survey.questions].sort((a, b) => a.order - b.order);
    }, [survey.questions]);

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(sortedQuestions.length / questionsPerPage);

    // Obtenir les questions de la page actuelle
    const currentQuestions = sortedQuestions.slice(
        currentPage * questionsPerPage,
        (currentPage + 1) * questionsPerPage
    );

    const isLastPage = currentPage === totalPages - 1;

    const handleNext = () => {
        // Optionnel : vérifier si les questions obligatoires de la page actuelle sont remplies
        const allRequiredAnswered = currentQuestions
            .filter(q => q.isRequired)
            .every(q => answers[q.id] !== undefined && answers[q.id] !== '');

        if (!allRequiredAnswered) {
            alert("Veuillez répondre à toutes les questions obligatoires avant de continuer.");
            return;
        }

        if (!isLastPage) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0); // Remonter en haut de la page
        }
    };

    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };


    const handleSubmitAnswers = async () => {
        // Ta logique existante...
        try {
            const formattedAnswers = Object.keys(answers).map(qId => ({
                questionId: parseInt(qId),
                value: typeof answers[qId] === 'object'
                    ? JSON.stringify(answers[qId])
                    : answers[qId].toString()
            }));

            const submissionData = {
                surveyId: survey.id,
                studentName: studentName,
                answers: formattedAnswers
            };

            await api.submitSurvey(submissionData);
            localStorage.setItem(`survey_${survey.id}`, 'true');
            setAlreadyDone(true);
            alert("Merci ! Vos réponses ont été enregistrées.");
            onCancel();
        } catch (err) {
            console.error("Erreur d'envoi:", err);
            alert("Erreur lors de l'envoi.");
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

    if (alreadyDone) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <Alert>
                            <AlertDescription>
                                Vous avez déjà répondu à ce questionnaire. Merci !
                            </AlertDescription>
                        </Alert>
                        <Button onClick={onCancel} className="w-full mt-4">
                            Retour
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
            <Card className="w-full max-w-2xl">
                {!isStarted ? (
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl font-bold">{survey.title}</h1>
                            <p className="text-slate-600 dark:text-slate-400">{survey.description}</p>
                            <div className="space-y-2 pt-4">
                                <Label htmlFor="studentName">Votre Nom Complet</Label>
                                <Input
                                    id="studentName"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <Button
                                className="w-full mt-4"
                                disabled={!studentName}
                                onClick={() => setIsStarted(true)}
                            >
                                Commencer le questionnaire ({sortedQuestions.length} questions)
                            </Button>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="border-b pb-4">
                            <div className="flex justify-between items-center mb-2">
                                <CardTitle className="text-lg">{survey.title}</CardTitle>
                                <span className="text-sm font-medium text-slate-500">
                                    Page {currentPage + 1} sur {totalPages}
                                </span>
                            </div>
                            {/* Barre de progression */}
                            <Progress value={((currentPage + 1) / totalPages) * 100} className="h-2" />
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            {currentQuestions.map((q) => (
                                <div key={q.id} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <Label className="text-base font-semibold flex items-start gap-2">
                                        <span className="text-primary">{q.order}.</span>
                                        {q.text}
                                        {q.isRequired && <span className="text-red-500">*</span>}
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