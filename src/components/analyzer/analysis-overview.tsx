'use client';

import { GitHubRepository, ProjectStructure } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, GitFork, Calendar, Code, TestTube, FileText, Cog } from 'lucide-react';

interface AnalysisOverviewProps {
  repository: GitHubRepository;
  structure: ProjectStructure;
}

export default function AnalysisOverview({ repository, structure }: AnalysisOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProjectTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      web: 'bg-blue-100 text-blue-800',
      mobile: 'bg-green-100 text-green-800',
      desktop: 'bg-purple-100 text-purple-800',
      cli: 'bg-gray-100 text-gray-800',
      library: 'bg-orange-100 text-orange-800',
      unknown: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.unknown;
  };

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{repository.name}</CardTitle>
              <CardDescription className="mt-1">
                <a 
                  href={repository.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {repository.full_name}
                </a>
              </CardDescription>
              {repository.description && (
                <p className="mt-2 text-sm text-gray-600">{repository.description}</p>
              )}
            </div>
            <Badge variant="outline" className={getProjectTypeColor(structure.type)}>
              {structure.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">
                <span className="font-medium">{repository.stargazers_count}</span> stars
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <span className="font-medium">{repository.forks_count}</span> forks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{repository.language || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-sm">{formatDate(repository.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog className="w-5 h-5" />
              Project Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Language</span>
              <Badge variant="secondary">{structure.language}</Badge>
            </div>
            {structure.framework && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Framework</span>
                <Badge variant="secondary">{structure.framework}</Badge>
              </div>
            )}
            {structure.buildTool && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Build Tool</span>
                <Badge variant="secondary">{structure.buildTool}</Badge>
              </div>
            )}
            {structure.packageManager && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Package Manager</span>
                <Badge variant="secondary">{structure.packageManager}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <TestTube className="w-4 h-4" />
                Tests
              </span>
              <Badge variant={structure.hasTests ? "default" : "secondary"}>
                {structure.hasTests ? 'Available' : 'Not detected'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Documentation
              </span>
              <Badge variant={structure.hasDocumentation ? "default" : "secondary"}>
                {structure.hasDocumentation ? 'Available' : 'Not detected'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Cog className="w-4 h-4" />
                CI/CD
              </span>
              <Badge variant={structure.hasCI ? "default" : "secondary"}>
                {structure.hasCI ? 'Configured' : 'Not detected'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}