import { parseGitHubUrl } from '@/lib/github'

describe('GitHub Utils', () => {
  describe('parseGitHubUrl', () => {
    it('should parse valid GitHub URLs correctly', () => {
      const testCases = [
        {
          url: 'https://github.com/owner/repo',
          expected: { owner: 'owner', repo: 'repo' }
        },
        {
          url: 'https://github.com/owner/repo.git',
          expected: { owner: 'owner', repo: 'repo' }
        },
        {
          url: 'github.com/owner/repo',
          expected: { owner: 'owner', repo: 'repo' }
        }
      ]

      testCases.forEach(({ url, expected }) => {
        const result = parseGitHubUrl(url)
        expect(result).toEqual(expected)
      })
    })

    it('should return null for invalid URLs', () => {
      const invalidUrls = [
        'https://gitlab.com/owner/repo',
        'not-a-url',
        'https://github.com/owner',
        ''
      ]

      invalidUrls.forEach(url => {
        const result = parseGitHubUrl(url)
        expect(result).toBeNull()
      })
    })
  })
})