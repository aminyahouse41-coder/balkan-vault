import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-secure flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm 
            onSuccess={onAuthSuccess}
            onToggleMode={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm 
            onSuccess={() => setIsLogin(true)}
            onToggleMode={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}