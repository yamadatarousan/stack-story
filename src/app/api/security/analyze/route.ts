import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import semver from 'semver';

interface Dependency {
  name: string;
  version: string;
  manager: string;
  scope: 'production' | 'dev' | 'peer' | 'optional';
  vulnerabilities?: Vulnerability[];
  license?: string;
}

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  packageName: string;
  packageVersion: string;
  fixedVersion?: string;
  references: string[];
  publishedAt: string;
  source: string;
}

interface SecurityReport {
  summary: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    totalDependencies: number;
    outdatedDependencies: number;
    securityRating: string;
    riskScore: number;
  };
  vulnerabilities: Vulnerability[];
  dependencies: Dependency[];
  scanDuration: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { repositoryPath } = await request.json();
    
    if (!repositoryPath) {
      return NextResponse.json(
        { error: 'Repository path is required' },
        { status: 400 }
      );
    }

    // Validate path exists
    try {
      await access(repositoryPath);
    } catch {
      return NextResponse.json(
        { error: 'Repository path does not exist or is not accessible' },
        { status: 400 }
      );
    }

    // Analyze dependencies
    const dependencies = await analyzeDependencies(repositoryPath);
    
    // Scan for vulnerabilities
    const vulnerabilities = await scanVulnerabilities(dependencies);
    
    // Calculate security metrics
    const summary = calculateSecuritySummary(vulnerabilities, dependencies);
    
    const report: SecurityReport = {
      summary,
      vulnerabilities,
      dependencies,
      scanDuration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('Security analysis failed:', error);
    return NextResponse.json(
      { error: 'Security analysis failed' },
      { status: 500 }
    );
  }
}

async function analyzeDependencies(projectPath: string): Promise<Dependency[]> {
  const dependencies: Dependency[] = [];

  try {
    // Analyze package.json (Node.js)
    const packageJsonPath = join(projectPath, 'package.json');
    try {
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      // Production dependencies
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({
            name,
            version: cleanVersion(version as string),
            manager: 'npm',
            scope: 'production',
            license: await getNpmLicense(projectPath, name)
          });
        }
      }

      // Development dependencies
      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({
            name,
            version: cleanVersion(version as string),
            manager: 'npm',
            scope: 'dev',
            license: await getNpmLicense(projectPath, name)
          });
        }
      }
    } catch {
      // package.json not found or invalid
    }

    // Analyze requirements.txt (Python)
    const requirementsPath = join(projectPath, 'requirements.txt');
    try {
      const content = await readFile(requirementsPath, 'utf-8');
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9\-_.]+)([>=<~!]+)?([\d.]+.*)?/);
        if (match) {
          dependencies.push({
            name: match[1],
            version: match[3] || 'unknown',
            manager: 'pip',
            scope: 'production'
          });
        }
      }
    } catch {
      // requirements.txt not found
    }

    // Analyze Cargo.toml (Rust)
    const cargoPath = join(projectPath, 'Cargo.toml');
    try {
      const content = await readFile(cargoPath, 'utf-8');
      
      const depSectionMatch = content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
      if (depSectionMatch) {
        const depSection = depSectionMatch[1];
        const depLines = depSection.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        for (const line of depLines) {
          const match = line.match(/^([a-zA-Z0-9\-_]+)\s*=\s*"([^"]+)"/);
          if (match) {
            dependencies.push({
              name: match[1],
              version: match[2],
              manager: 'cargo',
              scope: 'production'
            });
          }
        }
      }
    } catch {
      // Cargo.toml not found
    }

    // Analyze go.mod (Go)
    const goModPath = join(projectPath, 'go.mod');
    try {
      const content = await readFile(goModPath, 'utf-8');
      const lines = content.split('\n');
      let inRequire = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed === 'require (') {
          inRequire = true;
          continue;
        }
        
        if (trimmed === ')' && inRequire) {
          inRequire = false;
          continue;
        }
        
        if (inRequire || trimmed.startsWith('require ')) {
          const match = trimmed.match(/^\s*([^\s]+)\s+([^\s]+)/);
          if (match && !match[1].startsWith('//')) {
            dependencies.push({
              name: match[1],
              version: match[2],
              manager: 'go',
              scope: 'production'
            });
          }
        }
      }
    } catch {
      // go.mod not found
    }

  } catch (error) {
    console.warn('Dependency analysis failed:', error);
  }

  return dependencies;
}

