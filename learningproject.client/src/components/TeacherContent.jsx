import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from 'lucide-react';
import SurveyAnswers from './SurveyAnswers';
import { api } from '../services/api';

export default function TeacherContent() {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

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

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : selectedSurvey ? (
                <SurveyAnswers submissions={submissions} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {surveys.map((s) => (
                        <Card
                            key={s.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleSelectSurvey(s)}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">{s.title}</CardTitle>
                                <CardDescription>Code PIN: {s.pinCode}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}