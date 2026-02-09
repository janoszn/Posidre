// ==================== ReactivateCodeForm.jsx ====================
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function ReactivateCodeForm({ onSuccess }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (code.length !== 6) {
            setError("Le code doit contenir 6 chiffres");
            return;
        }

        setLoading(true);
        try {
            const result = await api.reactivateCode(code);
            setSuccess(`Code ${code} réactivé avec succès. ${result.remainingUses} utilisation(s) restante(s).`);
            setCode('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.message || err.message || "Erreur lors de la réactivation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Réactiver un Code</CardTitle>
                <CardDescription>
                    Réactiver un code individuel pour une nouvelle utilisation
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 dark:text-green-200">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="code">Code PIN (6 chiffres)</Label>
                        <Input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            maxLength={6}
                            className="text-center text-2xl font-mono tracking-wider"
                            disabled={loading}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || code.length !== 6}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Réactivation...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Réactiver le code
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ==================== RelaunchPassationForm.jsx ====================
export function RelaunchPassationForm({ passations, onSuccess }) {
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await api.relaunchPassation(parseInt(selectedId));
            setResult(response);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.message || err.message || "Erreur lors de la relance");
        } finally {
            setLoading(false);
        }
    };

    const selectedPassation = passations.find(p => p.id === parseInt(selectedId));

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Relancer une Passation</CardTitle>
                <CardDescription>
                    Réactiver tous les codes d'une passation pour une nouvelle mesure (T2, T3, T4)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {result && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            <div>
                                <strong>Passation relancée!</strong>
                                <ul className="mt-2 text-sm list-disc list-inside">
                                    <li>{result.codesReactivated} codes réactivés</li>
                                    {result.codesMaxedOut > 0 && (
                                        <li>{result.codesMaxedOut} codes ont atteint le maximum (4 utilisations)</li>
                                    )}
                                </ul>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label>Choisir la passation</Label>
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">-- Sélectionner --</option>
                        {passations.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.title} ({p.schoolYear}) - {p.totalCodes} codes
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPassation && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold">{selectedPassation.title}</h3>
                        <div className="text-sm space-y-1">
                            <p>Année scolaire: {selectedPassation.schoolYear}</p>
                            <p>Total codes: {selectedPassation.totalCodes}</p>
                            <p>Groupes: {selectedPassation.totalGroups}</p>
                        </div>
                        <Alert className="mt-3">
                            <AlertDescription className="text-sm">
                                Tous les codes seront réactivés pour permettre une nouvelle mesure (T2, T3, ou T4)
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={loading || !selectedId}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Relance en cours...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Relancer la passation
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

