import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { Shield, UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: () => void;
  onToggleMode: () => void;
}

export function RegisterForm({ onSuccess, onToggleMode }: RegisterFormProps) {
  const [userData, setUserData] = useState({ username: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userData.password !== userData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        username: userData.username,
        password: userData.password,
      });
      
      toast({
        title: "Account created successfully!",
        description: "You can now sign in to your new vault.",
      });
      
      onToggleMode(); // Switch to login form
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Username may already be taken. Please try a different one.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-border/50 shadow-vault">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-secure rounded-full flex items-center justify-center shadow-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-secure bg-clip-text text-transparent">
          Create Your Vault
        </CardTitle>
        <CardDescription>
          Join BalkanID Vault for secure, deduplicated file storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input
              id="reg-username"
              type="text"
              placeholder="Choose a username"
              value={userData.username}
              onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Create a strong password"
              value={userData.password}
              onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={userData.confirmPassword}
              onChange={(e) => setUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-secure hover:shadow-glow transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </div>
            )}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}