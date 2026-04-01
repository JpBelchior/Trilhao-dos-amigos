import { Request, Response } from "express";
import { CampeaoBarranco } from "../models";
import { CategoriaMoto } from "../types/models";
import { calcularEdicao } from "../utils/CalcularEdição";
import { Op } from "sequelize";

export class CampeoesController {
  // GET /api/campeoes - Listar todos os campeões
  static async listarCampeoes(req: Request, res: Response): Promise<void> {
    try {
      console.log("🏆 [API] Listando campeões...");

      const campeoes = await CampeaoBarranco.findAll({
        order: [
          ["ano", "DESC"],
          ["resultadoAltura", "DESC"],
        ], // Mais recentes primeiro, depois maior altura
      });

      console.log(`✅ [API] ${campeoes.length} campeões encontrados`);

      res.json({
        sucesso: true,
        dados: {
          campeoes,
          total: campeoes.length,
        },
        mensagem: `${campeoes.length} campeões encontrados`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao listar campeões:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/campeoes/categoria/:categoria - Listar por categoria
  static async listarPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { categoria } = req.params;

      if (!Object.values(CategoriaMoto).includes(categoria as CategoriaMoto)) {
        res.status(400).json({
          sucesso: false,
          erro: "Categoria inválida",
          detalhes: `Categoria deve ser: ${Object.values(CategoriaMoto).join(
            " ou "
          )}`,
        });
        return;
      }

      console.log(`🏆 [API] Listando campeões da categoria: ${categoria}`);

      const campeoes = await CampeaoBarranco.findAll({
        where: { categoriaMoto: categoria },
        order: [
          ["ano", "DESC"],
          ["resultadoAltura", "DESC"],
        ],
      });

      res.json({
        sucesso: true,
        dados: {
          campeoes,
          categoria,
          total: campeoes.length,
        },
        mensagem: `${campeoes.length} campeões encontrados na categoria ${categoria}`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao listar campeões por categoria:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/campeoes/ano/:ano - Listar por ano
  static async listarPorAno(req: Request, res: Response): Promise<void> {
    try {
      const { ano } = req.params;
      const anoNumerico = parseInt(ano);

      if (
        isNaN(anoNumerico) ||
        anoNumerico < 2018 ||
        anoNumerico > new Date().getFullYear() + 1
      ) {
        res.status(400).json({
          sucesso: false,
          erro: "Ano inválido",
          detalhes: "Ano deve ser entre 2018 e o próximo ano",
        });
        return;
      }

      console.log(`🏆 [API] Listando campeões do ano: ${anoNumerico}`);

      const campeoes = await CampeaoBarranco.findAll({
        where: { ano: anoNumerico },
        order: [["resultadoAltura", "DESC"]],
      });

      res.json({
        sucesso: true,
        dados: {
          campeoes,
          ano: anoNumerico,
          total: campeoes.length,
        },
        mensagem: `${campeoes.length} campeões encontrados em ${anoNumerico}`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao listar campeões por ano:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/campeoes/melhor
  static async obterMelhorResultado(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("🏆 [API] Buscando melhor resultado geral...");

      const melhorCampeao = await CampeaoBarranco.findOne({
        order: [["resultadoAltura", "DESC"]],
      });

      if (!melhorCampeao) {
        res.status(404).json({
          sucesso: false,
          erro: "Nenhum campeão encontrado",
          mensagem: "Ainda não há campeões cadastrados",
        });
        return;
      }

      res.json({
        sucesso: true,
        dados: {
          campeao: melhorCampeao,
          isRecordeGeral: true,
        },
        mensagem: `Melhor resultado: ${melhorCampeao.nome} com ${melhorCampeao.resultadoAltura}m`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao buscar melhor resultado:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/campeoes/estatisticas 
  static async obterEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      console.log("📊 [API] Calculando estatísticas dos campeões...");

      const todosCampeoes = await CampeaoBarranco.findAll();

      // Estatísticas gerais
      const totalCampeoes = todosCampeoes.length;
      const nacionais = todosCampeoes.filter(
        (c) => c.categoriaMoto === CategoriaMoto.NACIONAL
      ).length;
      const importadas = todosCampeoes.filter(
        (c) => c.categoriaMoto === CategoriaMoto.IMPORTADA
      ).length;

      // Melhor resultado geral
      const melhorResultado = Math.max(
        ...todosCampeoes.map((c) => c.resultadoAltura)
      );
      const campeaoMelhorResultado = todosCampeoes.find(
        (c) => c.resultadoAltura === melhorResultado
      );

      // Estados com mais campeões
      const estadosCount: { [key: string]: number } = {};
      todosCampeoes.forEach((c) => {
        estadosCount[c.estado] = (estadosCount[c.estado] || 0) + 1;
      });

      // Cidades com mais campeões
      const cidadesCount: { [key: string]: number } = {};
      todosCampeoes.forEach((c) => {
        const chave = `${c.cidade}/${c.estado}`;
        cidadesCount[chave] = (cidadesCount[chave] || 0) + 1;
      });

      // Anos únicos
      const anos = [...new Set(todosCampeoes.map((c) => c.ano))].sort(
        (a, b) => b - a
      );

      res.json({
        sucesso: true,
        dados: {
          resumo: {
            total: totalCampeoes,
            nacionais,
            importadas,
            percentualNacionais:
              totalCampeoes > 0
                ? ((nacionais / totalCampeoes) * 100).toFixed(1)
                : 0,
            percentualImportadas:
              totalCampeoes > 0
                ? ((importadas / totalCampeoes) * 100).toFixed(1)
                : 0,
          },
          melhorResultado: {
            altura: melhorResultado,
            campeao: campeaoMelhorResultado,
          },
          distribuicao: {
            porEstado: estadosCount,
            porCidade: cidadesCount,
            porAno: anos,
          },
        },
        mensagem: "Estatísticas calculadas com sucesso",
      });
    } catch (error) {
      console.error("❌ [API] Erro ao calcular estatísticas:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/campeoes/:id - Buscar campeão específico
  static async buscarCampeao(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const campeaoId = parseInt(id);

      if (isNaN(campeaoId)) {
        res.status(400).json({
          sucesso: false,
          erro: "ID inválido",
          detalhes: "ID deve ser um número",
        });
        return;
      }

      console.log(`🏆 [API] Buscando campeão ID: ${campeaoId}`);

      const campeao = await CampeaoBarranco.findByPk(campeaoId);

      if (!campeao) {
        res.status(404).json({
          sucesso: false,
          erro: "Campeão não encontrado",
          mensagem: `Campeão com ID ${campeaoId} não existe`,
        });
        return;
      }

      res.json({
        sucesso: true,
        dados: {
          campeao,
        },
        mensagem: `Campeão ${campeao.nome} encontrado`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao buscar campeão:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  static async criarCampeaoDeParticipante(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { participanteId, resultadoAltura } = req.body;

      // Validações básicas
      if (!participanteId || !resultadoAltura) {
        res.status(400).json({
          sucesso: false,
          erro: "Dados obrigatórios faltando",
          detalhes: "participanteId e resultadoAltura são obrigatórios",
        });
        return;
      }

      if (
        typeof resultadoAltura !== "number" ||
        resultadoAltura <= 0 ||
        resultadoAltura > 100
      ) {
        res.status(400).json({
          sucesso: false,
          erro: "Resultado inválido",
          detalhes: "resultadoAltura deve ser um número entre 0.1 e 100 metros",
        });
        return;
      }

      console.log(
        `🏆 [API] Criando campeão do participante ID: ${participanteId}`
      );

      // Buscar participante no banco
      const { Participante } = await import("../models");
      const participante = await Participante.findByPk(participanteId);

      if (!participante) {
        res.status(404).json({
          sucesso: false,
          erro: "Participante não encontrado",
          detalhes: `Participante com ID ${participanteId} não existe`,
        });
        return;
      }
      const anoInscricao = new Date(participante.dataInscricao).getFullYear();
      const { edicao, numeroEdicao } = calcularEdicao(anoInscricao);

      console.log(
        `📅 Participante de ${anoInscricao} → ${edicao} (${numeroEdicao}ª)`
      );

      // Verificar se já existe campeão com mesmo nome na mesma edição
      const campeaoExistente = await CampeaoBarranco.findOne({
        where: {
          nome: participante.nome,
          edicao: edicao,
        },
      });

      if (campeaoExistente) {
        res.status(409).json({
          sucesso: false,
          erro: "Campeão já existe",
          detalhes: `${participante.nome} já é campeão da ${edicao}`,
          campeaoExistente: {
            id: campeaoExistente.id,
            resultadoAltura: campeaoExistente.resultadoAltura,
          },
        });
        return;
      }

      // Criar novo campeão
      const novoCampeao = await CampeaoBarranco.create({
        nome: participante.nome,
        edicao: edicao,
        ano: anoInscricao,
        resultadoAltura: resultadoAltura,
        modeloMoto: participante.modeloMoto,
        categoriaMoto: participante.categoriaMoto,
        cidade: participante.cidade,
        estado: participante.estado,
      });

      console.log(
        `🏆 Campeão criado: ${novoCampeao.nome} - ${resultadoAltura}m (${edicao})`
      );

      res.status(201).json({
        sucesso: true,
        dados: {
          campeao: novoCampeao,
          participanteOriginal: {
            id: participante.id,
            nome: participante.nome,
            numeroInscricao: participante.numeroInscricao,
            dataInscricao: participante.dataInscricao,
          },
          edicaoInfo: {
            edicao,
            numeroEdicao,
            ano: anoInscricao,
          },
        },
        mensagem: `🏆 ${participante.nome} foi registrado como campeão da ${edicao} com ${resultadoAltura}m!`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao criar campeão:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // PUT /api/campeoes/:id/atualizar-resultado - Atualizar resultado de campeão existente
  static async atualizarResultado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { resultadoAltura } = req.body;

      const campeaoId = parseInt(id);
      if (isNaN(campeaoId)) {
        res.status(400).json({
          sucesso: false,
          erro: "ID inválido",
          detalhes: "ID deve ser um número",
        });
        return;
      }

      if (
        !resultadoAltura ||
        typeof resultadoAltura !== "number" ||
        resultadoAltura <= 0
      ) {
        res.status(400).json({
          sucesso: false,
          erro: "Resultado inválido",
          detalhes: "resultadoAltura deve ser um número positivo",
        });
        return;
      }

      console.log(`🏆 [API] Atualizando resultado do campeão ID: ${campeaoId}`);

      const campeao = await CampeaoBarranco.findByPk(campeaoId);
      if (!campeao) {
        res.status(404).json({
          sucesso: false,
          erro: "Campeão não encontrado",
          detalhes: `Campeão com ID ${campeaoId} não existe`,
        });
        return;
      }

      const resultadoAnterior = campeao.resultadoAltura;
      await campeao.update({ resultadoAltura });

      console.log(
        `🏆 Resultado atualizado: ${campeao.nome} ${resultadoAnterior}m → ${resultadoAltura}m`
      );

      res.json({
        sucesso: true,
        dados: {
          campeao,
          mudanca: {
            anterior: resultadoAnterior,
            novo: resultadoAltura,
            diferenca: resultadoAltura - resultadoAnterior,
          },
        },
        mensagem: `Resultado de ${campeao.nome} atualizado para ${resultadoAltura}m`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao atualizar resultado:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // DELETE /api/campeoes/:id - Remover campeão
  static async removerCampeao(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const campeaoId = parseInt(id);

      if (isNaN(campeaoId)) {
        res.status(400).json({
          sucesso: false,
          erro: "ID inválido",
          detalhes: "ID deve ser um número",
        });
        return;
      }

      console.log(`🗑️ [API] Removendo campeão ID: ${campeaoId}`);

      const campeao = await CampeaoBarranco.findByPk(campeaoId);
      if (!campeao) {
        res.status(404).json({
          sucesso: false,
          erro: "Campeão não encontrado",
          detalhes: `Campeão com ID ${campeaoId} não existe`,
        });
        return;
      }

      const dadosRemovidos = {
        id: campeao.id,
        nome: campeao.nome,
        edicao: campeao.edicao,
        resultadoAltura: campeao.resultadoAltura,
      };

      await campeao.destroy();

      console.log(
        `🗑️ Campeão removido: ${dadosRemovidos.nome} (${dadosRemovidos.edicao})`
      );

      res.json({
        sucesso: true,
        dados: dadosRemovidos,
        mensagem: `${dadosRemovidos.nome} foi removido do hall da fama`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao remover campeão:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // POST /api/campeoes - Criar campeão manualmente
  static async criarCampeao(req: Request, res: Response): Promise<void> {
    try {
      const dadosCampeao = req.body;

      console.log("🏆 [API] Criando campeão manualmente:", dadosCampeao);

      // Validações básicas
      if (!dadosCampeao.nome || !dadosCampeao.edicao || !dadosCampeao.ano ||
          !dadosCampeao.resultadoAltura || !dadosCampeao.modeloMoto ||
          !dadosCampeao.categoriaMoto || !dadosCampeao.cidade || !dadosCampeao.estado) {
        res.status(400).json({
          sucesso: false,
          erro: "Dados incompletos",
          detalhes: "Todos os campos são obrigatórios (nome, edição, ano, resultado, modelo, categoria, cidade, estado)",
        });
        return;
      }

      // Verificar se já existe campeão para essa categoria e edição
      const campeaoCategoria = await CampeaoBarranco.findOne({
        where: {
          edicao: dadosCampeao.edicao,
          categoriaMoto: dadosCampeao.categoriaMoto,
        },
      });

      if (campeaoCategoria) {
        res.status(409).json({
          sucesso: false,
          erro: "Já existe campeão para esta categoria",
          detalhes: `A categoria ${dadosCampeao.categoriaMoto} já tem um campeão na ${dadosCampeao.edicao}: ${campeaoCategoria.nome}`,
          campeaoExistente: campeaoCategoria,
        });
        return;
      }

      // Criar novo campeão
      const novoCampeao = await CampeaoBarranco.create({
        nome: dadosCampeao.nome,
        edicao: dadosCampeao.edicao,
        ano: dadosCampeao.ano,
        resultadoAltura: parseFloat(dadosCampeao.resultadoAltura),
        modeloMoto: dadosCampeao.modeloMoto,
        categoriaMoto: dadosCampeao.categoriaMoto,
        cidade: dadosCampeao.cidade,
        estado: dadosCampeao.estado,
      });

      console.log(`🏆 Campeão criado: ${novoCampeao.nome} - ${novoCampeao.resultadoAltura}m`);

      res.status(201).json({
        sucesso: true,
        dados: novoCampeao,
        mensagem: `🏆 ${novoCampeao.nome} foi registrado como campeão da ${novoCampeao.edicao}!`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao criar campeão:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // PUT /api/campeoes/:id - Editar campeão completo
  static async editarCampeao(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      const campeaoId = parseInt(id);

      if (isNaN(campeaoId)) {
        res.status(400).json({
          sucesso: false,
          erro: "ID inválido",
          detalhes: "ID deve ser um número",
        });
        return;
      }

      console.log(`📝 [API] Editando campeão ${campeaoId}`);

      const campeao = await CampeaoBarranco.findByPk(campeaoId);

      if (!campeao) {
        res.status(404).json({
          sucesso: false,
          erro: "Campeão não encontrado",
          detalhes: `Campeão com ID ${campeaoId} não existe`,
        });
        return;
      }

      // Verificar se está tentando mudar para uma categoria/edição que já tem campeão
      if (dadosAtualizacao.categoriaMoto || dadosAtualizacao.edicao) {
        const novaCategoria = dadosAtualizacao.categoriaMoto || campeao.categoriaMoto;
        const novaEdicao = dadosAtualizacao.edicao || campeao.edicao;

        const campeaoConflito = await CampeaoBarranco.findOne({
          where: {
            edicao: novaEdicao,
            categoriaMoto: novaCategoria,
            id: { [Op.ne]: campeaoId }, 
          },
        });

        if (campeaoConflito) {
          res.status(409).json({
            sucesso: false,
            erro: "Conflito de categoria/edição",
            detalhes: `Já existe campeão para categoria ${novaCategoria} na ${novaEdicao}: ${campeaoConflito.nome}`,
          });
          return;
        }
      }

      // Atualizar campeão
      await campeao.update(dadosAtualizacao);

      console.log(`✅ Campeão atualizado: ${campeao.nome}`);

      res.json({
        sucesso: true,
        dados: campeao,
        mensagem: `Campeão ${campeao.nome} atualizado com sucesso!`,
      });
    } catch (error) {
      console.error("❌ [API] Erro ao editar campeão:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
  static async listarParticipantesDisponiveis(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { ano, categoria } = req.query;

      console.log(
        "👥 [API] Listando participantes disponíveis para campeões..."
      );

      const { Participante } = await import("../models");

      // Construir filtros
      const whereClause: any = {
        statusPagamento: "confirmado", // Apenas participantes confirmados
      };

      // Filtrar por ano se especificado
      if (ano) {
        const anoNumerico = parseInt(ano as string);
        if (!isNaN(anoNumerico)) {
          const inicioAno = new Date(`${anoNumerico}-01-01`);
          const fimAno = new Date(`${anoNumerico}-12-31`);
          whereClause.dataInscricao = {
            [Op.between]: [inicioAno, fimAno],
          };
        }
      }

      // Filtrar por categoria se especificado
      if (
        categoria &&
        Object.values(CategoriaMoto).includes(categoria as CategoriaMoto)
      ) {
        whereClause.categoriaMoto = categoria;
      }

      const participantes = await Participante.findAll({
        where: whereClause,
        attributes: [
          "id",
          "nome",
          "cidade",
          "estado",
          "modeloMoto",
          "categoriaMoto",
          "dataInscricao",
          "numeroInscricao",
        ],
        order: [["dataInscricao", "DESC"]],
      });

      // Para cada participante, calcular a edição e verificar se já é campeão
      const participantesComInfo = await Promise.all(
        participantes.map(async (participante) => {
          const anoInscricao = new Date(
            participante.dataInscricao
          ).getFullYear();
          const { edicao, numeroEdicao } = calcularEdicao(anoInscricao);

          // Verificar se já é campeão
          const jaCampeao = await CampeaoBarranco.findOne({
            where: {
              nome: participante.nome,
              edicao: edicao,
            },
          });

          return {
            ...participante.toJSON(),
            edicaoCalculada: edicao,
            numeroEdicao,
            anoInscricao,
            jaCampeao: !!jaCampeao,
            campeaoId: jaCampeao?.id || null,
          };
        })
      );

      // Separar disponíveis dos que já são campeões
      const disponiveis = participantesComInfo.filter((p) => !p.jaCampeao);
      const jaCampeoes = participantesComInfo.filter((p) => p.jaCampeao);

      res.json({
        sucesso: true,
        dados: {
          disponiveis,
          jaCampeoes,
          resumo: {
            totalParticipantes: participantesComInfo.length,
            disponiveis: disponiveis.length,
            jaCampeoes: jaCampeoes.length,
          },
        },
        mensagem: `${disponiveis.length} participantes disponíveis para se tornarem campeões`,
      });
    } catch (error) {
      console.error(
        "❌ [API] Erro ao listar participantes disponíveis:",
        error
      );
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}