// ==================== ClosePassationForm.jsx ====================
export function ClosePassationForm({ passations, onSuccess }) {
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    const handleCheck = async () => {
        if (!selectedId) return;

        setChecking(true);
        setError(null);
        try {
            const result = await api.getPassationStatus(parseInt(selectedId));
            setStatus(result);
        } catch (err) {
            setError(err.response?.message || err.message || "Erreur");
        } finally {
            setChecking(false);
        }
    };

    const handleClose = async () => {
        if (!selectedId) return;

        setLoading(true);
        setError(null);
        try {
            await api.closePassation(parseInt(selectedId));
            alert("Passation fermée avec succès");
            setStatus(null);
            setSelectedId('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.message || err.message || "Erreur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Fermer une Passation</CardTitle>
                <CardDescription>
                    Fermer une passation pour consulter les résultats
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label>Sélectionner la passation</Label>
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedId}
                        onChange={(e) => {
                            setSelectedId(e.target.value);
                            setStatus(null);
                        }}
                    >
                        <option value="">-- Sélectionner --</option>
                        {passations.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.title} ({p.schoolYear})
                            </option>
                        ))}
                    </select>
                </div>

                <Button
                    onClick={handleCheck}
                    variant="outline"
                    className="w-full"
                    disabled={!selectedId || checking}
                >
                    {checking ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Vérification...
                        </>
                    ) : (
                        "Vérifier le statut"
                    )}
                </Button>

                {status && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold">Statut: {status.title}</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold">{status.totalCodes}</div>
                                <div className="text-xs text-muted-foreground">Total codes</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{status.codesCompleted}</div>
                                <div className="text-xs text-muted-foreground">Complétés</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">{status.codesUnused}</div>
                                <div className="text-xs text-muted-foreground">Non utilisés</div>
                            </div>
                        </div>

                        {status.unusedCodes && status.unusedCodes.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Codes non utilisés:</p>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {status.unusedCodes.map((c, i) => (
                                        <div key={i} className="text-sm bg-white dark:bg-slate-800 rounded p-2">
                                            {c.code} ({c.groupName})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/10">
                            <AlertDescription className="text-sm">
                                <strong>Attention:</strong> Après fermeture, plus aucun questionnaire ne pourra être complété.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={handleClose}
                            className="w-full"
                            variant="default"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Fermeture...
                                </>
                            ) : (
                                "Fermer la passation"
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ==================== ReopenPassationForm.jsx ====================
export function ReopenPassationForm({ passations, onSuccess }) {
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId) return;

        setLoading(true);
        setError(null);

        try {
            await api.reopenPassation(parseInt(selectedId));
            alert("Passation rouverte avec succès");
            setSelectedId('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.message || err.message || "Erreur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Rouvrir une Passation</CardTitle>
                <CardDescription>
                    Rouvrir une passation fermée pour ajouter des codes ou permettre de nouvelles soumissions
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
                        <Label>Sélectionner la passation</Label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">-- Sélectionner --</option>
                            {passations.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.title} ({p.schoolYear}) - Fermée
                                </option>
                            ))}
                        </select>
                    </div>

                    <Alert>
                        <AlertDescription className="text-sm">
                            Vous pourrez utiliser les codes non complétés ou ajouter de nouveaux codes/groupes.
                        </AlertDescription>
                    </Alert>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !selectedId}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Réouverture...
                            </>
                        ) : (
                            "Rouvrir la passation"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ==================== ArchivePassationForm.jsx ====================
export function ArchivePassationForm({ passations, onSuccess }) {
    const [selectedId, setSelectedId] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const selectedPassation = passations.find(p => p.id === parseInt(selectedId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId || confirmText !== 'SUPPRIMER') return;

        setLoading(true);
        setError(null);

        try {
            await api.archivePassation(parseInt(selectedId));
            alert("Passation archivée (supprimée) avec succès");
            setSelectedId('');
            setConfirmText('');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.message || err.message || "Erreur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto border-destructive/50">
            <CardHeader>
                <CardTitle className="text-destructive">Archiver une Passation</CardTitle>
                <CardDescription>
                    Supprimer définitivement une passation et toutes ses données
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
                        <Label>Sélectionner la passation</Label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedId}
                            onChange={(e) => {
                                setSelectedId(e.target.value);
                                setConfirmText('');
                            }}
                            disabled={loading}
                        >
                            <option value="">-- Sélectionner --</option>
                            {passations.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.title} ({p.schoolYear})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPassation && (
                        <>
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>ATTENTION:</strong> Cette action est IRRÉVERSIBLE. Toutes les données suivantes seront DÉFINITIVEMENT supprimées:
                                    <ul className="mt-2 list-disc list-inside text-sm">
                                        <li>{selectedPassation.totalCodes} codes</li>
                                        <li>{selectedPassation.totalGroups} groupe(s)</li>
                                        <li>{selectedPassation.codesUsed} soumission(s)</li>
                                        <li>Toutes les réponses associées</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label>Pour confirmer, tapez: SUPPRIMER</Label>
                                <Input
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="SUPPRIMER"
                                    disabled={loading}
                                />
                            </div>
                        </>
                    )}

                    <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                        disabled={loading || !selectedId || confirmText !== 'SUPPRIMER'}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suppression...
                            </>
                        ) : (
                            "Archiver (supprimer définitivement)"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

