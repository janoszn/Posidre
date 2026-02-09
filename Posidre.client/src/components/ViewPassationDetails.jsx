import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ArrowLeft, 
    Download, 
    Users, 
    ClipboardList,
    CheckCircle2,
    Clock,
    Loader2
} from 'lucide-react';
import { api } from '../services/api';

export default function ViewPassationDetails({ passation, onBack }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSubmissions();
    }, [passation.id]);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const data = await api.getPassationSubmissions(passation.id);
            setSubmissions(data);
        } catch (err) {
            console.error("Erreur:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const handleDownloadCSV = () => {
        window.location.href = `/api/passation/${passation.id}/export-codes`;
    };

    // Group submissions by group and measurement time
    const submissionsByGroup = {};
    submissions.forEach(sub => {
        if (!submissionsByGroup[sub.groupName]) {
            submissionsByGroup[sub.groupName] = [];
        }
        submissionsByGroup[sub.groupName].push(sub);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{passation.title}</h2>
                    <p className="text-muted-foreground">{passation.schoolYear}</p>
                </div>
                <Button variant="outline" onClick={handleDownloadCSV} className="gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger CSV
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Groupes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{passation.totalGroups}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Codes Utilisés</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{passation.codesUsed}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {((passation.codesUsed / passation.totalCodes) * 100).toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{passation.codesAvailable}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="groups" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="groups">Par Groupes</TabsTrigger>
                    <TabsTrigger value="submissions">Soumissions ({submissions.length})</TabsTrigger>
                    <TabsTrigger value="info">Informations</TabsTrigger>
                </TabsList>

                {/* Groups Tab */}
                <TabsContent value="groups">
                    <div className="grid gap-4 md:grid-cols-2">
                        {passation.groupStats?.map(group => (
                            <Card key={group.groupId}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{group.groupName}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Codes total:</span>
                                            <span className="font-medium">{group.totalCodes}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Codes utilisés:</span>
                                            <span className="font-medium text-green-600">{group.codesUsed}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Taux de complétion:</span>
                                            <span className="font-medium">
                                                {((group.codesUsed / group.totalCodes) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Show submissions for this group */}
                                    {submissionsByGroup[group.groupName] && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm font-medium mb-2">
                                                Soumissions: {submissionsByGroup[group.groupName].length}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Submissions Tab */}
                <TabsContent value="submissions">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                Aucune soumission pour le moment
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                                    <Accordion type="single" collapsible className="w-full space-y-3">
                                        {submissions.map((submission, index) => (
                                            <AccordionItem
                                                key={submission.id}
                                                value={submission.id.toString()}
                                                className="border rounded-lg bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md overflow-hidden"
                                            >
                                                <AccordionTrigger className="font-semibold px-4 hover:no-underline group">
                                                    <div className="flex items-center gap-3 w-full">
                                                        {/* Index Circle */}
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                            {index + 1}
                                                        </span>

                                                        <div className="flex-1 flex flex-wrap items-center gap-2 text-left">
                                                            {/* PIN Badge */}
                                                            <Badge variant="outline" className="font-mono">
                                                                PIN: {submission.pin}
                                                            </Badge>

                                                            {/* Group Badge */}
                                                            <Badge variant="secondary">
                                                                {submission.groupName}
                                                            </Badge>

                                                            {/* Time Badge */}
                                                            <Badge variant="default">
                                                                T{submission.measurementTime}
                                                            </Badge>

                                                            {/* Date Label */}
                                                            <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors ml-auto pr-4">
                                                                {formatDate(submission.submittedAt)}
                                                            </span>
                                                        </div>

                                                        {/* Total Answers Count */}
                                                        <Badge variant="outline" className="hidden sm:flex group-hover:bg-primary/20">
                                                            {submission.answers.length} réponse(s)
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>

                                                <AccordionContent className="px-4 pb-4">
                                                    <div className="space-y-4 pt-2">
                                                        {submission.answers.map((answer, idx) => (
                                                            <div
                                                                key={answer.questionId || idx}
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
                                                                <p className="text-base pl-8 text-foreground font-medium">
                                                                    {answer.value}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                        </div>
                    )}
                </TabsContent>

                {/* Info Tab */}
                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations de la Passation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">Titre</Label>
                                <p className="font-medium">{passation.title}</p>
                            </div>

                            {passation.description && (
                                <div>
                                    <Label className="text-sm text-muted-foreground">Description</Label>
                                    <p className="font-medium">{passation.description}</p>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm text-muted-foreground">Année scolaire</Label>
                                <p className="font-medium">{passation.schoolYear}</p>
                            </div>

                            <div>
                                <Label className="text-sm text-muted-foreground">Date de création</Label>
                                <p className="font-medium">{formatDate(passation.createdAt)}</p>
                            </div>

                            <div>
                                <Label className="text-sm text-muted-foreground">Statut</Label>
                                <div className="flex gap-2 mt-1">
                                    {passation.isActive && !passation.isClosed && (
                                        <Badge variant="default">Active</Badge>
                                    )}
                                    {passation.isClosed && (
                                        <Badge variant="secondary">Fermée</Badge>
                                    )}
                                    {!passation.isActive && !passation.isClosed && (
                                        <Badge variant="outline">Inactive</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Label({ children, className = '' }) {
    return <div className={`text-sm font-medium ${className}`}>{children}</div>;
}
