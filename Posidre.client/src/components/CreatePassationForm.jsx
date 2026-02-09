import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Check, Download, Info, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useEffect } from 'react';

export default function CreatePassationForm({ onSuccess, onCancel }) {
    const [step, setStep] = useState(1); // 1 = select passation, 2 = fill details
    const [mode, setMode] = useState('new'); // 'new' or 'existing'
    const [existingPassationId, setExistingPassationId] = useState(null);
    const [numberOfGroups, setNumberOfGroups] = useState(1);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        schoolYear: getCurrentSchoolYear(),
        teacherEmail: '',
        groups: [{ groupName: '', studentCount: 35, order: 1 }]
    });
    
    const [creating, setCreating] = useState(false);
    const [createdPassation, setCreatedPassation] = useState(null);
    const [error, setError] = useState(null);
    const [existingPassations, setExistingPassations] = useState([]);

    const loadExistingPassations = async () => {
        try {
            const data = await api.getPassations();
            setExistingPassations(data.filter(p => !p.isArchived));
        } catch (err) {
            console.error("Erreur chargement passations:", err);
        }
    };

    // Load existing passations on mount
    useEffect(() => {
        loadExistingPassations();
    }, []);



    function getCurrentSchoolYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        if (month >= 9) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    }

    const handleContinue = () => {
        if (mode === 'existing' && !existingPassationId) {
            setError("Veuillez sélectionner une passation");
            return;
        }

        if (numberOfGroups < 1 || numberOfGroups > 20) {
            setError("Le nombre de groupes doit être entre 1 et 20");
            return;
        }

        // Create group array based on number selected
        const groups = Array.from({ length: numberOfGroups }, (_, i) => ({
            groupName: '',
            studentCount: 35,
            order: i + 1
        }));

        setFormData(prev => ({ ...prev, groups }));
        setError(null);
        setStep(2);
    };

    const handleGroupChange = (index, field, value) => {
        setFormData(prev => {
            const newGroups = [...prev.groups];
            newGroups[index] = {
                ...newGroups[index],
                [field]: field === 'studentCount' ? parseInt(value) || 0 : value
            };
            return { ...prev, groups: newGroups };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (mode === 'new' && !formData.title.trim()) {
            setError("Le titre est requis");
            return;
        }

        const invalidGroups = formData.groups.filter(
            g => !g.groupName.trim() || g.studentCount < 1 || g.studentCount > 100
        );

        if (invalidGroups.length > 0) {
            setError("Tous les groupes doivent avoir un nom et un nombre d'élèves entre 1 et 100");
            return;
        }

        setCreating(true);

        try {
            let response;

            if (mode === 'new') {
                // Create new passation
                response = await api.createPassation({
                    questionnaireId: 1, // TEDP 2.0 (hardcoded for now)
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    schoolYear: formData.schoolYear,
                    teacherEmail: formData.teacherEmail.trim() || null,
                    groups: formData.groups.map(g => ({
                        groupName: g.groupName.trim(),
                        studentCount: g.studentCount,
                        order: g.order
                    }))
                });
            } else {
                // Add codes to existing passation
                response = await api.addCodesToPassation({
                    passationId: existingPassationId,
                    groups: formData.groups.map(g => ({
                        groupName: g.groupName.trim(),
                        studentCount: g.studentCount,
                        order: g.order
                    }))
                });
            }

            setCreatedPassation(response);
        } catch (err) {
            console.error("Erreur création:", err);
            setError(err.message || "Erreur lors de la création");
        } finally {
            setCreating(false);
        }
    };

    const handleDownloadCSV = () => {
        if (createdPassation?.passationId) {
            window.location.href = `/api/passation/${createdPassation.passationId}/export-codes`;
        }
    };

    const handleClose = () => {
        setCreatedPassation(null);
        setFormData({
            title: '',
            description: '',
            schoolYear: getCurrentSchoolYear(),
            teacherEmail: '',
            groups: [{ groupName: '', studentCount: 35, order: 1 }]
        });
        setStep(1);
        setMode('new');
        setNumberOfGroups(1);
        onSuccess();
    };

    // Success Modal
    if (createdPassation) {
        const totalCodes = createdPassation.groupCodes.reduce(
            (sum, g) => sum + g.codes.length, 
            0
        );

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Codes Générés!</CardTitle>
                        <CardDescription>
                            {totalCodes} codes ont été créés pour {createdPassation.groupCodes.length} groupe(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Display codes by group */}
                        {createdPassation.groupCodes.map((group) => (
                            <div key={group.groupId} className="space-y-2">
                                <h3 className="font-semibold text-lg border-b pb-2">
                                    Groupe: {group.groupName} ({group.codes.length} codes)
                                </h3>
                                <div className="grid grid-cols-5 gap-2 text-center font-mono text-sm">
                                    {group.codes.map((code, idx) => (
                                        <div 
                                            key={idx}
                                            className="bg-primary/10 border border-primary/30 rounded p-2"
                                        >
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                <strong>Important:</strong> Téléchargez le fichier CSV et remettez-le à l'enseignant. 
                                L'enseignant pourra associer chaque code à un élève.
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-4">
                            <Button
                                onClick={handleDownloadCSV}
                                className="flex-1"
                                size="lg"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Télécharger CSV
                            </Button>

                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="flex-1"
                                size="lg"
                            >
                                Fermer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Step 1: Select Mode and Number of Groups
    if (step === 1) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Création des Codes</CardTitle>
                    <CardDescription>
                        Étape 1: Choisissez le type de passation
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Mode Selection */}
                    <div className="space-y-4">
                        <Label>Choisissez la passation</Label>
                        
                        <div className="space-y-3">
                            <div 
                                onClick={() => setMode('new')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    mode === 'new' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        mode === 'new' ? 'border-primary' : 'border-muted-foreground'
                                    }`}>
                                        {mode === 'new' && (
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">[Nouvelle passation]</p>
                                        <p className="text-sm text-muted-foreground">
                                            Créer une nouvelle passation avec de nouveaux codes
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div 
                                onClick={() => setMode('existing')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    mode === 'existing' 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        mode === 'existing' ? 'border-primary' : 'border-muted-foreground'
                                    }`}>
                                        {mode === 'existing' && (
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">Ajouter à une passation existante</p>
                                        <p className="text-sm text-muted-foreground">
                                            Ajouter des groupes/codes à une passation déjà créée
                                        </p>
                                    </div>
                                </div>
                                
                                {mode === 'existing' && (
                                    <div className="mt-3 pl-7">
                                        <Select 
                                            value={existingPassationId?.toString()} 
                                            onValueChange={(value) => setExistingPassationId(parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une passation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {existingPassations.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.title} ({p.schoolYear})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Number of Groups */}
                    <div className="space-y-2">
                        <Label htmlFor="numberOfGroups">
                            Nombre de groupes <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="numberOfGroups"
                            type="number"
                            min="1"
                            max="20"
                            value={numberOfGroups}
                            onChange={(e) => setNumberOfGroups(parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Déterminez le nombre de groupes pour l'analyse ultérieure (ex: 7 classes = 7 groupes)
                        </p>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>Conseil:</strong> Si vous évaluez 7 classes de secondaire 1, créez 7 groupes. 
                            Cela permettra une analyse par classe ET globale.
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={handleContinue}
                            className="flex-1"
                        >
                            Continuer
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Step 2: Fill Details
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>
                    {mode === 'new' ? 'Nouvelle Passation' : 'Ajouter des Codes'}
                </CardTitle>
                <CardDescription>
                    Étape 2: Remplissez les détails
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

                    {mode === 'new' && (
                        <>
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Titre de la passation
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Ex: Secondaire 1 - Automne 2024"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Si vide, la date sera utilisée comme titre
                                </p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optionnel)</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            {/* School Year */}
                            <div className="space-y-2">
                                <Label htmlFor="schoolYear">Année scolaire</Label>
                                <Input
                                    id="schoolYear"
                                    value={formData.schoolYear}
                                    onChange={(e) => setFormData(prev => ({ ...prev, schoolYear: e.target.value }))}
                                    placeholder="2024-2025"
                                />
                            </div>

                            {/* Teacher Email */}
                            <div className="space-y-2">
                                <Label htmlFor="teacherEmail">Email de l'enseignant (optionnel)</Label>
                                <Input
                                    id="teacherEmail"
                                    type="email"
                                    value={formData.teacherEmail}
                                    onChange={(e) => setFormData(prev => ({ ...prev, teacherEmail: e.target.value }))}
                                    placeholder="enseignant@ecole.com"
                                />
                            </div>
                        </>
                    )}

                    {/* Groups */}
                    <div className="space-y-4">
                        <Label className="text-lg">Groupes ({formData.groups.length})</Label>
                        
                        {formData.groups.map((group, index) => (
                            <Card key={index} className="p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor={`group-${index}-name`}>
                                            Nom du groupe {index + 1} <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`group-${index}-name`}
                                            value={group.groupName}
                                            onChange={(e) => handleGroupChange(index, 'groupName', e.target.value)}
                                            placeholder="Ex: 6A, Classe de Mme Tremblay"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor={`group-${index}-count`}>
                                            Nombre d'élèves <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`group-${index}-count`}
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={group.studentCount}
                                            onChange={(e) => handleGroupChange(index, 'studentCount', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            Le système va générer automatiquement les codes pour chaque groupe. 
                            Les codes seront uniques et réutilisables jusqu'à 4 fois (4 temps de mesure).
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            disabled={creating}
                            className="flex-1"
                        >
                            Retour
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating}
                            className="flex-1"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Générer les codes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
