// Serviço de perfil — usa /auth/me da API oficial para leitura.
// Atualizações de perfil dependem de endpoint dedicado no back-end.

import { authService } from "./auth.service";
import type { UserResponseDTO } from "@/types/api";

export const profileService = {
  async get(): Promise<UserResponseDTO> {
    return authService.me();
  },
};
