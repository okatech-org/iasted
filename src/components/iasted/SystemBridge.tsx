import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Terminal, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Command } from '@/services/iasted/CommandService';

interface SystemBridgeProps {
    isOpen: boolean;
    command: Command | null;
    args: any;
    onApprove: () => void;
    onReject: () => void;
}

export const SystemBridge: React.FC<SystemBridgeProps> = ({
    isOpen,
    command,
    args,
    onApprove,
    onReject
}) => {
    if (!command) return null;

    const isHighRisk = command.type === 'SYSTEM' || command.id.includes('delete') || command.id.includes('mutate');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onReject()}>
            <DialogContent className="sm:max-w-[500px] border-l-4 border-l-primary">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Shield className="w-5 h-5" />
                        <span className="font-mono text-xs uppercase tracking-wider">System Bridge</span>
                    </div>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {isHighRisk && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        Autorisation Requise
                    </DialogTitle>
                    <DialogDescription>
                        iAsted demande la permission d'exécuter une action système.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-3 my-4 border border-border">
                    <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">Commande:</span>
                        <span className="font-bold text-foreground">{command.name}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="text-xs bg-background px-1.5 py-0.5 rounded border">{command.id}</span>
                    </div>
                    {Object.keys(args).length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-border/50">
                            <span className="text-muted-foreground block mb-1">Arguments:</span>
                            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                {JSON.stringify(args, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onReject} className="w-full sm:w-auto">
                        <XCircle className="w-4 h-4 mr-2" />
                        Refuser
                    </Button>
                    <Button
                        onClick={onApprove}
                        className={`w-full sm:w-auto ${isHighRisk ? 'bg-amber-600 hover:bg-amber-700' : 'gradient-bg'}`}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Autoriser l'exécution
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
