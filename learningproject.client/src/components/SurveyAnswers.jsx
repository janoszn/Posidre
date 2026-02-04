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
        } catch (err) {
            setDeleting(false);
        }
    };

    if (submissions.length === 0) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Aucune réponse pour le moment.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Partagez le code PIN <span className="font-mono font-semibold text-primary">{survey.pinCode}</span> avec vos élèves.
                        </p>
                    </CardContent>
                </Card>

                <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer le questionnaire
                </Button>

                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="bg-destructive/10 p-2 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-destructive" />
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

                <TabsContent value="responses" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {submissions.length} élève(s) ont répondu
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Cliquez sur un nom pour voir les réponses
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {submissions.map((sub, index) => (
                            <AccordionItem
                                key={sub.id}
                                value={sub.id.toString()}
                                className="border rounded-lg bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md overflow-hidden"
                            >
                                <AccordionTrigger className="font-semibold px-4 hover:no-underline group">
                                    <div className="flex items-center gap-3 w-full">

                                        <span className="flex-1 text-left group-hover:text-primary transition-colors">
                                            {sub.studentName}
                                        </span>

                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-4 pt-2">
                                        {sub.answers.map((a, idx) => (
                                            <div
                                                key={a.id}
                                                className="space-y-2 p-3 bg-muted/50 rounded-lg border-l-4 border-primary/30"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                        {idx + 1}
                                                    </span>
                                                    <p className="text-sm font-medium text-primary flex-1">
                                                        {a.questionText}
                                                    </p>
                                                </div>
                                                <p className="text-base pl-8 text-foreground">
                                                    {a.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </TabsContent>

                <TabsContent value="stats">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analyse des données</CardTitle>
                            <CardDescription>
                                Les graphiques de synthèse s'afficheront ici bientôt.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">Chart placeholder</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le questionnaire
            </Button>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="bg-destructive/10 p-2 rounded-full">
                                    <AlertTriangle className="h-6 w-6 text-destructive" />
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