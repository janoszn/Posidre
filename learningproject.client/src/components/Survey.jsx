import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { api } from '../services/api';

export default function PublicSurvey({ survey, onCancel }) {
    const [studentName, setStudentName] = useState('');
    const [alreadyDone, setAlreadyDone] = useState(() => {
        return !!localStorage.getItem(`survey_${survey.id}`);
    });
    const [isStarted, setIsStarted] = useState(false);
    const [answers, setAnswers] = useState({});

    const handleSubmitAnswers = async () => {
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
            alert("Erreur lors de l'envoi. Veuillez réessayer.");
        }
    };

    const handleUpdateAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleMultipleChoiceToggle = (questionId, option) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            const newAnswers = currentAnswers.includes(option)
                ? currentAnswers.filter(a => a !== option)
                : [...currentAnswers, option];
            return {
                ...prev,
                [questionId]: newAnswers
            };
        });
    };

    const renderQuestion = (q) => {
        const options = q.optionsJson ? JSON.parse(q.optionsJson) : [];

        switch (q.type) {
            case 'text':
                return (
                    <Input
                        placeholder="Votre réponse ici..."
                        value={answers[q.id] || ''}
                        onChange={(e) => handleUpdateAnswer(q.id, e.target.value)}
                        className="mt-2"
                    />
                );

            case 'scale':
                const scaleValue = answers[q.id] || q.scaleMin || 0;
                return (
                    <div className="space-y-4 mt-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{q.scaleMinLabel || q.scaleMin}</span>
                            <span className="font-bold text-primary text-lg">{scaleValue}</span>
                            <span>{q.scaleMaxLabel || q.scaleMax}</span>
                        </div>
                        <Slider
                            min={q.scaleMin || 0}
                            max={q.scaleMax || 10}
                            step={1}
                            value={[scaleValue]}
                            onValueChange={(value) => handleUpdateAnswer(q.id, value[0])}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            {Array.from({ length: (q.scaleMax - q.scaleMin) + 1 }, (_, i) => (
                                <span key={i}>{q.scaleMin + i}</span>
                            ))}
                        </div>
                    </div>
                );

            case 'single_choice':
                return (
                    <RadioGroup
                        value={answers[q.id] || ''}
                        onValueChange={(value) => handleUpdateAnswer(q.id, value)}
                        className="mt-3 space-y-2"
                    >
                        {options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${q.id}-${idx}`} />
                                <Label htmlFor={`${q.id}-${idx}`} className="cursor-pointer">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case 'multiple_choice':
                const selectedOptions = answers[q.id] || [];
                return (
                    <div className="mt-3 space-y-2">
                        {options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${q.id}-${idx}`}
                                    checked={selectedOptions.includes(option)}
                                    onCheckedChange={() => handleMultipleChoiceToggle(q.id, option)}
                                />
                                <Label htmlFor={`${q.id}-${idx}`} className="cursor-pointer">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </div>
                );

            default:
                return <p className="text-sm text-red-500">Type de question inconnu</p>;
        }
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

                            <div className="flex gap-2 pt-4">
                                <Button
                                    className="flex-1"
                                    disabled={!studentName}
                                    onClick={() => setIsStarted(true)}
                                >
                                    Commencer
                                </Button>
                                <Button variant="outline" onClick={onCancel}>
                                    Annuler
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle>{survey.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {survey.questions
                                .sort((a, b) => a.order - b.order)
                                .map((q) => (
                                    <div key={q.id} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <Label className="text-base font-semibold flex items-start gap-2">
                                            <span className="text-primary">{q.order}.</span>
                                            {q.text}
                                            {q.isRequired && <span className="text-red-500">*</span>}
                                        </Label>
                                        {renderQuestion(q)}
                                    </div>
                                ))}

                            <div className="flex gap-2 pt-4">
                                <Button
                                    className="flex-1"
                                    onClick={handleSubmitAnswers}
                                >
                                    Envoyer mes réponses
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}