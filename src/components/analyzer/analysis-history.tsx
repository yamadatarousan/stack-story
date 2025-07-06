'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Clock, 
  Star, 
  GitFork, 
  ExternalLink,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  updatedAt: string;
  analyses: Array<{
    id: string;
    createdAt: string;
    techStack: any[];
  }>;
}

interface AnalysisHistoryProps {
  type?: 'recent' | 'popular';
  limit?: number;
  onSelectRepository?: (repository: Repository) => void;
}

export default function AnalysisHistory({ 
  type = 'recent', 
  limit = 10,
  onSelectRepository 
}: AnalysisHistoryProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [type, limit]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/history?type=${type}&limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch history');
      }

      setRepositories(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'popular':
        return '人気のリポジトリ';
      case 'recent':
      default:
        return '最近の分析';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'popular':
        return <TrendingUp className="w-5 h-5" />;
      case 'recent':
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon()}
            {getTypeTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="履歴を読み込み中..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon()}
            {getTypeTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchHistory}>
              再試行
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTypeIcon()}
          {getTypeTitle()}
        </CardTitle>
        <CardDescription>
          {type === 'popular' 
            ? 'スター数が多く注目されているリポジトリ'
            : '最近分析されたリポジトリ'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {repositories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>まだ分析履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm truncate">
                      {repo.name}
                    </h3>
                    {repo.language && (
                      <Badge variant="outline" className="text-xs">
                        {repo.language}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    {repo.fullName}
                  </p>
                  
                  {repo.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {type === 'popular' && (
                      <>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {repo.forks}
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(repo.analyses[0]?.createdAt || repo.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {repo.analyses[0]?.techStack?.length || 0} 技術
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {onSelectRepository && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectRepository(repo)}
                    >
                      表示
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(repo.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {repositories.length > 0 && repositories.length === limit && (
          <div className="text-center mt-4">
            <Button variant="outline" onClick={fetchHistory}>
              さらに読み込む
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}