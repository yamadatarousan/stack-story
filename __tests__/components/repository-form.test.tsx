import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RepositoryForm from '@/components/analyzer/repository-form'

// Mock fetch
global.fetch = jest.fn()

describe('RepositoryForm', () => {
  const mockOnAnalysisComplete = jest.fn()
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render form elements correctly', () => {
    render(
      <RepositoryForm 
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
      />
    )

    expect(screen.getByLabelText(/GitHub Repository URL/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Analyze Repository/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/https:\/\/github.com\/owner\/repository/i)).toBeInTheDocument()
  })

  it('should show error for invalid URL', async () => {
    render(
      <RepositoryForm 
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
      />
    )

    const input = screen.getByPlaceholderText(/https:\/\/github.com\/owner\/repository/i)
    const button = screen.getByRole('button', { name: /Analyze Repository/i })

    fireEvent.change(input, { target: { value: 'invalid-url' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid GitHub repository URL/i)).toBeInTheDocument()
    })
  })

  it('should call onAnalysisComplete on successful analysis', async () => {
    const mockResponse = {
      success: true,
      data: {
        repository: { name: 'test-repo' },
        techStack: [],
        dependencies: [],
        structure: {},
        detectedFiles: [],
        summary: 'Test summary'
      }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    render(
      <RepositoryForm 
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
      />
    )

    const input = screen.getByPlaceholderText(/https:\/\/github.com\/owner\/repository/i)
    const button = screen.getByRole('button', { name: /Analyze Repository/i })

    fireEvent.change(input, { target: { value: 'https://github.com/owner/repo' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockResponse.data)
    })
  })

  it('should show loading state during analysis', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <RepositoryForm 
        onAnalysisComplete={mockOnAnalysisComplete}
        onError={mockOnError}
      />
    )

    const input = screen.getByPlaceholderText(/https:\/\/github.com\/owner\/repository/i)
    const button = screen.getByRole('button', { name: /Analyze Repository/i })

    fireEvent.change(input, { target: { value: 'https://github.com/owner/repo' } })
    fireEvent.click(button)

    expect(screen.getByText(/Analyzing Repository.../i)).toBeInTheDocument()
    expect(button).toBeDisabled()
  })
})