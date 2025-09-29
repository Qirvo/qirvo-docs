---
sidebar_position: 10
---

# Build Process Guide

This guide covers the complete build process for Qirvo plugins, including development builds, production optimization, bundling strategies, and deployment preparation.

## Table of Contents

- [Build System Overview](#build-system-overview)
- [Development Builds](#development-builds)
- [Production Builds](#production-builds)
- [Bundle Optimization](#bundle-optimization)
- [Asset Management](#asset-management)
- [Build Automation](#build-automation)

## Build System Overview

### Build Configuration

```typescript
// Comprehensive build configuration
export interface BuildConfig {
  mode: 'development' | 'production';
  target: 'web' | 'node' | 'universal';
  entry: string;
  output: {
    path: string;
    filename: string;
    format: 'cjs' | 'esm' | 'umd';
  };
  optimization: OptimizationConfig;
  plugins: PluginConfig[];
  externals: Record<string, string>;
}

export class BuildManager {
  private config: BuildConfig;
  private compiler: any;
  
  constructor(config: BuildConfig) {
    this.config = config;
    this.setupCompiler();
  }
  
  private setupCompiler(): void {
    const webpack = require('webpack');
    const webpackConfig = this.generateWebpackConfig();
    this.compiler = webpack(webpackConfig);
  }
  
  private generateWebpackConfig(): any {
    return {
      mode: this.config.mode,
      entry: this.config.entry,
      output: {
        path: this.config.output.path,
        filename: this.config.output.filename,
        library: {
          type: this.config.output.format === 'cjs' ? 'commonjs2' : 
                this.config.output.format === 'esm' ? 'module' : 'umd'
        },
        clean: true
      },
      externals: this.config.externals,
      module: {
        rules: this.getModuleRules()
      },
      plugins: this.getWebpackPlugins(),
      optimization: this.getOptimizationConfig(),
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
          '@': path.resolve(process.cwd(), 'src')
        }
      }
    };
  }
  
  private getModuleRules(): any[] {
    return [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
              transpileOnly: this.config.mode === 'development'
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          this.config.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash][ext]'
        }
      }
    ];
  }
  
  async build(): Promise<BuildResult> {
    return new Promise((resolve, reject) => {
      this.compiler.run((err: any, stats: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        const result: BuildResult = {
          success: !stats.hasErrors(),
          errors: stats.compilation.errors,
          warnings: stats.compilation.warnings,
          assets: this.extractAssetInfo(stats),
          buildTime: stats.endTime - stats.startTime,
          bundleSize: this.calculateBundleSize(stats)
        };
        
        resolve(result);
      });
    });
  }
  
  async watch(callback: (result: BuildResult) => void): Promise<void> {
    this.compiler.watch({
      aggregateTimeout: 300,
      poll: undefined
    }, (err: any, stats: any) => {
      if (err) {
        console.error('Build error:', err);
        return;
      }
      
      const result: BuildResult = {
        success: !stats.hasErrors(),
        errors: stats.compilation.errors,
        warnings: stats.compilation.warnings,
        assets: this.extractAssetInfo(stats),
        buildTime: stats.endTime - stats.startTime,
        bundleSize: this.calculateBundleSize(stats)
      };
      
      callback(result);
    });
  }
}

interface BuildResult {
  success: boolean;
  errors: any[];
  warnings: any[];
  assets: AssetInfo[];
  buildTime: number;
  bundleSize: number;
}

interface AssetInfo {
  name: string;
  size: number;
  type: string;
}
```

## Development Builds

### Development Configuration

```typescript
// Development-specific build configuration
export class DevelopmentBuilder extends BuildManager {
  constructor() {
    super({
      mode: 'development',
      target: 'web',
      entry: './src/index.ts',
      output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'plugin.js',
        format: 'cjs'
      },
      optimization: {
        minimize: false,
        splitChunks: false,
        sideEffects: false
      },
      plugins: [
        'HotModuleReplacementPlugin',
        'SourceMapDevToolPlugin'
      ],
      externals: {
        '@qirvo/plugin-sdk': 'commonjs2 @qirvo/plugin-sdk',
        'react': 'commonjs2 react',
        'react-dom': 'commonjs2 react-dom'
      }
    });
  }
  
  async startDevServer(): Promise<DevServer> {
    const webpack = require('webpack');
    const WebpackDevServer = require('webpack-dev-server');
    
    const devServerConfig = {
      static: {
        directory: path.join(process.cwd(), 'public')
      },
      hot: true,
      port: 3001,
      open: false,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      }
    };
    
    const server = new WebpackDevServer(devServerConfig, this.compiler);
    await server.start();
    
    return new DevServer(server, devServerConfig.port);
  }
}

export class DevServer {
  private server: any;
  private port: number;
  
  constructor(server: any, port: number) {
    this.server = server;
    this.port = port;
  }
  
  getUrl(): string {
    return `http://localhost:${this.port}`;
  }
  
  async stop(): Promise<void> {
    await this.server.stop();
  }
  
  onReload(callback: () => void): void {
    this.server.middleware.waitUntilValid(callback);
  }
}
```

### Hot Module Replacement

```typescript
// HMR setup for plugin development
export class HMRManager {
  private static instance: HMRManager;
  private updateHandlers: Map<string, () => void> = new Map();
  
  static getInstance(): HMRManager {
    if (!this.instance) {
      this.instance = new HMRManager();
    }
    return this.instance;
  }
  
  setup(): void {
    if (module.hot) {
      module.hot.accept();
      
      // Handle plugin updates
      module.hot.accept('./plugin', () => {
        this.handlePluginUpdate();
      });
      
      // Handle component updates
      module.hot.accept('./components', () => {
        this.handleComponentUpdate();
      });
      
      // Handle style updates
      module.hot.accept('./styles', () => {
        this.handleStyleUpdate();
      });
    }
  }
  
  private handlePluginUpdate(): void {
    console.log('🔄 Plugin updated, reloading...');
    
    // Notify update handlers
    this.updateHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('HMR update handler failed:', error);
      }
    });
    
    // Reload plugin instance
    this.reloadPlugin();
  }
  
  private handleComponentUpdate(): void {
    console.log('🎨 Components updated');
    // React Fast Refresh will handle component updates
  }
  
  private handleStyleUpdate(): void {
    console.log('💄 Styles updated');
    // CSS updates are handled automatically
  }
  
  private reloadPlugin(): void {
    // Implementation would reload the plugin instance
    window.location.reload();
  }
  
  onUpdate(id: string, handler: () => void): void {
    this.updateHandlers.set(id, handler);
  }
  
  offUpdate(id: string): void {
    this.updateHandlers.delete(id);
  }
}
```

## Production Builds

### Production Optimization

```typescript
// Production build configuration with optimizations
export class ProductionBuilder extends BuildManager {
  constructor() {
    super({
      mode: 'production',
      target: 'web',
      entry: './src/index.ts',
      output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'plugin.[contenthash].js',
        format: 'cjs'
      },
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        },
        sideEffects: false,
        usedExports: true
      },
      plugins: [
        'TerserPlugin',
        'MiniCssExtractPlugin',
        'CompressionPlugin',
        'BundleAnalyzerPlugin'
      ],
      externals: {
        '@qirvo/plugin-sdk': 'commonjs2 @qirvo/plugin-sdk',
        'react': 'commonjs2 react',
        'react-dom': 'commonjs2 react-dom'
      }
    });
  }
  
  private getOptimizationConfig(): any {
    const TerserPlugin = require('terser-webpack-plugin');
    const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
    
    return {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug']
            },
            mangle: {
              keep_fnames: false
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      usedExports: true,
      sideEffects: false
    };
  }
  
  async buildForProduction(): Promise<ProductionBuildResult> {
    console.log('🏗️ Starting production build...');
    
    const startTime = Date.now();
    const result = await this.build();
    const buildTime = Date.now() - startTime;
    
    if (result.success) {
      console.log('✅ Production build completed successfully');
      
      // Generate build report
      const report = await this.generateBuildReport(result);
      
      // Validate build
      const validation = await this.validateBuild();
      
      return {
        ...result,
        buildTime,
        report,
        validation
      };
    } else {
      console.error('❌ Production build failed');
      throw new Error('Build failed');
    }
  }
  
  private async generateBuildReport(result: BuildResult): Promise<BuildReport> {
    return {
      timestamp: new Date().toISOString(),
      bundleSize: result.bundleSize,
      assets: result.assets,
      dependencies: await this.analyzeDependencies(),
      performance: await this.analyzePerformance(result)
    };
  }
  
  private async validateBuild(): Promise<ValidationResult> {
    const validations: ValidationCheck[] = [];
    
    // Check bundle size
    const bundleSize = await this.getBundleSize();
    validations.push({
      name: 'Bundle Size',
      passed: bundleSize < 1024 * 1024, // 1MB limit
      message: bundleSize < 1024 * 1024 ? 
        `Bundle size OK (${(bundleSize / 1024).toFixed(2)}KB)` :
        `Bundle size too large (${(bundleSize / 1024 / 1024).toFixed(2)}MB)`
    });
    
    // Check for source maps in production
    const hasSourceMaps = await this.checkForSourceMaps();
    validations.push({
      name: 'Source Maps',
      passed: !hasSourceMaps,
      message: hasSourceMaps ? 
        'Source maps found in production build' :
        'No source maps in production build'
    });
    
    // Check for console statements
    const hasConsoleStatements = await this.checkForConsoleStatements();
    validations.push({
      name: 'Console Statements',
      passed: !hasConsoleStatements,
      message: hasConsoleStatements ?
        'Console statements found in production build' :
        'No console statements in production build'
    });
    
    return {
      passed: validations.every(v => v.passed),
      checks: validations
    };
  }
}