async function scanVulnerabilities(dependencies: Dependency[]): Promise<Vulnerability[]> {
  const vulnerabilities: Vulnerability[] = [];

  // Mock vulnerability data for demonstration
  // In production, you would query actual vulnerability databases like OSV, NVD, etc.
  const knownVulnerablePackages = {
    'lodash': {
      id: 'CVE-2021-23337',
      title: 'テンプレート経由のコマンドインジェクション',
      description: 'Lodashテンプレート機能にコマンドインジェクション脆弱性があります',
      severity: 'high' as const,
      fixedVersion: '4.17.21',
      source: 'NVD'
    },
    'axios': {
      id: 'CVE-2021-3749',
      title: '正規表現サービス拒否攻撃',
      description: 'AxiosはReDoS攻撃に対して脆弱です',
      severity: 'medium' as const,
      fixedVersion: '0.21.4',
      source: 'GitHub'
    },
    'express': {
      id: 'CVE-2022-24999',
      title: 'オープンリダイレクト脆弱性',
      description: 'Express.jsはオープンリダイレクト攻撃に対して脆弱です',
      severity: 'medium' as const,
      fixedVersion: '4.18.1',
      source: 'OSV'
    },
    'react': {
      id: 'CVE-2020-15168',
      title: '開発モードでのXSS',
      description: 'React開発モードはXSSに対して脆弱です',
      severity: 'low' as const,
      fixedVersion: '16.14.0',
      source: 'NVD'
    }
  };

  for (const dependency of dependencies) {
    const vulnData = knownVulnerablePackages[dependency.name as keyof typeof knownVulnerablePackages];
    
    if (vulnData) {
      // Check if current version is vulnerable
      if (vulnData.fixedVersion && semver.valid(dependency.version) && semver.valid(vulnData.fixedVersion)) {
        if (semver.lt(dependency.version, vulnData.fixedVersion)) {
          vulnerabilities.push({
            id: vulnData.id,
            title: vulnData.title,
            description: vulnData.description,
            severity: vulnData.severity,
            packageName: dependency.name,
            packageVersion: dependency.version,
            fixedVersion: vulnData.fixedVersion,
            references: [`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vulnData.id}`],
            publishedAt: new Date().toISOString(),
            source: vulnData.source
          });

          // Add vulnerability to dependency
          if (!dependency.vulnerabilities) {
            dependency.vulnerabilities = [];
          }
          dependency.vulnerabilities.push(vulnerabilities[vulnerabilities.length - 1]);
        }
      }
    }
  }

  return vulnerabilities;
}

function calculateSecuritySummary(vulnerabilities: Vulnerability[], dependencies: Dependency[]) {
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowVulns = vulnerabilities.filter(v => v.severity === 'low').length;

  const outdatedDeps = dependencies.filter(d => d.vulnerabilities && d.vulnerabilities.length > 0).length;

  // Calculate security rating
  let securityRating = 'A';
  if (criticalVulns > 0) securityRating = 'E';
  else if (highVulns > 3) securityRating = 'D';
  else if (highVulns > 0 || mediumVulns > 5) securityRating = 'C';
  else if (mediumVulns > 0 || lowVulns > 3) securityRating = 'B';

  // Calculate risk score (0-100)
  const riskScore = Math.min(
    criticalVulns * 25 + highVulns * 10 + mediumVulns * 5 + lowVulns * 1,
    100
  );

  return {
    totalVulnerabilities: vulnerabilities.length,
    criticalVulnerabilities: criticalVulns,
    totalDependencies: dependencies.length,
    outdatedDependencies: outdatedDeps,
    securityRating,
    riskScore
  };
}

function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]+/, '');
}

async function getNpmLicense(projectPath: string, packageName: string): Promise<string | undefined> {
  try {
    const packagePath = join(projectPath, 'node_modules', packageName, 'package.json');
    const content = await readFile(packagePath, 'utf-8');
    const pkg = JSON.parse(content);
    return pkg.license;
  } catch {
    return undefined;
  }
}