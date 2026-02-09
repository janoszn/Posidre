import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, Plus, ClipboardList, Download, Info, Calendar, Users, CheckCircle2 } from 'lucide-react';
import CreateSurveyForm from './CreateSurveyForm';
import SurveyResponses from './SurveyResponses';
import { api } from '../services/api';

export default function SchoolAdminContent() {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const loadSurveys = async () => {
        setLoading(true);
        try {
            const data = await api.getSchoolAdminSurveys();
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
            const data = await api.getSchoolAdminSubmissions(survey.id);
            setSubmissions(data);
            setSelectedSurvey(survey);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCSV = (surveyId) => {
        // Trigger CSV download
        window.location.href = `/api/schooladmin/surveys/${surveyId}/export-correspondence`;
    };

    const handleDeleteSurvey = async (surveyId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce questionnaire et toutes ses réponses ?')) {
            return;
        }

        try {
            await api.deleteSchoolAdminSurvey(surveyId);
            setSelectedSurvey(null);
            await loadSurveys();
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            alert("Erreur lors de la suppression du questionnaire");
        }
    };

    const handleSurveyCreated = () => {
        setShowCreateForm(false);
        loadSurveys();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
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
                {(selectedSurvey || showCreateForm) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedSurvey(null);
                            setShowCreateForm(false);
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <h2 className="text-2xl font-bold">
                    {selectedSurvey 
                        ? `${selectedSurvey.classNumber} - ${selectedSurvey.schoolYear}`
                        : showCreateForm 
                        ? "Créer un questionnaire"
                        : "Mes Questionnaires"}
                </h2>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : showCreateForm ? (
                <CreateSurveyForm 
                    onSuccess={handleSurveyCreated}
                    onCancel={() => setShowCreateForm(false)}
                />
            ) : selectedSurvey ? (
                <SurveyResponses
                    submissions={submissions}
                    survey={selectedSurvey}
                    onDelete={handleDeleteSurvey}
                    onDownloadCSV={handleDownloadCSV}
                />
            ) : (
                <div className="space-y-4">
                    {/* Existing surveys */}
                    {surveys.map((survey) => (
                        <Card
                            key={survey.id}
                            className="cursor-pointer hover:bg-accent/90 hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
                            onClick={() => handleSelectSurvey(survey)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                        <ClipboardList className="h-6 w-6 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                            {survey.classNumber} - {survey.schoolYear}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {survey.studentCount} élèves
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {survey.usedPins}/{survey.totalPins} complétés
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(survey.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Enseignant: {survey.teacherEmail}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadCSV(survey.id);
                                            }}
                                            className="whitespace-nowrap"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            CSV
                                        </Button>
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
                        className="cursor-pointer transition-all duration-300 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-orange-50 dark:from-primary/10 dark:to-orange-950/20 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                        onClick={() => setShowCreateForm(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center gap-4 py-4">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <Plus className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="font-semibold text-lg">Créer un questionnaire TEDP 2.0</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Générez des codes PIN uniques pour vos élèves
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
