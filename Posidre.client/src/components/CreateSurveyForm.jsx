import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, Download, Info, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function CreateSurveyForm({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        classNumber: '',
        studentCount: '',
        schoolYear: getCurrentSchoolYear(),
        teacherEmail: ''
    });
    
    const [creating, setCreating] = useState(false);
    const [createdSurvey, setCreatedSurvey] = useState(null);
    const [error, setError] = useState(null);

    function getCurrentSchoolYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 0-indexed
        
        // If we're between Jan-Aug, school year is (year-1)-(year)
        // If we're between Sep-Dec, school year is (year)-(year+1)
        if (month >= 9) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.classNumber.trim()) {
            setError("Veuillez entrer le numéro de classe");
            return;
        }
        
        const count = parseInt(formData.studentCount);
        if (!count || count < 1 || count > 100) {
            setError("Le nombre d'élèves doit être entre 1 et 100");
            return;
        }

        if (!formData.teacherEmail.trim() || !formData.teacherEmail.includes('@')) {
            setError("Veuillez entrer une adresse email valide");
            return;
        }

        setCreating(true);
        try {
            const response = await api.createSchoolAdminSurvey({
                classNumber: formData.classNumber.trim(),
                studentCount: count,
                schoolYear: formData.schoolYear,
                teacherEmail: formData.teacherEmail.trim()
            });

            setCreatedSurvey(response);
        } catch (err) {
            console.error("Erreur création:", err);
            setError(err.message || "Erreur lors de la création du questionnaire");
        } finally {
            setCreating(false);
        }
    };

    const handleDownloadCSV = () => {
        if (createdSurvey?.surveyId) {
            window.location.href = `/api/schooladmin/surveys/${createdSurvey.surveyId}/export-correspondence`;
        }
    };

    const handleClose = () => {
        setCreatedSurvey(null);
        setFormData({
            classNumber: '',
            studentCount: '',
            schoolYear: getCurrentSchoolYear(),
            teacherEmail: ''
        });
        onSuccess();
    };

    // Success Modal
    if (createdSurvey) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Questionnaire créé!</CardTitle>
                        <CardDescription>
                            {createdSurvey.totalPins} codes PIN ont été générés
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 text-center">
                            <p className="text-sm text-muted-foreground mb-2">Classe</p>
                            <p className="text-2xl font-bold text-primary">
                                {createdSurvey.classNumber}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {createdSurvey.totalPins} élèves
                            </p>
                        </div>

                        <Button
                            onClick={handleDownloadCSV}
                            className="w-full"
                            size="lg"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Télécharger la table de correspondance (CSV)
                        </Button>

                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                Le fichier CSV contient tous les codes PIN. Envoyez-le à l'enseignant 
                                pour qu'il/elle puisse les distribuer aux élèves.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={handleClose}
                            className="w-full"
                            variant="outline"
                        >
                            Retour au tableau de bord
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Form
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Créer un nouveau questionnaire</CardTitle>
                <CardDescription>
                    Remplissez les informations pour générer les codes PIN uniques
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="classNumber">
                            Numéro de classe <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="classNumber"
                            name="classNumber"
                            placeholder="Ex: 6A, Sec 3, 10B"
                            value={formData.classNumber}
                            onChange={handleChange}
                            disabled={creating}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Identifiant de la classe (ex: 6A, Secondaire 3, etc.)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studentCount">
                            Nombre d'élèves <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="studentCount"
                            name="studentCount"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="Ex: 25"
                            value={formData.studentCount}
                            onChange={handleChange}
                            disabled={creating}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Un code PIN unique sera généré pour chaque élève (max: 100)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="schoolYear">
                            Année scolaire <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="schoolYear"
                            name="schoolYear"
                            placeholder="Ex: 2024-2025"
                            value={formData.schoolYear}
                            onChange={handleChange}
                            disabled={creating}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Année scolaire pour ce questionnaire
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="teacherEmail">
                            Email de l'enseignant <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="teacherEmail"
                            name="teacherEmail"
                            type="email"
                            placeholder="enseignant@ecole.com"
                            value={formData.teacherEmail}
                            onChange={handleChange}
                            disabled={creating}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            L'enseignant recevra la table de correspondance des codes PIN
                        </p>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>Important:</strong> Le questionnaire TEDP 2.0 contient 20 questions. 
                            Les codes PIN générés seront uniques et ne pourront être utilisés qu'une seule fois par passation.
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={creating}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating}
                            className="flex-1"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Créer le questionnaire
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
