import jwt from "jsonwebtoken";
import { Gerente } from "../models";
import {
  ICriarGerenteDTO,
  ILoginGerenteDTO,
  IGerenteResponse,
} from "../types/models";



export interface GerenteResult {
  sucesso: boolean;
  dados?: any;
  erro?: string;
  detalhes?: string;
}

export class GerenteService {
  /**
   * Fazer login do gerente
   */
  public static async fazerLogin(
    dados: ILoginGerenteDTO
  ): Promise<GerenteResult> {
    try {
      const { email, senha } = dados;

      console.log("🔐 [GerenteService] Tentativa de login:", email);

      // Buscar gerente pelo email
      const gerente = await Gerente.buscarPorEmail(email);

      if (!gerente) {
        console.log("❌ Gerente não encontrado:", email);
        return {
          sucesso: false,
          erro: "Credenciais inválidas",
        };
      }

      // Verificar senha
      const senhaValida = await gerente.verificarSenha(senha);

      if (!senhaValida) {
        console.log("❌ Senha inválida para gerente:", email);
        return {
          sucesso: false,
          erro: "Credenciais inválidas",
        };
      }

      // Gerar JWT Token 
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("❌ [ERRO CRÍTICO] JWT_SECRET não configurado");
        return {
          sucesso: false,
          erro: "Configuração de segurança inválida",
          detalhes: "Sistema não configurado corretamente. Contate o administrador.",
        };
      }
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

      // Resposta de sucesso
      return {
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
      };
    } catch (error) {
      console.error("💥 [GerenteService] Erro no login:", error);
      return {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Criar novo gerente
   */
  public static async criarGerente(
    dados: ICriarGerenteDTO
  ): Promise<GerenteResult> {
    try {
      const { nome, email, senha } = dados;

      console.log("👤 [GerenteService] Criando novo gerente:", email);

      // Verificar se já existe gerente com este email
      const gerenteExistente = await Gerente.buscarPorEmail(email);

      if (gerenteExistente) {
        return {
          sucesso: false,
          erro: "Email já está em uso",
        };
      }

      // Criar gerente com senha hash (como era no código antigo)
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

      // Resposta de sucesso (SEM incluir a senha) - como era antes
      return {
        sucesso: true,
        dados: {
          id: novoGerente.id!,
          nome: novoGerente.nome,
          email: novoGerente.email,
          createdAt: novoGerente.createdAt,
        },
      };
    } catch (error) {
      console.error("💥 [GerenteService] Erro ao criar gerente:", error);
      return {
        sucesso: false,
        erro: "Erro ao criar gerente",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Obter perfil do gerente logado
   */
  public static async obterPerfil(gerenteId: number): Promise<GerenteResult> {
    try {
      const gerente = await Gerente.findByPk(gerenteId);

      if (!gerente) {
        return {
          sucesso: false,
          erro: "Gerente não encontrado",
        };
      }

      // Retornar dados do gerente (SEM senha) - como era antes
      return {
        sucesso: true,
        dados: {
          id: gerente.id!,
          nome: gerente.nome,
          email: gerente.email,
          createdAt: gerente.createdAt,
          updatedAt: gerente.updatedAt,
        },
      };
    } catch (error) {
      console.error("💥 [GerenteService] Erro ao obter perfil:", error);
      return {
        sucesso: false,
        erro: "Erro ao buscar perfil",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Atualizar perfil do gerente
   */
  public static async atualizarPerfil(
    gerenteId: number,
    dados: {
      nome?: string;
      email?: string;
      senhaAtual?: string;
      novaSenha?: string;
      confirmarSenha?: string;
    }
  ): Promise<GerenteResult> {
    try {
      const { nome, email, senhaAtual, novaSenha, confirmarSenha } = dados;

      console.log(
        "🔄 [GerenteService] Atualizando perfil do gerente:",
        gerenteId
      );

      // Buscar dados completos do gerente no banco
      const gerenteCompleto = await Gerente.findByPk(gerenteId);
      if (!gerenteCompleto) {
        return {
          sucesso: false,
          erro: "Gerente não encontrado",
        };
      }

      // ✅ MONTAR DADOS PARA ATUALIZAR
      const dadosParaAtualizar: any = {};
      let emailAlterado = false;

      // 1. Validar nome se fornecido
      if (nome !== undefined) {
        // Só atualizar se for diferente do atual
        if (nome.trim() !== gerenteCompleto.nome) {
          dadosParaAtualizar.nome = nome.trim();
        }
      }

      // 2. Validar email se fornecido
      if (email !== undefined) {
        const emailNormalizado = email.trim().toLowerCase();

        // Verificar se é diferente do atual
        if (emailNormalizado !== gerenteCompleto.email.toLowerCase()) {
          // Verificar se o novo email já existe
          const emailJaExiste = await Gerente.buscarPorEmail(emailNormalizado);
          if (emailJaExiste && emailJaExiste.id !== gerenteCompleto.id) {
            return {
              sucesso: false,
              erro: "Este email já está sendo usado",
            };
          }

          dadosParaAtualizar.email = emailNormalizado;
          emailAlterado = true;
        }
      }

      // 3. Validar mudança de senha se fornecida (como era no código antigo)
      if (novaSenha) {
        // Verificar se senha atual está correta
        const senhaAtualValida = await gerenteCompleto.verificarSenha(
          senhaAtual!
        );
        if (!senhaAtualValida) {
          return {
            sucesso: false,
            erro: "Senha atual incorreta",
          };
        }

        // Verificar se nova senha é diferente da atual
        const novaSenhaIgualAtual = await gerenteCompleto.verificarSenha(
          novaSenha
        );
        if (novaSenhaIgualAtual) {
          return {
            sucesso: false,
            erro: "Nova senha deve ser diferente da senha atual",
          };
        }

        // Hash da nova senha
        dadosParaAtualizar.senha = await Gerente.hashSenha(novaSenha);
      }

      // ✅ SALVAR NO BANCO
      await gerenteCompleto.update(dadosParaAtualizar);

      console.log("✅ Perfil atualizado:", {
        id: gerenteCompleto.id,
        nome: gerenteCompleto.nome,
        email: gerenteCompleto.email,
        alteracoes: Object.keys(dadosParaAtualizar),
      });

      // ✅ GERAR NOVO TOKEN SE EMAIL FOI ALTERADO
      let novoToken = null;
      if (emailAlterado) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error("❌ [ERRO CRÍTICO] JWT_SECRET não configurado");
          return {
            sucesso: false,
            erro: "Configuração de segurança inválida",
            detalhes: "Sistema não configurado corretamente. Contate o administrador.",
          };
        }
        novoToken = jwt.sign(
          {
            id: gerenteCompleto.id,
            email: gerenteCompleto.email,
            nome: gerenteCompleto.nome,
            tipo: "gerente",
          },
          jwtSecret,
          {
            expiresIn: "8h",
          }
        );
        console.log("🔑 Novo token JWT gerado devido alteração de email");
      }

      return {
        sucesso: true,
        dados: {
          gerente: {
            id: gerenteCompleto.id!,
            nome: gerenteCompleto.nome,
            email: gerenteCompleto.email,
            createdAt: gerenteCompleto.createdAt,
          },
          alteracoes: Object.keys(dadosParaAtualizar),
          novoToken: novoToken, // Incluir novo token se email foi alterado
        },
      };
    } catch (error) {
      console.error("💥 [GerenteService] Erro ao atualizar perfil:", error);
      return {
        sucesso: false,
        erro: "Erro ao atualizar perfil",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Logout
   */
  public static logout(): GerenteResult {
    // Como estamos usando JWT, o logout é feito no frontend removendo o token
    return {
      sucesso: true,
      dados: {
        mensagem: "Logout realizado com sucesso",
      },
    };
  }
}