interface ProductionBuildResult extends BuildResult {
  report: BuildReport;
  validation: ValidationResult;
}

interface BuildReport {
  timestamp: string;
  bundleSize: number;
  assets: AssetInfo[];
  dependencies: DependencyInfo[];
  performance: PerformanceInfo;
}

interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
}

interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
}
```

## Bundle Optimization

### Code Splitting Strategy

```typescript
// Advanced code splitting and optimization
export class BundleOptimizer {
  private analyzer: BundleAnalyzer;
  
  constructor() {
    this.analyzer = new BundleAnalyzer();
  }
  
  async optimizeBundle(config: BuildConfig): Promise<OptimizationResult> {
    const analysis = await this.analyzer.analyze();
    const optimizations: Optimization[] = [];
    
    // Identify large dependencies
    const largeDependencies = analysis.dependencies
      .filter(dep => dep.size > 100 * 1024) // > 100KB
      .sort((a, b) => b.size - a.size);
    
    if (largeDependencies.length > 0) {
      optimizations.push({
        type: 'dependency-splitting',
        description: 'Split large dependencies into separate chunks',
        impact: 'Improved caching and loading performance',
        dependencies: largeDependencies.map(dep => dep.name)
      });
    }
    
    // Check for duplicate code
    const duplicates = await this.findDuplicateCode(analysis);
    if (duplicates.length > 0) {
      optimizations.push({
        type: 'deduplication',
        description: 'Remove duplicate code across chunks',
        impact: 'Reduced bundle size',
        duplicates
      });
    }
    
    // Analyze unused exports
    const unusedExports = await this.findUnusedExports(analysis);
    if (unusedExports.length > 0) {
      optimizations.push({
        type: 'tree-shaking',
        description: 'Remove unused exports',
        impact: 'Reduced bundle size',
        unusedExports
      });
    }
    
    return {
      currentSize: analysis.totalSize,
      optimizations,
      estimatedSavings: this.calculateSavings(optimizations)
    };
  }
  
