import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, 
    RefreshCw, 
    Lock, 
    Unlock, 
    Archive, 
    ClipboardList,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';

import CreatePassationForm from './CreatePassationForm';
import PassationList from './PassationList';
import {
    ReactivateCodeForm,
    RelaunchPassationForm,
    ClosePassationForm,
    ReopenPassationForm,
    ArchivePassationForm
} from './PassationOperations';

import ViewPassationDetails from './ViewPassationDetails';
import { api } from '../services/api';

export default function PassationDashboard() {
    const [passations, setPassations] = useState([]);
    const [selectedPassation, setSelectedPassation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [error, setError] = useState(null);

    const loadPassations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getPassations();
            setPassations(data);
        } catch (err) {
            console.error("Erreur:", err);
            setError("Erreur lors du chargement des passations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPassations();
    }, []);

    const handlePassationCreated = () => {
        setActiveTab('list');
        loadPassations();
    };

    const handleViewPassation = (passation) => {
        setSelectedPassation(passation);
        setActiveTab('view');
    };

    const handleBack = () => {
        setSelectedPassation(null);
        setActiveTab('list');
        loadPassations();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Gestion des Passations</h2>
                    <p className="text-muted-foreground mt-1">
                        Système TEDP 2.0 - Questionnaires et codes d'accès
                    </p>
                </div>
                {activeTab === 'list' && (
                    <Button 
                        onClick={() => setActiveTab('create')}
                        size="lg"
                        className="gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Nouvelle Passation
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="list" className="gap-2">
                        <ClipboardList className="h-4 w-4" />
                        <span className="hidden sm:inline">Passations</span>
                    </TabsTrigger>
                    <TabsTrigger value="create" className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Créer</span>
                    </TabsTrigger>
                    <TabsTrigger value="reactivate" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Réactiver</span>
                    </TabsTrigger>
                    <TabsTrigger value="relaunch" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Relancer</span>
                    </TabsTrigger>
                    <TabsTrigger value="close" className="gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Fermer</span>
                    </TabsTrigger>
                    <TabsTrigger value="reopen" className="gap-2">
                        <Unlock className="h-4 w-4" />
                        <span className="hidden sm:inline">Rouvrir</span>
                    </TabsTrigger>
                    <TabsTrigger value="archive" className="gap-2">
                        <Archive className="h-4 w-4" />
                        <span className="hidden sm:inline">Archiver</span>
                    </TabsTrigger>
                </TabsList>

                {/* List Passations */}
                <TabsContent value="list">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <PassationList 
                            passations={passations}
                            onView={handleViewPassation}
                            onRefresh={loadPassations}
                        />
                    )}
                </TabsContent>

                {/* View Passation Details */}
                <TabsContent value="view">
                    {selectedPassation && (
                        <ViewPassationDetails
                            passation={selectedPassation}
                            onBack={handleBack}
                        />
                    )}
                </TabsContent>

                {/* Create Passation */}
                <TabsContent value="create">
                    <CreatePassationForm 
                        onSuccess={handlePassationCreated}
                        onCancel={() => setActiveTab('list')}
                    />
                </TabsContent>

                {/* Reactivate Code */}
                <TabsContent value="reactivate">
                    <ReactivateCodeForm onSuccess={loadPassations} />
                </TabsContent>

                {/* Relaunch Passation */}
                <TabsContent value="relaunch">
                    <RelaunchPassationForm 
                        passations={passations.filter(p => !p.isArchived)}
                        onSuccess={loadPassations}
                    />
                </TabsContent>

                {/* Close Passation */}
                <TabsContent value="close">
                    <ClosePassationForm 
                        passations={passations.filter(p => p.isActive && !p.isClosed)}
                        onSuccess={loadPassations}
                    />
                </TabsContent>

                {/* Reopen Passation */}
                <TabsContent value="reopen">
                    <ReopenPassationForm 
                        passations={passations.filter(p => p.isClosed && !p.isArchived)}
                        onSuccess={loadPassations}
                    />
                </TabsContent>

                {/* Archive Passation */}
                <TabsContent value="archive">
                    <ArchivePassationForm 
                        passations={passations.filter(p => !p.isArchived)}
                        onSuccess={loadPassations}
                    />
                </TabsContent>
            </Tabs>

            {/* Stats Summary */}
            {activeTab === 'list' && passations.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Passations</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{passations.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Passations Actives</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {passations.filter(p => p.isActive).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {passations.reduce((sum, p) => sum + p.totalCodes, 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Codes Utilisés</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {passations.reduce((sum, p) => sum + p.codesUsed, 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
