// backend/src/controllers/GerenteController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Gerente } from "../models";
import {
  IApiResponse,
  ILoginGerenteDTO,
  ICriarGerenteDTO,
  IGerenteResponse,
} from "../types/models";

// Interface para Request com gerente autenticado
export interface AuthenticatedRequest extends Request {
  gerente?: {
    id: number;
    nome: string;
    email: string;
  };
}

export class GerenteController {
  // POST /api/gerente/login - Fazer login
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha }: ILoginGerenteDTO = req.body;

      console.log("🔐 [GerenteController] Tentativa de login:", email);

      // Validações básicas
      if (!email || !senha) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Email e senha são obrigatórios",
        };
        res.status(400).json(response);
        return;
      }

      // Buscar gerente pelo email
      const gerente = await Gerente.buscarPorEmail(email);

      if (!gerente) {
        console.log("❌ Gerente não encontrado:", email);
        const response: IApiResponse = {
          sucesso: false,
          erro: "Credenciais inválidas",
        };
        res.status(401).json(response);
        return;
      }

      // Verificar senha
      const senhaValida = await gerente.verificarSenha(senha);

      if (!senhaValida) {
        console.log("❌ Senha inválida para gerente:", email);
        const response: IApiResponse = {
          sucesso: false,
          erro: "Credenciais inválidas",
        };
        res.status(401).json(response);
        return;
      }

      // Gerar JWT Token
      const jwtSecret = process.env.JWT_SECRET || "trilhao_secret_key_2025";
      const token = jwt.sign(
        {
          id: gerente.id,
          email: gerente.email,
          nome: gerente.nome,
          tipo: "gerente", // Identificar tipo de usuário
        },
        jwtSecret,
        {
          expiresIn: "8h", // Token expira em 8 horas
        }
      );

      console.log("✅ Login realizado com sucesso:", {
        id: gerente.id,
        nome: gerente.nome,
        email: gerente.email,
      });

      // Resposta de sucesso (SEM incluir a senha)
      const response: IApiResponse<{
        gerente: IGerenteResponse;
        token: string;
        expiresIn: string;
      }> = {
        sucesso: true,
        dados: {
          gerente: {
            id: gerente.id!,
            nome: gerente.nome,
            email: gerente.email,
            createdAt: gerente.createdAt,
          },
          token,
          expiresIn: "8h",
        },
        mensagem: "Login realizado com sucesso",
      };

      res.json(response);
    } catch (error) {
      console.error("💥 [GerenteController] Erro no login:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // POST /api/gerente/criar - Criar novo gerente (apenas para setup inicial)
  public static async criarGerente(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha }: ICriarGerenteDTO = req.body;

      console.log("👤 [GerenteController] Criando novo gerente:", email);

      // Validações
      if (!nome || !email || !senha) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Nome, email e senha são obrigatórios",
        };
        res.status(400).json(response);
        return;
      }

      if (senha.length < 6) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Senha deve ter pelo menos 6 caracteres",
        };
        res.status(400).json(response);
        return;
      }

      // Verificar se já existe gerente com este email
      const gerenteExistente = await Gerente.buscarPorEmail(email);

      if (gerenteExistente) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Email já está em uso",
        };
        res.status(400).json(response);
        return;
      }

      // Criar gerente com senha hash
      const novoGerente = await Gerente.criarGerente({
        nome,
        email,
        senha,
      });

      console.log("✅ Gerente criado com sucesso:", {
        id: novoGerente.id,
        nome: novoGerente.nome,
        email: novoGerente.email,
      });

      // Resposta de sucesso (SEM incluir a senha)
      const response: IApiResponse<IGerenteResponse> = {
        sucesso: true,
        dados: {
          id: novoGerente.id!,
          nome: novoGerente.nome,
          email: novoGerente.email,
          createdAt: novoGerente.createdAt,
        },
        mensagem: "Gerente criado com sucesso",
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("💥 [GerenteController] Erro ao criar gerente:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao criar gerente",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/gerente/perfil - Obter dados do gerente logado
  public static async obterPerfil(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // O middleware já validou o token e colocou os dados em req.gerente
      const gerente = req.gerente;

      if (!gerente) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Gerente não autenticado",
        };
        res.status(401).json(response);
        return;
      }

      // Buscar dados completos do gerente no banco
      const gerenteCompleto = await Gerente.findByPk(gerente.id);

      if (!gerenteCompleto) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Gerente não encontrado",
        };
        res.status(404).json(response);
        return;
      }

      const response: IApiResponse<IGerenteResponse> = {
        sucesso: true,
        dados: {
          id: gerenteCompleto.id!,
          nome: gerenteCompleto.nome,
          email: gerenteCompleto.email,
          createdAt: gerenteCompleto.createdAt,
        },
        mensagem: "Perfil do gerente",
      };

      res.json(response);
    } catch (error) {
      console.error("💥 [GerenteController] Erro ao obter perfil:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao obter perfil",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // POST /api/gerente/logout - Fazer logout (informativo)
  public static async logout(req: Request, res: Response): Promise<void> {
    // Como estamos usando JWT, o logout é feito no frontend removendo o token
    // Esta rota é apenas informativa

    const response: IApiResponse = {
      sucesso: true,
      mensagem: "Logout realizado com sucesso",
    };

    res.json(response);
  }

  // GET /api/gerente/verificar-token - Verificar se token é válido
  public static async verificarToken(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // O middleware já validou o token
      const gerente = req.gerente;

      if (!gerente) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Token inválido",
        };
        res.status(401).json(response);
        return;
      }

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          id: gerente.id,
          nome: gerente.nome,
          email: gerente.email,
        },
        mensagem: "Token válido",
      };

      res.json(response);
    } catch (error) {
      console.error("💥 [GerenteController] Erro ao verificar token:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao verificar token",
      };

      res.status(500).json(response);
    }
  }
}
