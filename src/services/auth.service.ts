import { api, USE_MOCK, mockDelay, ApiClientError, toClientError } from "./api";
import { mockUser } from "./mock-db";
import type {
  ApiSuccess,
  AuthPayload,
  LoginDTO,
  RegisterDTO,
  UserResponseDTO,
} from "@/types/api";

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-payload.mock-signature";

export const authService = {
  async login(dto: LoginDTO): Promise<AuthPayload> {
    if (USE_MOCK) {
      if (!dto.email.includes("@") || dto.password.length < 6) {
        throw new ApiClientError(
          "UNAUTHORIZED",
          "E-mail ou senha inválidos",
          401,
        );
      }
      return mockDelay({
        user: { ...mockUser, name: mockUser.name, email: dto.email },
        token: FAKE_TOKEN,
      });
    }
    try {
      const { data } = await api.post<ApiSuccess<AuthPayload>>(
        "/auth/login",
        dto,
      );
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async register(dto: RegisterDTO): Promise<AuthPayload> {
    if (USE_MOCK) {
      return mockDelay({
        user: {
          ...mockUser,
          id: crypto.randomUUID(),
          name: dto.name,
          email: dto.email,
          created_at: new Date().toISOString(),
        },
        token: FAKE_TOKEN,
      });
    }
    try {
      const { data } = await api.post<ApiSuccess<AuthPayload>>(
        "/auth/register",
        dto,
      );
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },

  async me(): Promise<UserResponseDTO> {
    if (USE_MOCK) return mockDelay(mockUser);
    try {
      const { data } = await api.get<ApiSuccess<UserResponseDTO>>("/auth/me");
      return data.data;
    } catch (e) {
      throw toClientError(e);
    }
  },
};
