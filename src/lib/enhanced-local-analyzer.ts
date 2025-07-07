import fs from 'fs/promises';
import path from 'path';
import { AnalysisResult, TechStackItem, DependencyInfo } from '@/types';
import { DeepContentAnalyzer, DeepContentAnalysis } from './deep-content-analyzer';

interface LocalAnalysisConfig {
  includeNodeModules: boolean;
  includeHiddenFiles: boolean;
  maxFileSize: number; // bytes
  maxFiles: number;
  skipBinaryFiles: boolean;
}

interface FileAnalysis {
  path: string;
  size: number;
  extension: string;
  content?: string;
  lineCount?: number;
  complexity?: number;
  isTest?: boolean;
  isConfig?: boolean;
}

interface CodeQualityAnalysis {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  averageFileSize: number;
  largestFiles: FileAnalysis[];
  duplicatedCode: DuplicatedCodeBlock[];
  complexityDistribution: ComplexityDistribution;
}

interface DuplicatedCodeBlock {
  content: string;
  files: string[];
  lineCount: number;
  severity: 'low' | 'medium' | 'high';
}

interface ComplexityDistribution {
  low: number; // 1-5
  medium: number; // 6-10
  high: number; // 11-20
  extreme: number; // 21+
}

interface SecurityAnalysis {
  potentialVulnerabilities: SecurityVulnerability[];
  sensitiveDataExposure: SensitiveDataExposure[];
  insecurePatterns: InsecurePattern[];
  securityScore: number; // 0-100
}

interface SecurityVulnerability {
  type: 'sql-injection' | 'xss' | 'path-traversal' | 'hardcoded-secrets' | 'weak-crypto' | 'unsafe-eval';
  file: string;
  line: number;
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

interface SensitiveDataExposure {
  type: 'api-key' | 'password' | 'token' | 'email' | 'phone' | 'credit-card';
  file: string;
  line: number;
  context: string;
  confidence: number; // 0-100
}

interface InsecurePattern {
  pattern: string;
  file: string;
  line: number;
  risk: 'low' | 'medium' | 'high';
  explanation: string;
}

interface PerformanceAnalysis {
  potentialBottlenecks: PerformanceBottleneck[];
  inefficientPatterns: InefficiencyPattern[];
  optimizationOpportunities: OptimizationOpportunity[];
  performanceScore: number; // 0-100
}

interface PerformanceBottleneck {
  type: 'sync-io' | 'blocking-operation' | 'memory-leak' | 'inefficient-loop' | 'heavy-import';
  file: string;
  line: number;
  code: string;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}

interface InefficiencyPattern {
  pattern: string;
  occurrences: Array<{ file: string; line: number }>;
  impact: string;
  solution: string;
}

interface OptimizationOpportunity {
  type: 'bundling' | 'caching' | 'lazy-loading' | 'compression' | 'tree-shaking';
  description: string;
  files: string[];
  estimatedImpact: string;
  implementation: string;
}

export class EnhancedLocalAnalyzer {
  private config: LocalAnalysisConfig;
  private deepAnalyzer: DeepContentAnalyzer;

  constructor(config: Partial<LocalAnalysisConfig> = {}) {
    this.config = {
      includeNodeModules: false,
      includeHiddenFiles: false,
      maxFileSize: 1024 * 1024, // 1MB
      maxFiles: 1000,
      skipBinaryFiles: true,
      ...config,
    };
    this.deepAnalyzer = new DeepContentAnalyzer();
  }

