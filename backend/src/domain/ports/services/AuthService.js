// Puerto AuthService — Contrato para autenticación
// Capa: domain/ports (interfaz, no implementación)

/**
 * @interface AuthService
 *
 * Métodos que debe implementar cualquier servicio de auth:
 *   hashPassword(password)          → string (hash)
 *   comparePassword(password, hash) → boolean
 *   generarToken(payload)           → string (JWT)
 *   verificarToken(token)           → payload | null
 *   generarRefreshToken(payload)    → string
 *   verificarRefreshToken(token)    → payload | null
 */

class AuthService {
  async hashPassword(password) {
    throw new Error('Método hashPassword() no implementado');
  }

  async comparePassword(password, hash) {
    throw new Error('Método comparePassword() no implementado');
  }

  generarToken(payload) {
    throw new Error('Método generarToken() no implementado');
  }

  verificarToken(token) {
    throw new Error('Método verificarToken() no implementado');
  }

  generarRefreshToken(payload) {
    throw new Error('Método generarRefreshToken() no implementado');
  }

  verificarRefreshToken(token) {
    throw new Error('Método verificarRefreshToken() no implementado');
  }
}

module.exports = { AuthService };
