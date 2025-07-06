'use client';

import { useState } from 'react';
import { DependencyInfo } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DependenciesDisplayProps {
  dependencies: DependencyInfo[];
}

export default function DependenciesDisplay({ dependencies }: DependenciesDisplayProps) {
  const [filter, setFilter] = useState<'all' | 'production' | 'development'>('all');
  const [search, setSearch] = useState('');

  const filteredDependencies = dependencies.filter((dep) => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'production' && !dep.isDev) ||
      (filter === 'development' && dep.isDev);
    
    const matchesSearch = 
      search === '' ||
      dep.name.toLowerCase().includes(search.toLowerCase()) ||
      (dep.description && dep.description.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const productionCount = dependencies.filter(dep => !dep.isDev).length;
  const developmentCount = dependencies.filter(dep => dep.isDev).length;
  const optionalCount = dependencies.filter(dep => dep.isOptional).length;

  if (dependencies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Dependencies
          </CardTitle>
          <CardDescription>No dependencies detected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Dependencies
        </CardTitle>
        <CardDescription>
          {dependencies.length} total dependencies
          {optionalCount > 0 && ` (${optionalCount} optional)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{productionCount}</div>
            <div className="text-xs text-gray-600">Production</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{developmentCount}</div>
            <div className="text-xs text-gray-600">Development</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{optionalCount}</div>
            <div className="text-xs text-gray-600">Optional</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              <Filter className="w-3 h-3 mr-1" />
              All ({dependencies.length})
            </Button>
            <Button
              variant={filter === 'production' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('production')}
            >
              Production ({productionCount})
            </Button>
            <Button
              variant={filter === 'development' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('development')}
            >
              Dev ({developmentCount})
            </Button>
          </div>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search dependencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Dependencies List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredDependencies.length > 0 ? (
            filteredDependencies.map((dep, index) => (
              <div
                key={`${dep.name}-${index}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{dep.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {dep.version}
                    </Badge>
                    {dep.isDev && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        dev
                      </Badge>
                    )}
                    {dep.isOptional && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        optional
                      </Badge>
                    )}
                  </div>
                  {dep.description && (
                    <p className="text-xs text-gray-600 mt-1">{dep.description}</p>
                  )}
                </div>
                <a
                  href={`https://www.npmjs.com/package/${dep.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  npm →
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No dependencies match the current filter</p>
            </div>
          )}
        </div>

        {filteredDependencies.length > 0 && filteredDependencies.length !== dependencies.length && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Showing {filteredDependencies.length} of {dependencies.length} dependencies
          </div>
        )}
      </CardContent>
    </Card>
  );
}