import { API_CONFIG, API_METHODS, API_HEADERS, API_STATUS_CODES } from '../constants/api';
import { ApiResponse, ApiError } from '../types/app';
class ApiService {
  private baseURL: string;
  private credentials: { username: string; password: string };

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.credentials = API_CONFIG.CREDENTIALS;
  }

  private getAuthHeaders(): Record<string, string> {
    // Use username and password directly in headers
    return {
      ...API_HEADERS,
      'X-Username': this.credentials.username,
      'X-Password': this.credentials.password,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = API_METHODS.GET,
    data?: any,
    useAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = useAuth ? this.getAuthHeaders() : API_HEADERS;
      
      const config: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok) {
        throw this.handleError(response.status, responseData);
      }

      return {
        data: responseData,
        status: response.status,
        message: 'Success',
      };
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private handleError(status: number, data: any): ApiError {
    return {
      status,
      message: data.message || 'An error occurred',
      code: data.code,
    };
  }

  // GET request
  async get<T>(endpoint: string, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, API_METHODS.GET, undefined, useAuth);
  }

  // POST request
  async post<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, API_METHODS.POST, data, useAuth);
  }

  // PUT request
  async put<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, API_METHODS.PUT, data, useAuth);
  }

  // DELETE request
  async delete<T>(endpoint: string, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, API_METHODS.DELETE, undefined, useAuth);
  }
}

export const apiService = new ApiService();