  generateSplitChunksConfig(analysis: BundleAnalysis): any {
    return {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        
        // Large libraries get their own chunk
        ...this.generateLargeLibraryChunks(analysis),
        
        // Common code
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    };
  }
  
  private generateLargeLibraryChunks(analysis: BundleAnalysis): any {
    const largeLibs = analysis.dependencies
      .filter(dep => dep.size > 200 * 1024) // > 200KB
      .reduce((chunks, dep) => {
        const chunkName = dep.name.replace(/[^a-zA-Z0-9]/g, '');
        chunks[chunkName] = {
          test: new RegExp(`[\\/]node_modules[\\/]${dep.name}[\\/]`),
          name: chunkName,
          chunks: 'all',
          priority: 15
        };
        return chunks;
      }, {} as any);
    
    return largeLibs;
  }
  
  private async findDuplicateCode(analysis: BundleAnalysis): Promise<string[]> {
    // Implementation would analyze for duplicate code patterns
    return [];
  }
  
  private async findUnusedExports(analysis: BundleAnalysis): Promise<string[]> {
    // Implementation would analyze for unused exports
    return [];
  }
  
  private calculateSavings(optimizations: Optimization[]): number {
    // Calculate estimated size savings from optimizations
    return optimizations.reduce((total, opt) => {
      switch (opt.type) {
        case 'deduplication':
          return total + 50 * 1024; // Estimated 50KB savings
        case 'tree-shaking':
          return total + 30 * 1024; // Estimated 30KB savings
        default:
          return total;
      }
    }, 0);
  }
}