  async analyzeLocalRepository(repositoryPath: string): Promise<AnalysisResult & { 
    enhancedAnalysis: {
      fileAnalysis: FileAnalysis[];
      codeQuality: CodeQualityAnalysis;
      security: SecurityAnalysis;
      performance: PerformanceAnalysis;
      deepContent: DeepContentAnalysis;
    }
  }> {
    console.log('🔍 Enhanced local repository analysis started:', repositoryPath);

    // Basic analysis
    const basicAnalysis = await this.performBasicAnalysis(repositoryPath);
    
    // File-level analysis
    const fileAnalysis = await this.analyzeFiles(repositoryPath);
    
    // Code quality analysis
    const codeQuality = await this.analyzeCodeQuality(fileAnalysis);
    
    // Security analysis
    const security = await this.analyzeSecurityIssues(fileAnalysis);
    
    // Performance analysis
    const performance = await this.analyzePerformanceIssues(fileAnalysis);
    
    // Deep content analysis
    const deepContent = await this.deepAnalyzer.analyzeDeepContent(basicAnalysis);

    console.log('✅ Enhanced local repository analysis completed');

    return {
      ...basicAnalysis,
      enhancedAnalysis: {
        fileAnalysis,
        codeQuality,
        security,
        performance,
        deepContent,
      },
    };
  }

  private async performBasicAnalysis(repositoryPath: string): Promise<AnalysisResult> {
    // Package.json analysis
    const packageJsonPath = path.join(repositoryPath, 'package.json');
    let packageJson: any = {};
    try {
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(packageContent);
    } catch (error) {
      console.warn('No package.json found or invalid JSON');
    }

    // README analysis
    let readmeContent = '';
    const readmeFiles = ['README.md', 'readme.md', 'README.txt', 'readme.txt'];
    for (const readme of readmeFiles) {
      try {
        readmeContent = await fs.readFile(path.join(repositoryPath, readme), 'utf-8');
        break;
      } catch (error) {
        // Try next README file
      }
    }

    // Tech stack detection
    const techStack = await this.detectTechStack(repositoryPath, packageJson);
    
    // Dependencies analysis
    const dependencies = this.extractDependencies(packageJson);
    
    // Project structure analysis
    const structure = await this.analyzeProjectStructure(repositoryPath);

    // Mock repository data for local analysis
    const repository = {
      id: Date.now(),
      name: path.basename(repositoryPath),
      full_name: `local/${path.basename(repositoryPath)}`,
      description: packageJson.description || 'Local repository analysis',
      html_url: `file://${repositoryPath}`,
      clone_url: `file://${repositoryPath}`,
      ssh_url: `file://${repositoryPath}`,
      language: this.detectPrimaryLanguage(techStack),
      stargazers_count: 0,
      forks_count: 0,
      open_issues_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      default_branch: 'main',
      owner: {
        login: 'local',
        avatar_url: '',
        html_url: '',
      },
    };

    return {
      repository,
      techStack,
      dependencies,
      structure,
      summary: this.generateSummary(techStack, dependencies, structure),
      createdAt: new Date().toISOString(),
    };
  }

  private async analyzeFiles(repositoryPath: string): Promise<FileAnalysis[]> {
    const files: FileAnalysis[] = [];
    
    const analyzeDirectory = async (dirPath: string, relativePath = ''): Promise<void> => {
      if (files.length >= this.config.maxFiles) return;

      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });

