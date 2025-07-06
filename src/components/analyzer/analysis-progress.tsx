'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  FileText, 
  Cpu, 
  CheckCircle, 
  Clock,
  Zap 
} from 'lucide-react';

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ComponentType<any>;
  estimatedTime?: number;
}

interface AnalysisProgressProps {
  repository?: string;
  onCancel?: () => void;
}

export default function AnalysisProgress({ 
  repository,
  onCancel 
}: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 'fetch',
      title: 'リポジトリ情報取得',
      description: 'GitHubからリポジトリの基本情報を取得中...',
      status: 'running',
      icon: Github,
      estimatedTime: 2,
    },
    {
      id: 'files',
      title: '設定ファイル解析',
      description: 'package.json、Dockerfile等の設定ファイルを解析中...',
      status: 'pending',
      icon: FileText,
      estimatedTime: 3,
    },
    {
      id: 'analysis',
      title: '技術スタック分析',
      description: '依存関係と技術構成を分析中...',
      status: 'pending',
      icon: Cpu,
      estimatedTime: 4,
    },
    {
      id: 'visualization',
      title: '可視化データ生成',
      description: 'インタラクティブ図表用のデータを準備中...',
      status: 'pending',
      icon: Zap,
      estimatedTime: 2,
    },
  ]);

  // シミュレートされた進行状況
  useEffect(() => {
    const timer = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        const runningIndex = newSteps.findIndex(step => step.status === 'running');
        
        if (runningIndex !== -1) {
          // 現在実行中のステップを完了
          newSteps[runningIndex].status = 'completed';
          
          // 次のステップを開始
          if (runningIndex + 1 < newSteps.length) {
            newSteps[runningIndex + 1].status = 'running';
            setCurrentStep(runningIndex + 1);
          }
        }
        
        return newSteps;
      });
    }, 2500); // 各ステップ2.5秒

    return () => clearInterval(timer);
  }, []);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const getStepIcon = (step: AnalysisStep) => {
    const IconComponent = step.icon;
    
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.status === 'running') {
      return <LoadingSpinner size="sm" />;
    } else if (step.status === 'error') {
      return <IconComponent className="w-5 h-5 text-red-600" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatus = (step: AnalysisStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">完了</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">実行中</Badge>;
      case 'error':
        return <Badge variant="destructive">エラー</Badge>;
      default:
        return <Badge variant="outline">待機中</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>リポジトリ分析中</CardTitle>
              <CardDescription>
                {repository && `${repository} を分析しています...`}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-gray-500">
                {completedSteps} / {totalSteps} 完了
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={progress} 
            className="mb-4" 
            showPercentage={false}
            color="blue"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>推定残り時間: {Math.max(0, (totalSteps - completedSteps - 1) * 3)}秒</span>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                キャンセル
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Steps */}
      <Card>
        <CardHeader>
          <CardTitle>分析ステップ</CardTitle>
          <CardDescription>
            各ステップの詳細な進行状況
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-3 rounded-lg border transition-all ${
                  step.status === 'running' 
                    ? 'bg-blue-50 border-blue-200' 
                    : step.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : step.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    {getStepStatus(step)}
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.estimatedTime && step.status === 'running' && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        推定時間: {step.estimatedTime}秒
                      </div>
                      <Progress 
                        value={75} 
                        size="sm" 
                        color="blue"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Activity */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="font-medium text-blue-900">
                {steps[currentStep]?.title || '分析を開始しています...'}
              </h3>
              <p className="text-sm text-blue-700">
                {steps[currentStep]?.description || 'しばらくお待ちください...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}