import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    ClipboardList, 
    Users, 
    CheckCircle2, 
    Clock, 
    Lock,
    Unlock,
    Download,
    Eye
} from 'lucide-react';

export default function PassationList({ passations, onView, onRefresh }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    };

    const handleDownloadCSV = (e, passationId) => {
        e.stopPropagation();
        window.location.href = `/api/passation/${passationId}/export-codes`;
    };

    if (passations.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Aucune passation créée</p>
                    <p className="text-sm mt-2">Cliquez sur "Nouvelle Passation" pour commencer</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {passations.map((passation) => (
                <Card
                    key={passation.id}
                    className="cursor-pointer hover:bg-accent/50 hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
                    onClick={() => onView(passation)}
                >
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            {/* Left side - Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <ClipboardList className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                            {passation.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {passation.schoolYear}
                                        </p>
                                    </div>
                                </div>

                                {passation.description && (
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {passation.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{passation.totalGroups} groupe(s)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                        <span>{passation.totalCodes} codes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>{passation.codesUsed} utilisés</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <span>{passation.codesAvailable} disponibles</span>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground mt-2">
                                    Créée le {formatDate(passation.createdAt)}
                                </div>
                            </div>

                            {/* Right side - Status & Actions */}
                            <div className="flex flex-col items-end gap-3">
                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {passation.isActive && !passation.isClosed && (
                                        <Badge variant="default" className="gap-1">
                                            <Unlock className="h-3 w-3" />
                                            Active
                                        </Badge>
                                    )}
                                    {passation.isClosed && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Lock className="h-3 w-3" />
                                            Fermée
                                        </Badge>
                                    )}
                                    {!passation.isActive && !passation.isClosed && (
                                        <Badge variant="outline">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleDownloadCSV(e, passation.id)}
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        CSV
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onView(passation);
                                        }}
                                        className="gap-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Voir
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Group Stats */}
                        {passation.groupStats && passation.groupStats.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {passation.groupStats.map((group) => (
                                        <div 
                                            key={group.groupId}
                                            className="text-sm bg-muted/50 rounded p-2"
                                        >
                                            <div className="font-medium truncate">{group.groupName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {group.codesUsed}/{group.totalCodes} utilisés
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
