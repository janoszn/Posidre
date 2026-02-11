import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, Plus, ClipboardList, Copy, Check, Info, Calendar } from 'lucide-react';
import ViewPassationDetails from './ViewPassationDetails';
import { api } from '../services/api';

export default function TeacherContent() {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newSurvey, setNewSurvey] = useState(null);
    const [copied, setCopied] = useState(false);

    const loadSurveys = async () => {
        setLoading(true);
        try {
            const data = await api.getTeacherSurveys();
            setSurveys(data);
        } catch (err) {
            console.error("Erreur:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSurveys();
    }, []);

    const handleSelectSurvey = async (survey) => {
        setLoading(true);
        try {
            const data = await api.getSurveySubmissions(survey.id);
            setSubmissions(data);
            setSelectedSurvey(survey);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSurvey = async () => {
        if (creating) return;

        setCreating(true);
        try {
            const response = await api.createSurvey();
            // debug: console.log("Data reçue:", response);

            // Si ton API renvoie directement l'objet (response.data ou response selon ton instance axios/api)
            setNewSurvey(response);

            // Rafraîchir la liste en arrière-plan
            loadSurveys();
        } catch (err) {
            console.error("Erreur creation:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteSurvey = async (surveyId) => {
        try {
            await api.deleteSurvey(surveyId);
            // Retourne à la liste et recharge
            setSelectedSurvey(null);
            await loadSurveys();
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            alert("Erreur lors de la suppression du questionnaire");
        }
    };

    const handleCopyPin = () => {
        if (newSurvey?.pinCode) {
            navigator.clipboard.writeText(newSurvey.pinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const closeModal = () => {
        setNewSurvey(null);
        setCopied(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return '';
            }

            return date.toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date parsing error:', error);
            return '';
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                {selectedSurvey && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSurvey(null)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <h2 className="text-2xl font-bold">
                    {selectedSurvey ? selectedSurvey.title : "Mes Questionnaires"}
                </h2>
            </div>

            {/* Modal de succès */}
            {newSurvey && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-2xl">Questionnaire créé!</CardTitle>
                            <CardDescription>
                                Partagez ce code avec vos élèves
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Code PIN</p>
                                <p className="text-5xl font-bold font-mono text-primary tracking-wider">
                                    {newSurvey.pinCode}
                                </p>
                            </div>

                            <Button
                                onClick={handleCopyPin}
                                className="w-full"
                                variant="outline"
                            >
                                {copied ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Copié!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copier le code
                                    </>
                                )}
                            </Button>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    Les élèves peuvent entrer ce code sur la page de connexion pour accéder au questionnaire.
                                </AlertDescription>
                            </Alert>

                            <Button
                                onClick={closeModal}
                                className="w-full"
                                variant="default"
                            >
                                Compris
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : selectedSurvey ? (
                    <ViewPassationDetails
                    submissions={submissions}
                    survey={selectedSurvey}
                    onDelete={handleDeleteSurvey}
                />
            ) : (
                <div className="space-y-4">
                    {/* Existing surveys */}
                    {surveys.map((s) => (
                        <Card
                            key={s.id}
                            className="cursor-pointer hover:bg-accent/90 hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
                            onClick={() => handleSelectSurvey(s)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                        <ClipboardList className="h-6 w-6 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0 group-hover:text-primary transition-colors" >
                                        <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="font-mono font-semibold group-hover:text-primary transition-colors">
                                                PIN: {s.pinCode}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(s.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Create new survey card */}
                    <Card
                        className={`
              cursor-pointer transition-all duration-300 
              border-2 border-dashed border-primary/30 
              bg-gradient-to-br from-primary/5 to-orange-50 
              dark:from-primary/10 dark:to-orange-950/20
              ${creating
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:border-primary hover:shadow-lg hover:shadow-primary/10'
                            }
            `}
                        onClick={handleCreateSurvey}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center gap-4 py-4">
                                {creating ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">Création en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <Plus className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h3 className="font-semibold text-lg">Créer un questionnaire TEDP 2.0</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Génère un nouveau code PIN pour vos élèves
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}