        for (const item of items) {
          if (files.length >= this.config.maxFiles) break;

          const fullPath = path.join(dirPath, item.name);
          const relativeFilePath = path.join(relativePath, item.name);

          if (this.shouldSkipPath(relativeFilePath)) continue;

          if (item.isDirectory()) {
            await analyzeDirectory(fullPath, relativeFilePath);
          } else if (item.isFile()) {
            const fileAnalysis = await this.analyzeFile(fullPath, relativeFilePath);
            if (fileAnalysis) {
              files.push(fileAnalysis);
            }
          }
        }
      } catch (error) {
        console.warn(`Error reading directory ${dirPath}:`, error);
      }
    };

    await analyzeDirectory(repositoryPath);
    return files;
  }

  private async analyzeFile(fullPath: string, relativePath: string): Promise<FileAnalysis | null> {
    try {
      const stats = await fs.stat(fullPath);
      
      if (stats.size > this.config.maxFileSize) {
        return null;
      }

      const extension = path.extname(relativePath);
      
      if (this.config.skipBinaryFiles && this.isBinaryFile(extension)) {
        return {
          path: relativePath,
          size: stats.size,
          extension,
        };
      }

      let content: string | undefined;
      let lineCount: number | undefined;
      let complexity: number | undefined;

      if (this.isTextFile(extension)) {
        try {
          content = await fs.readFile(fullPath, 'utf-8');
          lineCount = content.split('\n').length;
          complexity = this.calculateFileComplexity(content, extension);
        } catch (error) {
          console.warn(`Error reading file ${fullPath}:`, error);
        }
      }

      return {
        path: relativePath,
        size: stats.size,
        extension,
        content,
        lineCount,
        complexity,
        isTest: this.isTestFile(relativePath),
        isConfig: this.isConfigFile(relativePath),
      };
    } catch (error) {
      console.warn(`Error analyzing file ${fullPath}:`, error);
      return null;
    }
  }

  private async analyzeCodeQuality(files: FileAnalysis[]): Promise<CodeQualityAnalysis> {
    let totalLines = 0;
    let codeLines = 0;
    let commentLines = 0;
    let blankLines = 0;
    let totalSize = 0;

    const codeFiles = files.filter(f => f.content && this.isCodeFile(f.extension));
    
    for (const file of codeFiles) {
      if (file.content && file.lineCount) {
        totalLines += file.lineCount;
        totalSize += file.size;
        
        const lines = file.content.split('\n');
        const analysis = this.analyzeLines(lines, file.extension);
        codeLines += analysis.code;
        commentLines += analysis.comments;
        blankLines += analysis.blank;
      }
    }

    const averageFileSize = codeFiles.length > 0 ? totalSize / codeFiles.length : 0;
    const largestFiles = codeFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    const duplicatedCode = await this.findDuplicatedCode(codeFiles);
    const complexityDistribution = this.calculateComplexityDistribution(codeFiles);

    return {
      totalLines,
      codeLines,
      commentLines,
      blankLines,
      averageFileSize,
      largestFiles,
      duplicatedCode,
      complexityDistribution,
    };
  }

  private async analyzeSecurityIssues(files: FileAnalysis[]): Promise<SecurityAnalysis> {
    const potentialVulnerabilities: SecurityVulnerability[] = [];
    const sensitiveDataExposure: SensitiveDataExposure[] = [];
    const insecurePatterns: InsecurePattern[] = [];

    const codeFiles = files.filter(f => f.content && this.isCodeFile(f.extension));

    for (const file of codeFiles) {
      if (!file.content) continue;

      const lines = file.content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for potential vulnerabilities
        const vulnerabilities = this.detectVulnerabilities(line, file.path, index + 1);
        potentialVulnerabilities.push(...vulnerabilities);

        // Check for sensitive data exposure
        const exposures = this.detectSensitiveData(line, file.path, index + 1);
        sensitiveDataExposure.push(...exposures);

        // Check for insecure patterns
        const patterns = this.detectInsecurePatterns(line, file.path, index + 1);
        insecurePatterns.push(...patterns);
      });
    }

    const securityScore = this.calculateSecurityScore(
      potentialVulnerabilities,
      sensitiveDataExposure,
      insecurePatterns
    );

    return {
      potentialVulnerabilities,
      sensitiveDataExposure,
      insecurePatterns,
      securityScore,
    };
  }

  private async analyzePerformanceIssues(files: FileAnalysis[]): Promise<PerformanceAnalysis> {
    const potentialBottlenecks: PerformanceBottleneck[] = [];
    const inefficientPatterns: InefficiencyPattern[] = [];
    const optimizationOpportunities: OptimizationOpportunity[] = [];

    const codeFiles = files.filter(f => f.content && this.isCodeFile(f.extension));

    for (const file of codeFiles) {
      if (!file.content) continue;

      const lines = file.content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for performance bottlenecks
        const bottlenecks = this.detectPerformanceBottlenecks(line, file.path, index + 1);
        potentialBottlenecks.push(...bottlenecks);
      });
    }

    // Detect inefficient patterns across files
    inefficientPatterns.push(...this.detectInefficiencyPatterns(codeFiles));

    // Identify optimization opportunities
    optimizationOpportunities.push(...this.identifyOptimizations(files));

    const performanceScore = this.calculatePerformanceScore(
      potentialBottlenecks,
      inefficientPatterns
    );

    return {
      potentialBottlenecks,
      inefficientPatterns,
      optimizationOpportunities,
      performanceScore,
    };
  }

  // Helper methods
  private shouldSkipPath(relativePath: string): boolean {
    const skipPatterns = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '.nyc_output',
      'out',
    ];

    if (!this.config.includeNodeModules && relativePath.includes('node_modules')) {
      return true;
    }

    if (!this.config.includeHiddenFiles && relativePath.startsWith('.')) {
      return true;
    }

    return skipPatterns.some(pattern => relativePath.includes(pattern));
  }

  private isBinaryFile(extension: string): boolean {
    const binaryExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
      '.pdf', '.zip', '.tar', '.gz', '.rar',
      '.exe', '.dll', '.so', '.dylib',
      '.mp4', '.avi', '.mov', '.mp3', '.wav',
      '.woff', '.woff2', '.ttf', '.eot',
    ];
    return binaryExtensions.includes(extension.toLowerCase());
  }

  private isTextFile(extension: string): boolean {
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.py', '.rb', '.php', '.java', '.c', '.cpp', '.cs',
      '.go', '.rs', '.swift', '.kt', '.scala',
      '.html', '.css', '.scss', '.sass', '.less',
      '.json', '.xml', '.yaml', '.yml', '.toml',
      '.md', '.txt', '.rst', '.adoc',
      '.sh', '.bash', '.zsh', '.fish',
      '.sql', '.graphql', '.gql',
      '.dockerfile', '.gitignore', '.env',
    ];
    return textExtensions.includes(extension.toLowerCase()) || extension === '';
  }

  private isCodeFile(extension: string): boolean {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.py', '.rb', '.php', '.java', '.c', '.cpp', '.cs',
      '.go', '.rs', '.swift', '.kt', '.scala',
      '.html', '.css', '.scss', '.sass', '.less',
    ];
    return codeExtensions.includes(extension.toLowerCase());
  }

  private isTestFile(relativePath: string): boolean {
    const testPatterns = [
      /test/i, /spec/i, /__tests__/i, /\.test\./i, /\.spec\./i
    ];
    return testPatterns.some(pattern => pattern.test(relativePath));
  }

  private isConfigFile(relativePath: string): boolean {
    const configPatterns = [
      /config/i, /\.config\./i, /\.json$/i, /\.yml$/i, /\.yaml$/i, /\.toml$/i,
      /package\.json$/i, /tsconfig/i, /webpack/i, /babel/i, /eslint/i, /prettier/i
    ];
    return configPatterns.some(pattern => pattern.test(relativePath));
  }

  private calculateFileComplexity(content: string, extension: string): number {
    // Simplified complexity calculation based on control flow statements
    const complexityPatterns = [
      /\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, /\bdo\b/g,
      /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\btry\b/g,
      /&&/g, /\|\|/g, /\?/g, /:/g
    ];

    let complexity = 1; // Base complexity
    
    complexityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  private analyzeLines(lines: string[], extension: string): { code: number; comments: number; blank: number } {
    let code = 0;
    let comments = 0;
    let blank = 0;

    const commentPatterns = this.getCommentPatterns(extension);

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '') {
        blank++;
      } else if (commentPatterns.some(pattern => pattern.test(trimmed))) {
        comments++;
      } else {
        code++;
      }
    });

    return { code, comments, blank };
  }

  private getCommentPatterns(extension: string): RegExp[] {
    switch (extension) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
      case '.java':
      case '.c':
      case '.cpp':
      case '.cs':
      case '.go':
      case '.rs':
      case '.swift':
      case '.kt':
      case '.scala':
        return [/^\/\//, /^\/\*/, /^\*/];
      case '.py':
      case '.rb':
      case '.sh':
      case '.bash':
        return [/^#/];
      case '.html':
      case '.xml':
        return [/^<!--/, /^-->/];
      case '.css':
      case '.scss':
      case '.sass':
      case '.less':
        return [/^\/\*/, /^\*/];
      default:
        return [/^\/\//, /^#/, /^\/\*/, /^\*/];
    }
  }

  private async findDuplicatedCode(files: FileAnalysis[]): Promise<DuplicatedCodeBlock[]> {
    // Simplified duplication detection - would use more sophisticated algorithms in production
    const duplicates: DuplicatedCodeBlock[] = [];
    const contentMap = new Map<string, string[]>();

    files.forEach(file => {
      if (file.content) {
        const lines = file.content.split('\n');
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.length > 20) { // Only consider substantial lines
            if (!contentMap.has(trimmed)) {
              contentMap.set(trimmed, []);
            }
            contentMap.get(trimmed)!.push(`${file.path}:${index + 1}`);
          }
        });
      }
    });

    contentMap.forEach((locations, content) => {
      if (locations.length > 1) {
        duplicates.push({
          content,
          files: locations.map(loc => loc.split(':')[0]),
          lineCount: 1,
          severity: locations.length > 5 ? 'high' : locations.length > 2 ? 'medium' : 'low',
        });
      }
    });

    return duplicates.slice(0, 50); // Limit results
  }

  private calculateComplexityDistribution(files: FileAnalysis[]): ComplexityDistribution {
    const distribution = { low: 0, medium: 0, high: 0, extreme: 0 };

    files.forEach(file => {
      if (file.complexity) {
        if (file.complexity <= 5) distribution.low++;
        else if (file.complexity <= 10) distribution.medium++;
        else if (file.complexity <= 20) distribution.high++;
        else distribution.extreme++;
      }
    });

    return distribution;
  }

  // Security analysis methods
  private detectVulnerabilities(line: string, file: string, lineNumber: number): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // SQL Injection patterns
    if (/query\s*\+|sql\s*\+|\$\{.*\}.*SELECT|string\.format.*SELECT/i.test(line)) {
      vulnerabilities.push({
        type: 'sql-injection',
        file,
        line: lineNumber,
        code: line.trim(),
        severity: 'high',
        description: 'Potential SQL injection vulnerability detected',
        recommendation: 'Use parameterized queries or prepared statements',
      });
    }

    // XSS patterns
    if (/innerHTML\s*=|document\.write\s*\(|dangerouslySetInnerHTML/i.test(line)) {
      vulnerabilities.push({
        type: 'xss',
        file,
        line: lineNumber,
        code: line.trim(),
        severity: 'medium',
        description: 'Potential XSS vulnerability detected',
        recommendation: 'Sanitize user input and avoid direct HTML injection',
      });
    }

    // eval() usage
    if (/\beval\s*\(/.test(line)) {
      vulnerabilities.push({
        type: 'unsafe-eval',
        file,
        line: lineNumber,
        code: line.trim(),
        severity: 'high',
        description: 'Unsafe use of eval() function',
        recommendation: 'Avoid eval() and use safer alternatives',
      });
    }

    return vulnerabilities;
  }

  private detectSensitiveData(line: string, file: string, lineNumber: number): SensitiveDataExposure[] {
    const exposures: SensitiveDataExposure[] = [];

    // API keys
    if (/api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]|token\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/.test(line)) {
      exposures.push({
        type: 'api-key',
        file,
        line: lineNumber,
        context: line.trim(),
        confidence: 80,
      });
    }

    // Passwords
    if (/password\s*[:=]\s*['"][^'"]{8,}['"]/.test(line)) {
      exposures.push({
        type: 'password',
        file,
        line: lineNumber,
        context: line.trim(),
        confidence: 70,
      });
    }

    return exposures;
  }

  private detectInsecurePatterns(line: string, file: string, lineNumber: number): InsecurePattern[] {
    const patterns: InsecurePattern[] = [];

    // Hardcoded URLs
    if (/http:\/\//.test(line) && !line.includes('localhost')) {
      patterns.push({
        pattern: 'insecure-http',
        file,
        line: lineNumber,
        risk: 'medium',
        explanation: 'Using HTTP instead of HTTPS',
      });
    }

    return patterns;
  }

  // Performance analysis methods
  private detectPerformanceBottlenecks(line: string, file: string, lineNumber: number): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    // Synchronous I/O
    if (/readFileSync|writeFileSync|execSync/.test(line)) {
      bottlenecks.push({
        type: 'sync-io',
        file,
        line: lineNumber,
        code: line.trim(),
        impact: 'high',
        suggestion: 'Use asynchronous I/O operations instead',
      });
    }

    // Inefficient loops
    if (/for\s*\(.*\.length/.test(line)) {
      bottlenecks.push({
        type: 'inefficient-loop',
        file,
        line: lineNumber,
        code: line.trim(),
        impact: 'medium',
        suggestion: 'Cache array length outside the loop',
      });
    }

    return bottlenecks;
  }

  private detectInefficiencyPatterns(files: FileAnalysis[]): InefficiencyPattern[] {
    const patterns: InefficiencyPattern[] = [];

    // Find repeated imports across files
    const importMap = new Map<string, Array<{ file: string; line: number }>>();
    
    files.forEach(file => {
      if (file.content) {
        const lines = file.content.split('\n');
        lines.forEach((line, index) => {
          const importMatch = line.match(/import .* from ['"]([^'"]+)['"]/);
          if (importMatch) {
            const importPath = importMatch[1];
            if (!importMap.has(importPath)) {
              importMap.set(importPath, []);
            }
            importMap.get(importPath)!.push({ file: file.path, line: index + 1 });
          }
        });
      }
    });

    importMap.forEach((occurrences, importPath) => {
      if (occurrences.length > 5) {
        patterns.push({
          pattern: `Frequent import: ${importPath}`,
          occurrences,
          impact: 'Bundle size increase',
          solution: 'Consider tree shaking or dynamic imports',
        });
      }
    });

    return patterns;
  }

  private identifyOptimizations(files: FileAnalysis[]): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Large files that could benefit from code splitting
    const largeFiles = files.filter(f => f.size > 50000); // 50KB+
    if (largeFiles.length > 0) {
      opportunities.push({
        type: 'lazy-loading',
        description: 'Large files detected that could benefit from code splitting',
        files: largeFiles.map(f => f.path),
        estimatedImpact: 'Improved initial load time',
        implementation: 'Implement dynamic imports and lazy loading',
      });
    }

    return opportunities;
  }

  private calculateSecurityScore(
    vulnerabilities: SecurityVulnerability[],
    exposures: SensitiveDataExposure[],
    patterns: InsecurePattern[]
  ): number {
    let score = 100;

    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    exposures.forEach(exposure => {
      score -= (exposure.confidence / 10);
    });

    patterns.forEach(pattern => {
      switch (pattern.risk) {
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    return Math.max(0, score);
  }

  private calculatePerformanceScore(
    bottlenecks: PerformanceBottleneck[],
    patterns: InefficiencyPattern[]
  ): number {
    let score = 100;

    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.impact) {
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    patterns.forEach(() => {
      score -= 5;
    });

    return Math.max(0, score);
  }

  // Tech stack and dependencies detection (simplified versions)
  private async detectTechStack(repositoryPath: string, packageJson: any): Promise<TechStackItem[]> {
    const techStack: TechStackItem[] = [];
    
    // From package.json
    if (packageJson.dependencies || packageJson.devDependencies) {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      Object.keys(allDeps).forEach(dep => {
        const version = allDeps[dep];
        techStack.push({
          name: dep,
          category: this.categorizePackage(dep) as any,
          version: version.replace(/[^0-9.]/g, ''),
          confidence: 0.9,
          description: 'Detected from package.json',
        });
      });
    }

    return techStack;
  }

  private categorizePackage(packageName: string): 'framework' | 'library' | 'tool' | 'language' | 'database' | 'service' | 'testing' {
    const categories: { [key: string]: string[] } = {
      'framework': ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'gatsby'],
      'language': ['typescript', 'babel', 'sass', 'scss', 'less'],
      'testing': ['jest', 'mocha', 'chai', 'cypress', 'testing-library'],
      'tool': ['webpack', 'vite', 'rollup', 'parcel', 'esbuild', 'eslint', 'prettier', 'tslint'],
      'database': ['mongodb', 'mongoose', 'prisma', 'sequelize', 'mysql'],
      'service': ['express', 'fastify', 'koa', 'hapi'],
    };

    for (const [category, packages] of Object.entries(categories)) {
      if (packages.some(pkg => packageName.includes(pkg))) {
        return category as any;
      }
    }

    return 'library';
  }

  private extractDependencies(packageJson: any): DependencyInfo[] {
    const dependencies: DependencyInfo[] = [];
    
    if (packageJson.dependencies) {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: version as string,
          isDev: false,
          isOptional: false,
          description: '',
        });
      });
    }

    if (packageJson.devDependencies) {
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: version as string,
          isDev: true,
          isOptional: false,
          description: '',
        });
      });
    }

    return dependencies;
  }

  private async analyzeProjectStructure(repositoryPath: string): Promise<any> {
    const hasPackageJson = await fs.access(path.join(repositoryPath, 'package.json')).then(() => true).catch(() => false);
    const hasTests = await this.hasTestFiles(repositoryPath);
    const hasDocumentation = await this.hasDocumentation(repositoryPath);
    
    return {
      type: 'web',
      language: 'JavaScript', // Simplified
      hasPackageJson,
      hasTests,
      hasDocumentation,
      framework: 'Unknown',
    };
  }

  private async hasTestFiles(repositoryPath: string): Promise<boolean> {
    try {
      const items = await fs.readdir(repositoryPath, { withFileTypes: true });
      return items.some(item => 
        item.name.includes('test') || 
        item.name.includes('spec') || 
        item.name === '__tests__'
      );
    } catch {
      return false;
    }
  }

  private async hasDocumentation(repositoryPath: string): Promise<boolean> {
    try {
      const items = await fs.readdir(repositoryPath, { withFileTypes: true });
      return items.some(item => 
        item.name.toLowerCase().startsWith('readme') ||
        item.name.toLowerCase().includes('doc')
      );
    } catch {
      return false;
    }
  }

  private detectPrimaryLanguage(techStack: TechStackItem[]): string {
    const languages = techStack.filter(tech => tech.category === 'language');
    if (languages.length > 0) {
      return languages[0].name;
    }
    
    const frameworks = techStack.filter(tech => tech.category === 'framework');
    if (frameworks.some(f => f.name.includes('react') || f.name.includes('vue'))) {
      return 'JavaScript';
    }
    
    return 'Unknown';
  }

  private generateSummary(techStack: TechStackItem[], dependencies: DependencyInfo[], structure: any): string {
    const frameworkCount = techStack.filter(t => t.category === 'framework').length;
    const libCount = dependencies.length;
    
    return `Local repository analysis: ${frameworkCount} frameworks, ${libCount} dependencies detected. ` +
           `Project type: ${structure.type}, Primary language: ${structure.language}.`;
  }
}

export type { 
  LocalAnalysisConfig, 
  FileAnalysis, 
  CodeQualityAnalysis, 
  SecurityAnalysis, 
  PerformanceAnalysis,
  SecurityVulnerability,
  PerformanceBottleneck
};