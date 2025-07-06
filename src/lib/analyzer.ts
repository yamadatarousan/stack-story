import { TechStackItem, DependencyInfo, ProjectStructure, DetectedFile, AnalysisResult } from '@/types';

/**
 * package.jsonを解析してTechStackと依存関係を抽出
 */
export function analyzePackageJson(content: string): {
  techStack: TechStackItem[];
  dependencies: DependencyInfo[];
  structure: Partial<ProjectStructure>;
} {
  try {
    const pkg = JSON.parse(content);
    const techStack: TechStackItem[] = [];
    const dependencies: DependencyInfo[] = [];
    const structure: Partial<ProjectStructure> = {};

    // 依存関係の解析
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};
    const optionalDeps = pkg.optionalDependencies || {};

    // 依存関係をリストに追加
    Object.entries(deps).forEach(([name, version]) => {
      dependencies.push({
        name,
        version: version as string,
        isDev: false,
        isOptional: false,
        description: getPackageDescription(name),
      });
    });

    Object.entries(devDeps).forEach(([name, version]) => {
      dependencies.push({
        name,
        version: version as string,
        isDev: true,
        isOptional: false,
        description: getPackageDescription(name),
      });
    });

    Object.entries(optionalDeps).forEach(([name, version]) => {
      dependencies.push({
        name,
        version: version as string,
        isDev: false,
        isOptional: true,
        description: getPackageDescription(name),
      });
    });

    // 技術スタックの推定
    const allDeps = { ...deps, ...devDeps };
    
    // フレームワークの検出
    if (allDeps.react) {
      techStack.push({
        name: 'React',
        version: allDeps.react,
        category: 'framework',
        description: 'JavaScript library for building user interfaces',
        confidence: 0.95,
      });
    }

    if (allDeps.next) {
      techStack.push({
        name: 'Next.js',
        version: allDeps.next,
        category: 'framework',
        description: 'React framework for production',
        confidence: 0.95,
      });
      structure.framework = 'Next.js';
      structure.type = 'web';
    }

    if (allDeps.vue) {
      techStack.push({
        name: 'Vue.js',
        version: allDeps.vue,
        category: 'framework',
        description: 'Progressive JavaScript framework',
        confidence: 0.95,
      });
      structure.framework = 'Vue.js';
      structure.type = 'web';
    }

    if (allDeps.nuxt) {
      techStack.push({
        name: 'Nuxt.js',
        version: allDeps.nuxt,
        category: 'framework',
        description: 'Vue.js framework for server-side rendering',
        confidence: 0.95,
      });
      structure.framework = 'Nuxt.js';
      structure.type = 'web';
    }

    if (allDeps.angular || allDeps['@angular/core']) {
      techStack.push({
        name: 'Angular',
        version: allDeps.angular || allDeps['@angular/core'],
        category: 'framework',
        description: 'Platform for building mobile and desktop web applications',
        confidence: 0.95,
      });
      structure.framework = 'Angular';
      structure.type = 'web';
    }

    if (allDeps.svelte) {
      techStack.push({
        name: 'Svelte',
        version: allDeps.svelte,
        category: 'framework',
        description: 'Cybernetically enhanced web apps',
        confidence: 0.95,
      });
      structure.framework = 'Svelte';
      structure.type = 'web';
    }

    // 言語・ツール
    if (allDeps.typescript || devDeps.typescript) {
      techStack.push({
        name: 'TypeScript',
        version: allDeps.typescript || devDeps.typescript,
        category: 'language',
        description: 'Typed superset of JavaScript',
        confidence: 0.9,
      });
      structure.language = 'TypeScript';
    } else {
      structure.language = 'JavaScript';
    }

    // スタイリング
    if (allDeps.tailwindcss || devDeps.tailwindcss) {
      techStack.push({
        name: 'Tailwind CSS',
        version: allDeps.tailwindcss || devDeps.tailwindcss,
        category: 'library',
        description: 'Utility-first CSS framework',
        confidence: 0.9,
      });
    }

    if (allDeps['styled-components']) {
      techStack.push({
        name: 'Styled Components',
        version: allDeps['styled-components'],
        category: 'library',
        description: 'CSS-in-JS library for styling React components',
        confidence: 0.9,
      });
    }

    // データベース・ORM
    if (allDeps.prisma) {
      techStack.push({
        name: 'Prisma',
        version: allDeps.prisma,
        category: 'tool',
        description: 'Next-generation ORM for Node.js and TypeScript',
        confidence: 0.9,
      });
    }

    if (allDeps.mongoose) {
      techStack.push({
        name: 'Mongoose',
        version: allDeps.mongoose,
        category: 'library',
        description: 'MongoDB object modeling for Node.js',
        confidence: 0.9,
      });
    }

    // テスト
    if (allDeps.jest || devDeps.jest) {
      techStack.push({
        name: 'Jest',
        version: allDeps.jest || devDeps.jest,
        category: 'tool',
        description: 'JavaScript testing framework',
        confidence: 0.8,
      });
      structure.hasTests = true;
    }

    if (allDeps.vitest || devDeps.vitest) {
      techStack.push({
        name: 'Vitest',
        version: allDeps.vitest || devDeps.vitest,
        category: 'tool',
        description: 'Fast unit test framework powered by Vite',
        confidence: 0.8,
      });
      structure.hasTests = true;
    }

    // パッケージマネージャーの推定
    if (pkg.packageManager) {
      structure.packageManager = pkg.packageManager;
    }

    return { techStack, dependencies, structure };
  } catch (error) {
    console.error('Error analyzing package.json:', error);
    return { techStack: [], dependencies: [], structure: {} };
  }
}