interface BundleAnalysis {
  totalSize: number;
  dependencies: DependencyInfo[];
  chunks: ChunkInfo[];
}

interface DependencyInfo {
  name: string;
  size: number;
  version: string;
  used: boolean;
}

interface ChunkInfo {
  name: string;
  size: number;
  modules: string[];
}

interface Optimization {
  type: string;
  description: string;
  impact: string;
  [key: string]: any;
}

interface OptimizationResult {
  currentSize: number;
  optimizations: Optimization[];
  estimatedSavings: number;
}
```

## Asset Management

### Asset Processing Pipeline

```typescript
// Comprehensive asset management
export class AssetManager {
  private processors: Map<string, AssetProcessor> = new Map();
  
  constructor() {
    this.setupProcessors();
  }
  
  private setupProcessors(): void {
    // Image processor
    this.processors.set('image', new ImageProcessor());
    
    // Font processor
    this.processors.set('font', new FontProcessor());
    
    // CSS processor
    this.processors.set('css', new CSSProcessor());
    
    // JavaScript processor
    this.processors.set('js', new JavaScriptProcessor());
  }
  
  async processAssets(assets: Asset[]): Promise<ProcessedAsset[]> {
    const processedAssets: ProcessedAsset[] = [];
    
    for (const asset of assets) {
      const processor = this.processors.get(asset.type);
      if (processor) {
        const processed = await processor.process(asset);
        processedAssets.push(processed);
      } else {
        // No processor, copy as-is
        processedAssets.push({
          ...asset,
          processed: true,
          optimizations: []
        });
      }
    }
    
    return processedAssets;
  }
  
  async optimizeAssets(assets: ProcessedAsset[]): Promise<OptimizedAsset[]> {
    const optimized: OptimizedAsset[] = [];
    
    for (const asset of assets) {
      const processor = this.processors.get(asset.type);
      if (processor && processor.optimize) {
        const optimizedAsset = await processor.optimize(asset);
        optimized.push(optimizedAsset);
      } else {
        optimized.push(asset as OptimizedAsset);
      }
    }
    
    return optimized;
  }
}

// Image processor
class ImageProcessor implements AssetProcessor {
  async process(asset: Asset): Promise<ProcessedAsset> {
    const optimizations: string[] = [];
    
    // Compress images
    if (asset.size > 100 * 1024) { // > 100KB
      optimizations.push('compression');
    }
    
    // Generate WebP versions
    if (asset.name.match(/\.(jpg|jpeg|png)$/i)) {
      optimizations.push('webp-generation');
    }
    
    // Generate responsive sizes
    if (asset.name.match(/\.(jpg|jpeg|png)$/i)) {
      optimizations.push('responsive-sizes');
    }
    
    return {
      ...asset,
      processed: true,
      optimizations
    };
  }
  
  async optimize(asset: ProcessedAsset): Promise<OptimizedAsset> {
    let optimizedSize = asset.size;
    const variants: AssetVariant[] = [];
    
    // Apply compression
    if (asset.optimizations.includes('compression')) {
      optimizedSize *= 0.7; // Estimated 30% compression
    }
    
    // Generate WebP variant
    if (asset.optimizations.includes('webp-generation')) {
      variants.push({
        format: 'webp',
        size: optimizedSize * 0.8, // WebP is ~20% smaller
        url: asset.url.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      });
    }
    
    // Generate responsive variants
    if (asset.optimizations.includes('responsive-sizes')) {
      const sizes = [480, 768, 1024, 1920];
      sizes.forEach(width => {
        variants.push({
          format: 'responsive',
          size: optimizedSize * (width / 1920), // Proportional size
          url: asset.url.replace(/(\.[^.]+)$/, `@${width}w$1`),
          width
        });
      });
    }
    
    return {
      ...asset,
      optimizedSize,
      variants,
      compressionRatio: asset.size / optimizedSize
    };
  }
}

// CSS processor
class CSSProcessor implements AssetProcessor {
  async process(asset: Asset): Promise<ProcessedAsset> {
    const optimizations: string[] = [];
    
    // Minification
    optimizations.push('minification');
    
    // Autoprefixer
    optimizations.push('autoprefixer');
    
    // Critical CSS extraction
    if (asset.name.includes('main') || asset.name.includes('app')) {
      optimizations.push('critical-css');
    }
    
    return {
      ...asset,
      processed: true,
      optimizations
    };
  }
  
