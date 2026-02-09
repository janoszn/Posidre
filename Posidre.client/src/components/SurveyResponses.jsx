import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { List, BarChart3, Download, Users, CheckCircle2, Clock, Trash2 } from 'lucide-react';

export default function SurveyResponses({ submissions, survey, onDelete, onDownloadCSV }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('fr-CA', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Survey Header Stats */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{survey.classNumber} - {survey.schoolYear}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enseignant: {survey.teacherEmail}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDownloadCSV(survey.id)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger CSV
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(survey.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">{survey.studentCount}</p>
                                <p className="text-xs text-muted-foreground">Élèves totaux</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{survey.usedPins}</p>
                                <p className="text-xs text-muted-foreground">Réponses reçues</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-2xl font-bold">{survey.totalPins - survey.usedPins}</p>
                                <p className="text-xs text-muted-foreground">En attente</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for Responses and Stats */}
            {submissions.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Aucune réponse pour le moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="responses" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="responses" className="flex items-center gap-2 hover:bg-background/50">
                            <List className="h-4 w-4" />
                            Réponses
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center gap-2 hover:bg-background/50">
                            <BarChart3 className="h-4 w-4" />
                            Statistiques
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="responses" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {submissions.length} réponse(s)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Cliquez sur un PIN pour voir les réponses
                            </p>
                        </div>

                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {submissions.map((submission, index) => (
                                <AccordionItem
                                    key={submission.id}
                                    value={submission.id.toString()}
                                    className="border rounded-lg bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md overflow-hidden"
                                >
                                    <AccordionTrigger className="font-semibold px-4 hover:no-underline group">
                                        <div className="flex items-center gap-3 w-full">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 flex items-center gap-3 text-left">
                                                <Badge variant="outline" className="font-mono">
                                                    PIN: {submission.pinUsed}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                                                    {formatDate(submission.submittedAt)}
                                                </span>
                                            </div>
                                            <Badge className="group-hover:bg-primary/20">
                                                {submission.answers.length} réponse(s)
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-4 pt-2">
                                            {submission.answers.map((answer, idx) => (
                                                <div
                                                    key={answer.id}
                                                    className="space-y-2 p-3 bg-muted/50 rounded-lg border-l-4 border-primary/30"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                            {idx + 1}
                                                        </span>
                                                        <p className="text-sm font-medium text-primary flex-1">
                                                            {answer.questionText}
                                                        </p>
                                                    </div>
                                                    <p className="text-base pl-8 text-foreground">
                                                        {answer.value}
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
            )}
        </div>
    );
}