/**
 * その他の設定ファイルを解析
 */
export function analyzeConfigFiles(files: Record<string, string | null>): {
  techStack: TechStackItem[];
  structure: Partial<ProjectStructure>;
} {
  const techStack: TechStackItem[] = [];
  const structure: Partial<ProjectStructure> = {};

  // Python プロジェクトの検出
  if (files['requirements.txt'] || files['pyproject.toml'] || files['Pipfile']) {
    structure.language = 'Python';
    structure.type = 'unknown';
  }

  // Rust プロジェクトの検出
  if (files['Cargo.toml']) {
    structure.language = 'Rust';
    structure.type = 'unknown';
    techStack.push({
      name: 'Rust',
      category: 'language',
      description: 'Systems programming language',
      confidence: 0.95,
    });
  }

  // Go プロジェクトの検出
  if (files['go.mod']) {
    structure.language = 'Go';
    structure.type = 'unknown';
    techStack.push({
      name: 'Go',
      category: 'language',
      description: 'Programming language developed by Google',
      confidence: 0.95,
    });
  }

  // Ruby プロジェクトの検出
  if (files['Gemfile']) {
    structure.language = 'Ruby';
    structure.type = 'unknown';
    techStack.push({
      name: 'Ruby',
      category: 'language',
      description: 'Dynamic programming language',
      confidence: 0.95,
    });
  }

  // Java プロジェクトの検出
  if (files['pom.xml']) {
    structure.language = 'Java';
    structure.buildTool = 'Maven';
    structure.type = 'unknown';
    techStack.push({
      name: 'Java',
      category: 'language',
      description: 'Object-oriented programming language',
      confidence: 0.95,
    });
    techStack.push({
      name: 'Maven',
      category: 'tool',
      description: 'Build automation tool for Java',
      confidence: 0.9,
    });
  }

  if (files['build.gradle'] || files['build.gradle.kts']) {
    structure.language = 'Java';
    structure.buildTool = 'Gradle';
    structure.type = 'unknown';
    techStack.push({
      name: 'Gradle',
      category: 'tool',
      description: 'Build automation tool',
      confidence: 0.9,
    });
  }

  // PHP プロジェクトの検出
  if (files['composer.json']) {
    structure.language = 'PHP';
    structure.type = 'unknown';
    techStack.push({
      name: 'PHP',
      category: 'language',
      description: 'Server-side scripting language',
      confidence: 0.95,
    });
  }

  // Docker の検出
  if (files['Dockerfile'] || files['docker-compose.yml'] || files['docker-compose.yaml']) {
    techStack.push({
      name: 'Docker',
      category: 'tool',
      description: 'Containerization platform',
      confidence: 0.9,
    });
  }

  // CI/CD の検出
  structure.hasCI = !!(files['.github/workflows'] || files['.gitlab-ci.yml'] || files['Jenkinsfile']);

  return { techStack, structure };
}

/**
 * ファイル構造を解析してプロジェクトタイプを推定
 */
export function analyzeProjectStructure(files: any[]): Partial<ProjectStructure> {
  const structure: Partial<ProjectStructure> = {};
  const fileNames = files.map(f => f.name.toLowerCase());
  const filePaths = files.map(f => f.path.toLowerCase());

  // ドキュメントの検出
  const hasReadme = fileNames.some(name => name.includes('readme'));
  const hasDocumentation = filePaths.some(path => 
    path.includes('docs/') || path.includes('documentation/') || path.includes('doc/')
  );
  structure.hasDocumentation = hasReadme || hasDocumentation;

  // テストの検出
  const hasTestFiles = filePaths.some(path => 
    path.includes('test/') || path.includes('tests/') || path.includes('__tests__/') ||
    path.includes('spec/') || path.includes('specs/') || path.includes('.test.') || path.includes('.spec.')
  );
  structure.hasTests = hasTestFiles;

  return structure;
}

