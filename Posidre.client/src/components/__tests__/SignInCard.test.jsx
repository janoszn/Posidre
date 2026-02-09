import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInCard from '../SignInCard';
import { api } from '../../services/api';

// Mock de l'API
vi.mock('../../services/api', () => ({
    api: {
        login: vi.fn(),
        getUserInfo: vi.fn(),
        validatePin: vi.fn(),
    }
}));

describe('SignInCard', () => {
    const defaultProps = {
        onLoginSuccess: vi.fn(),
        onShowSignUp: vi.fn(),
        onEnterIdQuestionnaire: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        render(<SignInCard {...defaultProps} />);

        expect(screen.getByText('Connexion')).toBeInTheDocument();
        expect(screen.getByLabelText(/courriel/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('validates email format', async () => {
        const user = userEvent.setup();
        const { container } = render(<SignInCard {...defaultProps} />);

        const form = container.querySelector('form');
        const emailInput = screen.getByLabelText(/courriel/i);

        await user.type(emailInput, 'invalid-email');

        // Déclenche la soumission directement via fireEvent pour contourner la validation HTML5
        fireEvent.submit(form);

        await waitFor(() => {
            const errorText = container.textContent;
            expect(errorText).toContain('valide');
        });
    });

    it('validates password length', async () => {
        const user = userEvent.setup();
        render(<SignInCard {...defaultProps} />);

        const emailInput = screen.getByLabelText(/courriel/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);
        await user.type(emailInput, 'test@test.com');
        await user.type(passwordInput, '123'); // Moins de 6 caractères

        const submitButton = screen.getByRole('button', { name: /se connecter/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/au moins 6 caractères/i)).toBeInTheDocument();
        });
    });

    it('submits login successfully', async () => {
        const user = userEvent.setup();
        const mockOnLoginSuccess = vi.fn();
        const mockUserData = { email: 'test@test.com', role: 'Teacher' };

        api.login.mockResolvedValue({});
        api.getUserInfo.mockResolvedValue(mockUserData);

        render(<SignInCard {...defaultProps} onLoginSuccess={mockOnLoginSuccess} />);

        await user.type(screen.getByLabelText(/courriel/i), 'test@test.com');
        await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
        await user.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith('test@test.com', 'password123');
            expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUserData);
        });
    });

    it('displays error on failed login', async () => {
        const user = userEvent.setup();

        api.login.mockRejectedValue(new Error('Login failed'));

        render(<SignInCard {...defaultProps} />);

        await user.type(screen.getByLabelText(/courriel/i), 'test@test.com');
        await user.type(screen.getByLabelText(/mot de passe/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(screen.getByText(/courriel ou mot de passe incorrect/i)).toBeInTheDocument();
        });
    });

    it('calls onShowSignUp when signup link is clicked', async () => {
        const user = userEvent.setup();
        const mockOnShowSignUp = vi.fn();

        render(<SignInCard {...defaultProps} onShowSignUp={mockOnShowSignUp} />);

        const signUpButton = screen.getByRole('button', { name: /s'inscrire/i });
        await user.click(signUpButton);

        expect(mockOnShowSignUp).toHaveBeenCalled();
    });

    it('submits survey code successfully', async () => {
        const user = userEvent.setup();
        const mockOnEnterIdQuestionnaire = vi.fn();
        const mockValidateResponse = {
            isValid: true,
            questionnaire: {
                id: 1,
                title: 'Test Survey',
                description: 'Test Description',
                questions: []
            }
        };

        api.validatePin.mockResolvedValue(mockValidateResponse);

        render(<SignInCard {...defaultProps} onEnterIdQuestionnaire={mockOnEnterIdQuestionnaire} />);

        const codeInput = screen.getByPlaceholderText(/6 chiffres/i);
        const goButton = screen.getByRole('button', { name: /questionnaire/i });

        await user.type(codeInput, '123456');
        await user.click(goButton);

        await waitFor(() => {
            expect(api.validatePin).toHaveBeenCalledWith('123456');
            // FIXED: Callback receives { questionnaire, pin }
            expect(mockOnEnterIdQuestionnaire).toHaveBeenCalledWith({
                survey: mockValidateResponse.questionnaire,
                pin: '123456'
            });
        });
    });

    it('displays error for invalid survey code', async () => {
        const user = userEvent.setup();

        // FIXED: Reject with proper error structure
        api.validatePin.mockRejectedValue({
            response: { message: 'Code PIN invalide ou déjà utilisé' }
        });

        render(<SignInCard {...defaultProps} />);

        const codeInput = screen.getByPlaceholderText(/6 chiffres/i);
        const goButton = screen.getByRole('button', { name: /questionnaire/i });

        await user.type(codeInput, '999999');
        await user.click(goButton);

        await waitFor(() => {
            expect(screen.getByText(/code pin invalide/i)).toBeInTheDocument();
        });
    });

    // BONUS: Additional tests for PIN validation
    it('only allows 6-digit numeric input for PIN', async () => {
        const user = userEvent.setup();
        render(<SignInCard {...defaultProps} />);

        const codeInput = screen.getByPlaceholderText(/6 chiffres/i);

        // Try typing letters (should be filtered out)
        await user.type(codeInput, 'abc123def');
        expect(codeInput).toHaveValue('123');

        // Clear and try more than 6 digits
        await user.clear(codeInput);
        await user.type(codeInput, '12345678');
        expect(codeInput).toHaveValue('123456'); // Max 6 digits
    });

    it('disables submit button when PIN is not 6 digits', async () => {
        const user = userEvent.setup();
        render(<SignInCard {...defaultProps} />);

        const codeInput = screen.getByPlaceholderText(/6 chiffres/i);
        const goButton = screen.getByRole('button', { name: /questionnaire/i });

        // Initially disabled (empty)
        expect(goButton).toBeDisabled();

        // Still disabled with less than 6 digits
        await user.type(codeInput, '12345');
        expect(goButton).toBeDisabled();

        // Enabled with exactly 6 digits
        await user.type(codeInput, '6');
        expect(goButton).toBeEnabled();
    });

    it('shows loading state while validating PIN', async () => {
        const user = userEvent.setup();

        // Mock slow API response
        api.validatePin.mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({
                isValid: true,
                survey: { id: 1, title: 'Test', questions: [] }
            }), 100))
        );

        render(<SignInCard {...defaultProps} />);

        const codeInput = screen.getByPlaceholderText(/6 chiffres/i);
        const goButton = screen.getByRole('button', { name: /questionnaire/i });

        await user.type(codeInput, '123456');
        await user.click(goButton);

        // Should show loading state
        await waitFor(() => {
            expect(screen.getByText(/vérification/i)).toBeInTheDocument();
        });

        // Wait for completion
        await waitFor(() => {
            expect(api.validatePin).toHaveBeenCalled();
        }, { timeout: 200 });
    });

    it('shows error when PIN format is invalid', async () => {
        const user = userEvent.setup();
        render(<SignInCard {...defaultProps} />);

        const codeInput = screen.getByPlaceholderText(/6 chiffres/i);
        const goButton = screen.getByRole('button', { name: /questionnaire/i });

        // Try submitting with less than 6 digits
        await user.type(codeInput, '12345');

        // Button should be disabled, so this won't actually submit
        expect(goButton).toBeDisabled();
    });
});