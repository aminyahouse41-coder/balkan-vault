export interface User {
  token: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

class AuthService {
  private baseUrl = 'http://localhost:8080';

  async login(credentials: LoginRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return response.json();
  }

  async register(userData: RegisterRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('vault_token');
  }

  getUsername(): string | null {
    return localStorage.getItem('vault_username');
  }

  setAuth(user: User): void {
    localStorage.setItem('vault_token', user.token);
    localStorage.setItem('vault_username', user.username);
  }

  logout(): void {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_username');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();