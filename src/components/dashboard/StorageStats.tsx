import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiService, StatsResponse } from '@/lib/api';
import { Database, HardDrive, TrendingDown, Zap } from 'lucide-react';

export function StorageStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 bg-muted rounded mb-2" />
              <div className="w-24 h-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Failed to load storage statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Usage Overview */}
      <Card className="bg-gradient-stats text-white border-0 shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Storage Usage
          </CardTitle>
          <CardDescription className="text-white/80">
            {formatBytes(stats.total_storage_used_bytes)} of {stats.storage_quota_mb} MB used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress 
            value={stats.quota_used_percentage} 
            className="w-full h-3 bg-white/20"
          />
          <p className="text-sm text-white/90 mt-2">
            {stats.quota_used_percentage.toFixed(1)}% of quota used
          </p>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-vault transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-vault-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vault-blue">
              {formatBytes(stats.total_storage_used_bytes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Physical storage used
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-vault transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Saved</CardTitle>
            <TrendingDown className="h-4 w-4 text-vault-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vault-teal">
              {formatBytes(stats.storage_savings_bytes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.storage_savings_percentage.toFixed(1)}% saved via deduplication
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-vault transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-vault-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vault-purple">
              {stats.storage_savings_percentage > 0 ? 'Active' : 'Standard'}
            </div>
            <p className="text-xs text-muted-foreground">
              Deduplication status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      {stats.storage_savings_percentage > 0 && (
        <Card className="bg-muted/50 border-vault-teal/20">
          <CardHeader>
            <CardTitle className="text-vault-teal">Deduplication Benefits</CardTitle>
            <CardDescription>
              Your files are automatically deduplicated to save space
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Without deduplication:</p>
                <p className="font-semibold">{formatBytes(stats.original_storage_used_bytes)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">With deduplication:</p>
                <p className="font-semibold text-vault-teal">{formatBytes(stats.total_storage_used_bytes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}