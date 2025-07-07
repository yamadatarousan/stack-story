'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function RateLimitInfo() {
  const [rateLimit, setRateLimit] = useState<{
    rate: { remaining: number; limit: number; reset: number };
    search?: { remaining: number; limit: number; reset: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkRateLimit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rate-limit');
      const data = await response.json();
      setRateLimit(data);
    } catch (error) {
      console.error('Failed to check rate limit:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRateLimit();
  }, []);

  const getStatusColor = (remaining: number, limit: number) => {
    const percentage = (remaining / limit) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (remaining: number, limit: number) => {
    const percentage = (remaining / limit) * 100;
    if (percentage > 20) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const formatResetTime = (resetTimestamp: number) => {
    const resetTime = new Date(resetTimestamp * 1000);
    const now = new Date();
    const diffMinutes = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return '制限はリセット済み';
    }
    
    return `${diffMinutes}分後にリセット`;
  };

  if (!rateLimit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            GitHub API制限状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Button onClick={checkRateLimit} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              制限状況を確認
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
          <Clock className="w-5 h-5" />
          GitHub API制限状況
        </CardTitle>
        <CardDescription>
          API利用状況と制限リセット時間
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Core API */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(rateLimit.rate.remaining, rateLimit.rate.limit)}
              <div>
                <div className="font-medium">Core API</div>
                <div className="text-sm text-gray-600">
                  リポジトリ情報・ファイル取得
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${getStatusColor(rateLimit.rate.remaining, rateLimit.rate.limit)}`}>
                {rateLimit.rate.remaining} / {rateLimit.rate.limit}
              </div>
              <div className="text-xs text-gray-600">
                {formatResetTime(rateLimit.rate.reset)}
              </div>
            </div>
          </div>

          {/* Search API */}
          {rateLimit.search && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(rateLimit.search.remaining, rateLimit.search.limit)}
                <div>
                  <div className="font-medium">Search API</div>
                  <div className="text-sm text-gray-600">
                    リポジトリ検索
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getStatusColor(rateLimit.search.remaining, rateLimit.search.limit)}`}>
                  {rateLimit.search.remaining} / {rateLimit.search.limit}
                </div>
                <div className="text-xs text-gray-600">
                  {formatResetTime(rateLimit.search.reset)}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={checkRateLimit} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              更新
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
            <p><strong>制限について:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>認証なし: 60リクエスト/時間</li>
              <li>認証あり: 5,000リクエスト/時間</li>
              <li>制限に達した場合は時間をおいて再試行してください</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}