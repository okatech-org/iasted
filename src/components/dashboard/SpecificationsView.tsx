import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Specification {
  id: string;
  title: string;
  version: number;
  created_at: string;
  project_id: string;
  projects: {
    name: string;
  } | null;
}

export function SpecificationsView() {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSpecifications();
    }
  }, [user]);

  const fetchSpecifications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('specifications')
      .select(`
        id,
        title,
        version,
        created_at,
        project_id,
        projects (name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSpecifications(data as Specification[]);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cahiers des charges</h1>
        <p className="text-muted-foreground">Consultez les spécifications générées par iAsted</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : specifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specifications.map((spec) => (
            <Card key={spec.id} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{spec.title}</CardTitle>
                  {spec.projects && (
                    <p className="text-sm text-muted-foreground">{spec.projects.name}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(spec.created_at), { addSuffix: true, locale: fr })}
                  </div>
                  <Badge variant="outline">v{spec.version}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun cahier des charges</h3>
          <p className="text-muted-foreground max-w-md">
            Utilisez le chat IA pour décrire votre projet et générer automatiquement un cahier des charges complet.
          </p>
        </div>
      )}
    </div>
  );
}