  async optimize(asset: ProcessedAsset): Promise<OptimizedAsset> {
    let optimizedSize = asset.size;
    
    // Minification saves ~30%
    if (asset.optimizations.includes('minification')) {
      optimizedSize *= 0.7;
    }
    
    return {
      ...asset,
      optimizedSize,
      variants: [],
      compressionRatio: asset.size / optimizedSize
    };
  }
}

interface Asset {
  name: string;
  type: string;
  url: string;
  size: number;
  content?: Buffer | string;
}

interface ProcessedAsset extends Asset {
  processed: boolean;
  optimizations: string[];
}

interface OptimizedAsset extends ProcessedAsset {
  optimizedSize: number;
  variants: AssetVariant[];
  compressionRatio: number;
}

interface AssetVariant {
  format: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
}

interface AssetProcessor {
  process(asset: Asset): Promise<ProcessedAsset>;
  optimize?(asset: ProcessedAsset): Promise<OptimizedAsset>;
}
```

## Build Automation

### CI/CD Integration

```typescript
// Build automation for CI/CD pipelines
export class BuildAutomation {
  private config: AutomationConfig;
  
  constructor(config: AutomationConfig) {
    this.config = config;
  }
  
  async runPipeline(): Promise<PipelineResult> {
    const steps: PipelineStep[] = [
      { name: 'install', fn: () => this.installDependencies() },
      { name: 'lint', fn: () => this.runLinting() },
      { name: 'test', fn: () => this.runTests() },
      { name: 'build', fn: () => this.runBuild() },
      { name: 'validate', fn: () => this.validateBuild() },
      { name: 'package', fn: () => this.packagePlugin() }
    ];
    
    const results: StepResult[] = [];
    let failed = false;
    
    for (const step of steps) {
      if (failed && !step.continueOnFailure) {
        results.push({
          name: step.name,
          status: 'skipped',
          duration: 0
        });
        continue;
      }
      
      console.log(`🔄 Running step: ${step.name}`);
      const startTime = Date.now();
      
      try {
        await step.fn();
        const duration = Date.now() - startTime;
        
        results.push({
          name: step.name,
          status: 'success',
          duration
        });
        
        console.log(`✅ Step ${step.name} completed in ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - startTime;
        failed = true;
        
        results.push({
          name: step.name,
          status: 'failed',
          duration,
          error: error.message
        });
        
        console.error(`❌ Step ${step.name} failed: ${error.message}`);
      }
    }
    
    return {
      success: !failed,
      steps: results,
      totalDuration: results.reduce((sum, step) => sum + step.duration, 0)
    };
  }
  
  private async installDependencies(): Promise<void> {
    const { execSync } = require('child_process');
    execSync('npm ci', { stdio: 'inherit' });
  }
  
  private async runLinting(): Promise<void> {
    const { execSync } = require('child_process');
    execSync('npm run lint', { stdio: 'inherit' });
  }
  
  private async runTests(): Promise<void> {
    const { execSync } = require('child_process');
    execSync('npm run test:ci', { stdio: 'inherit' });
  }
  
  private async runBuild(): Promise<void> {
    const builder = new ProductionBuilder();
    const result = await builder.buildForProduction();
    
    if (!result.success) {
      throw new Error('Build failed');
    }
  }
  
  private async validateBuild(): Promise<void> {
    // Validate build artifacts
    const requiredFiles = ['dist/plugin.js', 'manifest.json', 'package.json'];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
  }
  
  private async packagePlugin(): Promise<void> {
    const packager = new PluginPackager();
    await packager.createPackage();
  }
}

interface AutomationConfig {
  environment: 'development' | 'staging' | 'production';
  skipTests?: boolean;
  skipLinting?: boolean;
  outputDir?: string;
}

interface PipelineStep {
  name: string;
  fn: () => Promise<void>;
  continueOnFailure?: boolean;
}

interface StepResult {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface PipelineResult {
  success: boolean;
  steps: StepResult[];
  totalDuration: number;
}
```

This build process guide provides comprehensive tools and strategies for building, optimizing, and deploying Qirvo plugins efficiently.

**Next**: [Distribution Methods](./distribution)
