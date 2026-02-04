import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { List, BarChart3, Trash2, AlertTriangle } from 'lucide-react';

export default function SurveyAnswers({ submissions, survey, onDelete }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await onDelete(survey.id);
            // Le parent (TeacherContent) gère la navigation
        } catch (err) {
            setDeleting(false);
            // L'erreur est déjà gérée par le parent
        }
    };

    if (submissions.length === 0) {
        return (
            <div className="space-y-4">
                {/* Message vide */}
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Aucune réponse pour le moment.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Partagez le code PIN <span className="font-mono font-semibold text-primary">{survey.pinCode}</span> avec vos élèves.
                        </p>
                    </CardContent>
                </Card>

                {/* Bouton supprimer */}
                <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer le questionnaire
                </Button>

                {/* Modal de confirmation */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Confirmer la suppression</CardTitle>
                                        <CardDescription>Cette action est irréversible</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        Êtes-vous sûr de vouloir supprimer ce questionnaire? Toutes les données seront perdues définitivement.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1"
                                        disabled={deleting}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="flex-1"
                                        disabled={deleting}
                                    >
                                        {deleting ? 'Suppression...' : 'Supprimer'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Tabs defaultValue="responses" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="responses" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Réponses
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Statistiques
                    </TabsTrigger>
                </TabsList>

                {/* Responses tab */}
                <TabsContent value="responses" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {submissions.length} élève(s) ont répondu
                    </p>

                    <Accordion type="single" collapsible className="w-full">
                        {submissions.map((sub) => (
                            <AccordionItem key={sub.id} value={sub.id.toString()}>
                                <AccordionTrigger className="font-semibold">
                                    {sub.studentName}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 pt-2">
                                        {sub.answers.map((a) => (
                                            <div key={a.id} className="space-y-1">
                                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                    {a.questionText}
                                                </p>
                                                <p className="text-base">{a.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </TabsContent>

                {/* Statistics tab */}
                <TabsContent value="stats">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analyse des données</CardTitle>
                            <CardDescription>
                                Les graphiques de synthèse s'afficheront ici bientôt.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                                <p className="text-slate-400">Chart placeholder</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Bouton supprimer en bas */}
            <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le questionnaire
            </Button>

            {/* Modal de confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <CardTitle>Confirmer la suppression</CardTitle>
                                    <CardDescription>Cette action est irréversible</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {submissions.length > 0
                                        ? `Êtes-vous sûr de vouloir supprimer ce questionnaire? Les ${submissions.length} réponse(s) seront perdues définitivement.`
                                        : "Êtes-vous sûr de vouloir supprimer ce questionnaire? Cette action est irréversible."
                                    }
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1"
                                    disabled={deleting}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="flex-1"
                                    disabled={deleting}
                                >
                                    {deleting ? 'Suppression...' : 'Supprimer'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}