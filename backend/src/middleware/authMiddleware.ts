import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../controllers/GerenteController";
import { IApiResponse } from "../types/models";

// Interface para payload do JWT
interface JWTPayload {
  id: number;
  email: string;
  nome: string;
  tipo: string;
  iat: number; // issued at
  exp: number; // expires at
}

/**
 * Middleware para verificar se o usuário está autenticado como gerente
 * Valida o JWT token e adiciona dados do gerente ao request
 */
export const verificarAutenticacao = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log("🔍 [AuthMiddleware] Verificando autenticação...");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ Header Authorization não encontrado");
      const response: IApiResponse = {
        sucesso: false,
        erro: "Token de acesso não fornecido",
        detalhes: "Header Authorization é obrigatório",
      };
      res.status(401).json(response);
      return;
    }

    // 2. Verificar formato do header: "Bearer TOKEN"
    const tokenParts = authHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      console.log("❌ Formato do token inválido:", authHeader);
      const response: IApiResponse = {
        sucesso: false,
        erro: "Formato de token inválido",
        detalhes: "Use: Authorization: Bearer <token>",
      };
      res.status(401).json(response);
      return;
    }

    const token = tokenParts[1];

    // 3. Verificar e decodificar o JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("❌ [ERRO CRÍTICO] JWT_SECRET não configurado no .env");
      const response: IApiResponse = {
        sucesso: false,
        erro: "Configuração de segurança inválida",
        detalhes: "Sistema não configurado corretamente. Contate o administrador.",
      };
      res.status(500).json(response);
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    console.log("✅ Token válido para gerente:", {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
      tipo: decoded.tipo,
    });

    // 4. Verificar se é realmente um gerente
    if (decoded.tipo !== "gerente") {
      console.log("❌ Token não é de gerente:", decoded.tipo);
      const response: IApiResponse = {
        sucesso: false,
        erro: "Acesso negado",
        detalhes: "Token não é de administrador",
      };
      res.status(403).json(response);
      return;
    }

    // 5. Adicionar dados do gerente ao request para uso nas rotas
    req.gerente = {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
    };

    console.log("🚀 Gerente autenticado com sucesso. Prosseguindo...");

    // 6. Continuar para a próxima função (rota protegida)
    next();
  } catch (error) {
    console.error("💥 [AuthMiddleware] Erro na autenticação:", error);

    // Tratar diferentes tipos de erro JWT
    let mensagemErro = "Token inválido";
    let detalhes = "";

    if (error instanceof jwt.TokenExpiredError) {
      mensagemErro = "Token expirado";
      detalhes = "Faça login novamente";
    } else if (error instanceof jwt.JsonWebTokenError) {
      mensagemErro = "Token malformado";
      detalhes = "Token JWT inválido";
    } else if (error instanceof jwt.NotBeforeError) {
      mensagemErro = "Token ainda não é válido";
      detalhes = "Token usado antes do tempo permitido";
    }

    const response: IApiResponse = {
      sucesso: false,
      erro: mensagemErro,
      detalhes: detalhes || "Erro na validação do token",
    };

    res.status(401).json(response);
    return;
  }
};

/**
 * Middleware opcional - permite acesso mesmo sem token
 * Usado para rotas que podem ter conteúdo diferente para admin vs público
 */
export const verificarAutenticacaoOpcional = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Se não tem header, apenas continua sem dados de gerente
    if (!authHeader) {
      console.log("ℹ️ [AuthMiddleware] Acesso sem autenticação (permitido)");
      next();
      return;
    }

    // Se tem header, tenta validar
    const tokenParts = authHeader.split(" ");

    if (tokenParts.length === 2 && tokenParts[0] === "Bearer") {
      const token = tokenParts[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        next(); // Continua sem autenticação se JWT_SECRET não estiver configurado
        return;
      }

      try {
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

        if (decoded.tipo === "gerente") {
          req.gerente = {
            id: decoded.id,
            nome: decoded.nome,
            email: decoded.email,
          };
          console.log("✅ Gerente autenticado opcionalmente:", decoded.nome);
        }
      } catch (tokenError) {
        console.log("⚠️ Token opcional inválido, continuando sem auth");
        // Ignora erro de token em middleware opcional
      }
    }

    next();
  } catch (error) {
    console.error("💥 [AuthMiddleware] Erro no middleware opcional:", error);
    // Em middleware opcional, sempre continua
    next();
  }
};

/**
 * Middleware para extrair informações básicas do token sem validar completamente
 * Útil para logs e analytics
 */
export const extrairInfoToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // Decodifica sem verificar (para pegar info básica)
      const decoded = jwt.decode(token) as JWTPayload | null;

      if (decoded) {
        console.log("📊 [AuthMiddleware] Info do token:", {
          userId: decoded.id,
          userType: decoded.tipo,
          issuedAt: new Date(decoded.iat * 1000).toISOString(),
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
        });
      }
    }

    next();
  } catch (error) {
    // Ignora erros neste middleware informativo
    next();
  }
};

/**
 * Utilitário para verificar se token está próximo do vencimento
 * Retorna true se o token expira em menos de 1 hora
 */
export const tokenPrecisaRenovacao = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload | null;

    if (!decoded || !decoded.exp) {
      return true; // Se não conseguir decodificar, considera que precisa renovar
    }

    const agora = Math.floor(Date.now() / 1000); // Timestamp atual em segundos
    const tempoRestante = decoded.exp - agora;
    const umaHora = 60 * 60; // 1 hora em segundos

    return tempoRestante < umaHora;
  } catch (error) {
    return true; // Em caso de erro, considera que precisa renovar
  }
};

export default {
  verificarAutenticacao,
  verificarAutenticacaoOpcional,
  extrairInfoToken,
  tokenPrecisaRenovacao,
};
