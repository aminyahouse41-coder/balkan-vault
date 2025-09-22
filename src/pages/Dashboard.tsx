import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StorageStats } from '@/components/dashboard/StorageStats';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { FileList } from '@/components/dashboard/FileList';
import { authService } from '@/lib/auth';
import { Shield, LogOut, User } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const username = authService.getUsername();

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-vault rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-vault bg-clip-text text-transparent">
                  BalkanID Vault
                </h1>
                <p className="text-sm text-muted-foreground">Secure Deduplicating Storage</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {username}!</h2>
          <p className="text-muted-foreground">
            Manage your files with automatic deduplication and secure storage
          </p>
        </div>

        {/* Storage Statistics */}
        <StorageStats />

        {/* Upload Section */}
        <FileUpload onUploadComplete={handleUploadComplete} />

        {/* Files List */}
        <FileList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}