/**
 * パッケージの説明を取得（簡易版）
 */
function getPackageDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'react': 'JavaScript library for building user interfaces',
    'next': 'React framework for production',
    'vue': 'Progressive JavaScript framework',
    'angular': 'Platform for building mobile and desktop web applications',
    'typescript': 'Typed superset of JavaScript',
    'tailwindcss': 'Utility-first CSS framework',
    'prisma': 'Next-generation ORM for Node.js and TypeScript',
    'jest': 'JavaScript testing framework',
    'express': 'Fast, unopinionated, minimalist web framework for Node.js',
    'axios': 'Promise-based HTTP client',
    'lodash': 'JavaScript utility library',
    'moment': 'JavaScript date library',
    'react-router': 'Declarative routing for React',
    'redux': 'Predictable state container for JavaScript apps',
    'socket.io': 'Real-time bidirectional event-based communication',
    'nodemon': 'Automatically restart Node.js application',
    'eslint': 'JavaScript linting utility',
    'prettier': 'Code formatter',
    'webpack': 'Module bundler',
    'vite': 'Next generation frontend tooling',
    'babel': 'JavaScript compiler',
  };

  return descriptions[name] || '';
}

/**
 * 完全な解析を実行
 */
export function performFullAnalysis(
  repository: any,
  configFiles: Record<string, string | null>,
  fileStructure: any[]
): AnalysisResult {
  let techStack: TechStackItem[] = [];
  let dependencies: DependencyInfo[] = [];
  let structure: ProjectStructure = {
    type: 'unknown',
    language: 'unknown',
    hasTests: false,
    hasDocumentation: false,
    hasCI: false,
  };

  // package.json の解析
  if (configFiles['package.json']) {
    const pkgAnalysis = analyzePackageJson(configFiles['package.json']);
    techStack = [...techStack, ...pkgAnalysis.techStack];
    dependencies = [...dependencies, ...pkgAnalysis.dependencies];
    structure = { ...structure, ...pkgAnalysis.structure };
  }

  // その他の設定ファイルの解析
  const configAnalysis = analyzeConfigFiles(configFiles);
  techStack = [...techStack, ...configAnalysis.techStack];
  structure = { ...structure, ...configAnalysis.structure };

  // ファイル構造の解析
  const structureAnalysis = analyzeProjectStructure(fileStructure);
  structure = { ...structure, ...structureAnalysis };

  // 重複を削除
  const uniqueTechStack = techStack.filter(
    (item, index, self) => 
      index === self.findIndex(t => t.name === item.name && t.category === item.category)
  );

  const detectedFiles: DetectedFile[] = Object.entries(configFiles)
    .filter(([_, content]) => content !== null)
    .map(([path, _]) => ({
      path,
      type: getFileType(path),
      importance: getFileImportance(path),
    }));

  const summary = generateSummary(repository, uniqueTechStack, structure);

  return {
    repository,
    techStack: uniqueTechStack,
    dependencies,
    structure: structure as ProjectStructure,
    detectedFiles,
    summary,
  };
}

function getFileType(path: string): DetectedFile['type'] {
  if (path.includes('package.json') || path.includes('requirements.txt') || path.includes('Cargo.toml')) {
    return 'package';
  }
  if (path.includes('config') || path.includes('Dockerfile') || path.includes('.json')) {
    return 'config';
  }
  if (path.includes('test') || path.includes('spec')) {
    return 'test';
  }
  if (path.includes('README') || path.includes('docs')) {
    return 'documentation';
  }
  if (path.includes('.github') || path.includes('.gitlab-ci')) {
    return 'ci';
  }
  return 'source';
}

function getFileImportance(path: string): number {
  if (path === 'package.json') return 1.0;
  if (path.includes('README')) return 0.9;
  if (path.includes('Dockerfile')) return 0.8;
  if (path.includes('tsconfig.json')) return 0.7;
  if (path.includes('next.config')) return 0.7;
  return 0.5;
}

function generateSummary(
  repository: any,
  techStack: TechStackItem[],
  structure: ProjectStructure
): string {
  const framework = techStack.find(t => t.category === 'framework')?.name || 'Unknown';
  const language = structure.language || 'Unknown';
  const type = structure.type || 'unknown';
  
  return `This is a ${type} project built with ${framework} using ${language}. ` +
         `It has ${techStack.length} main technologies and ` +
         `${structure.hasTests ? 'includes' : 'does not include'} tests.`;
}