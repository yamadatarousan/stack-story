import { analyzePackageJson } from '@/lib/analyzer'

describe('Analyzer', () => {
  describe('analyzePackageJson', () => {
    it('should analyze React project correctly', () => {
      const packageJson = {
        name: 'test-project',
        dependencies: {
          react: '^18.0.0',
          next: '^13.0.0'
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/react': '^18.0.0'
        }
      }

      const result = analyzePackageJson(JSON.stringify(packageJson))

      expect(result.techStack).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'React',
            category: 'framework',
            confidence: 0.95
          }),
          expect.objectContaining({
            name: 'Next.js',
            category: 'framework',
            confidence: 0.95
          }),
          expect.objectContaining({
            name: 'TypeScript',
            category: 'language',
            confidence: 0.9
          })
        ])
      )

      expect(result.dependencies).toHaveLength(4)
      expect(result.structure.language).toBe('TypeScript')
      expect(result.structure.framework).toBe('Next.js')
      expect(result.structure.type).toBe('web')
    })

    it('should handle empty package.json', () => {
      const result = analyzePackageJson('{}')

      expect(result.techStack).toEqual([])
      expect(result.dependencies).toEqual([])
      expect(result.structure.language).toBeUndefined()
    })

    it('should handle invalid JSON', () => {
      const result = analyzePackageJson('invalid json')

      expect(result.techStack).toEqual([])
      expect(result.dependencies).toEqual([])
      expect(result.structure).toEqual({})
    })
  })
})