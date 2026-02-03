import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, BarChart3 } from 'lucide-react';

export default function SurveyAnswers({ submissions }) {
    if (submissions.length === 0) {
        return (
            <p className="text-slate-500 mt-4">Aucune réponse pour le moment.</p>
        );
    }

    return (
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
                <p className="text-sm text-slate-500">
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
    );
}