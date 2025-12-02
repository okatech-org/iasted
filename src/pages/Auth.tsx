import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Mail, Phone } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const countryCodes = [
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+32', country: 'BE', flag: '🇧🇪' },
  { code: '+41', country: 'CH', flag: '🇨🇭' },
];

export default function Auth() {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+33');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithPhone, signUpWithPhone, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const fullPhone = `${countryCode}${phoneNumber}`;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = authMethod === 'email' 
      ? await signIn(email, password)
      : await signInWithPhone(fullPhone, password);
    
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message === 'Invalid login credentials' 
          ? "Identifiants incorrects"
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bienvenue !",
        description: "Connexion réussie",
      });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (password.length < 7) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir 7 caractères",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = authMethod === 'email'
      ? await signUp(email, password)
      : await signUpWithPhone(fullPhone, password);
    
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message.includes('already registered')
          ? "Ce compte existe déjà"
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Compte créé !",
        description: "Bienvenue sur iAsted",
      });
    }
    setIsLoading(false);
  };

  const AuthMethodToggle = () => (
    <div className="flex gap-2 mb-4">
      <Button
        type="button"
        variant={authMethod === 'email' ? 'default' : 'outline'}
        className={authMethod === 'email' ? 'gradient-bg flex-1' : 'flex-1'}
        onClick={() => setAuthMethod('email')}
      >
        <Mail className="w-4 h-4 mr-2" />
        Email
      </Button>
      <Button
        type="button"
        variant={authMethod === 'phone' ? 'default' : 'outline'}
        className={authMethod === 'phone' ? 'gradient-bg flex-1' : 'flex-1'}
        onClick={() => setAuthMethod('phone')}
      >
        <Phone className="w-4 h-4 mr-2" />
        Téléphone
      </Button>
    </div>
  );

  const EmailInput = () => (
    <div className="space-y-2">
      <Label>Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10"
          required
        />
      </div>
    </div>
  );

  const PhoneInput = () => (
    <div className="space-y-2">
      <Label>Téléphone</Label>
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <span className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          placeholder="661002616"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
          className="flex-1"
          required
        />
      </div>
    </div>
  );

  const PasswordInput = ({ id }: { id: string }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>Mot de passe (7 caractères)</Label>
      <div className="flex justify-center">
        <InputOTP
          maxLength={7}
          value={password}
          onChange={setPassword}
          id={id}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="w-10 h-12 text-lg font-mono" />
            <InputOTPSlot index={1} className="w-10 h-12 text-lg font-mono" />
            <InputOTPSlot index={2} className="w-10 h-12 text-lg font-mono" />
            <InputOTPSlot index={3} className="w-10 h-12 text-lg font-mono" />
            <InputOTPSlot index={4} className="w-10 h-12 text-lg font-mono" />
            <InputOTPSlot index={5} className="w-10 h-12 text-lg font-mono" />
            <InputOTPSlot index={6} className="w-10 h-12 text-lg font-mono" />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md relative card-shadow border-border/50 backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold gradient-text">iAsted</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Votre assistant IA pour créer des projets
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <AuthMethodToggle />
                {authMethod === 'email' ? <EmailInput /> : <PhoneInput />}
                <PasswordInput id="signin-password" />
                <Button type="submit" className="w-full gradient-bg" disabled={isLoading || password.length < 7}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Se connecter
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
                <AuthMethodToggle />
                {authMethod === 'email' ? <EmailInput /> : <PhoneInput />}
                <PasswordInput id="signup-password" />
                <Button type="submit" className="w-full gradient-bg" disabled={isLoading || password.length < 7}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Créer un compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
