// src/controllers/LoteController.ts
import { Request, Response } from "express";
import { LoteService, StatusLote, DATA_LIMITE_COMPETICAO } from "../Service/LoteService";
import { ICriarLoteDTO } from "../types/models";

export class LoteController {
  // GET /api/lotes/precos — público
  static async getPrecos(_req: Request, res: Response): Promise<void> {
    try {
      console.log("[LoteController] Buscando preços vigentes...");
      const precos = await LoteService.getPrecos();

      res.json({
        sucesso: true,
        dados: precos,
        mensagem: precos.usandoFallback
          ? "Usando preços padrão (sem lote ativo)"
          : `Preços do lote ${precos.loteAtivo?.numero}`,
      });
    } catch (error) {
      console.error("[LoteController] Erro ao buscar preços:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/lotes/ativo — público
  static async getLoteAtivo(_req: Request, res: Response): Promise<void> {
    try {
      console.log("[LoteController] Buscando lote ativo...");
      const lote = await LoteService.getLoteAtivo();

      res.json({
        sucesso: true,
        dados: { lote },
        mensagem: lote ? `Lote ${lote.numero} está ativo` : "Nenhum lote ativo",
      });
    } catch (error) {
      console.error("[LoteController] Erro ao buscar lote ativo:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/lotes — protegido
  static async listar(_req: Request, res: Response): Promise<void> {
    try {
      console.log("[LoteController] Listando todos os lotes...");
      const lotes = await LoteService.listarTodos();

      // Inclui status calculado no backend (fuso horário de Brasília)
      const lotesComStatus = lotes.map((lote) => ({
        ...lote.toJSON(),
        status: LoteService.calcularStatus(lote) as StatusLote,
      }));

      res.json({
        sucesso: true,
        dados: { lotes: lotesComStatus, total: lotes.length },
        mensagem: `${lotes.length} lote(s) encontrado(s)`,
      });
    } catch (error) {
      console.error("[LoteController] Erro ao listar lotes:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/lotes/:id — protegido
  static async buscar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ sucesso: false, erro: "ID inválido" });
        return;
      }

      const lote = await LoteService.buscarPorId(id);
      if (!lote) {
        res.status(404).json({ sucesso: false, erro: "Lote não encontrado" });
        return;
      }

      res.json({ sucesso: true, dados: { lote } });
    } catch (error) {
      console.error("[LoteController] Erro ao buscar lote:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // POST /api/lotes — protegido
  static async criar(req: Request, res: Response): Promise<void> {
    try {
      const { numero, dataInicio, dataFim, precoInscricao, precoCamisa } = req.body;

      // Validação básica
      if (!numero || !dataInicio || !dataFim || precoInscricao == null || precoCamisa == null) {
        res.status(400).json({
          sucesso: false,
          erro: "Dados incompletos",
          detalhes: "numero, dataInicio, dataFim, precoInscricao e precoCamisa são obrigatórios",
        });
        return;
      }

      if (isNaN(Number(precoInscricao)) || Number(precoInscricao) < 0) {
        res.status(400).json({ sucesso: false, erro: "Preço de inscrição inválido" });
        return;
      }

      if (isNaN(Number(precoCamisa)) || Number(precoCamisa) < 0) {
        res.status(400).json({ sucesso: false, erro: "Preço da camisa inválido" });
        return;
      }

      if (dataFim < dataInicio) {
        res.status(400).json({
          sucesso: false,
          erro: "Data de fim deve ser igual ou posterior à data de início",
        });
        return;
      }

      if (String(dataFim) > DATA_LIMITE_COMPETICAO) {
        res.status(400).json({
          sucesso: false,
          erro: `A data de fim não pode ultrapassar o dia da competição (${DATA_LIMITE_COMPETICAO.split("-").reverse().join("/")})`,
        });
        return;
      }

      const conflitoCriacao = await LoteService.buscarSobreposicao(String(dataInicio), String(dataFim));
      if (conflitoCriacao) {
        const inicioFmt = conflitoCriacao.dataInicio.split("-").reverse().join("/");
        const fimFmt = conflitoCriacao.dataFim.split("-").reverse().join("/");
        res.status(409).json({
          sucesso: false,
          erro: `As datas informadas se sobrepõem com o Lote ${conflitoCriacao.numero} (${inicioFmt} a ${fimFmt})`,
        });
        return;
      }

      const dados: ICriarLoteDTO = {
        numero: String(numero),
        dataInicio: String(dataInicio),
        dataFim: String(dataFim),
        precoInscricao: Number(precoInscricao),
        precoCamisa: Number(precoCamisa),
      };

      const lote = await LoteService.criar(dados);

      res.status(201).json({
        sucesso: true,
        dados: { lote },
        mensagem: `Lote ${lote.numero} criado com sucesso`,
      });
    } catch (error) {
      console.error("[LoteController] Erro ao criar lote:", error);

      // Erro de violação de unique (número duplicado)
      if (error instanceof Error && error.message.includes("unique")) {
        res.status(409).json({
          sucesso: false,
          erro: "Já existe um lote com este número",
        });
        return;
      }

      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // PUT /api/lotes/:id — protegido
  static async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ sucesso: false, erro: "ID inválido" });
        return;
      }

      const { numero, dataInicio, dataFim, precoInscricao, precoCamisa } = req.body;

      // Pelo menos um campo deve ser enviado
      if (!numero && !dataInicio && !dataFim && precoInscricao == null && precoCamisa == null) {
        res.status(400).json({ sucesso: false, erro: "Nenhum campo para atualizar" });
        return;
      }

      if (dataInicio !== undefined || dataFim !== undefined) {
        const loteAtual = await LoteService.buscarPorId(id);
        if (!loteAtual) {
          res.status(404).json({ sucesso: false, erro: "Lote não encontrado" });
          return;
        }

        const novaInicio = dataInicio !== undefined ? String(dataInicio) : loteAtual.dataInicio;
        const novaFim = dataFim !== undefined ? String(dataFim) : loteAtual.dataFim;

        if (novaFim < novaInicio) {
          res.status(400).json({
            sucesso: false,
            erro: "Data de fim deve ser igual ou posterior à data de início",
          });
          return;
        }

        if (novaFim > DATA_LIMITE_COMPETICAO) {
          res.status(400).json({
            sucesso: false,
            erro: `A data de fim não pode ultrapassar o dia da competição (${DATA_LIMITE_COMPETICAO.split("-").reverse().join("/")})`,
          });
          return;
        }

        const conflitoAtualizacao = await LoteService.buscarSobreposicao(novaInicio, novaFim, id);
        if (conflitoAtualizacao) {
          const inicioFmt = conflitoAtualizacao.dataInicio.split("-").reverse().join("/");
          const fimFmt = conflitoAtualizacao.dataFim.split("-").reverse().join("/");
          res.status(409).json({
            sucesso: false,
            erro: `As datas informadas se sobrepõem com o Lote ${conflitoAtualizacao.numero} (${inicioFmt} a ${fimFmt})`,
          });
          return;
        }
      }

      const lote = await LoteService.atualizar(id, {
        ...(numero !== undefined && { numero: String(numero) }),
        ...(dataInicio !== undefined && { dataInicio: String(dataInicio) }),
        ...(dataFim !== undefined && { dataFim: String(dataFim) }),
        ...(precoInscricao !== undefined && { precoInscricao: Number(precoInscricao) }),
        ...(precoCamisa !== undefined && { precoCamisa: Number(precoCamisa) }),
      });

      res.json({
        sucesso: true,
        dados: { lote },
        mensagem: `Lote ${lote.numero} atualizado com sucesso`,
      });
    } catch (error) {
      console.error("[LoteController] Erro ao atualizar lote:", error);

      if (error instanceof Error && error.message === "Lote não encontrado") {
        res.status(404).json({ sucesso: false, erro: "Lote não encontrado" });
        return;
      }

      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // DELETE /api/lotes/:id — protegido
  static async deletar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ sucesso: false, erro: "ID inválido" });
        return;
      }

      await LoteService.deletar(id);

      res.json({
        sucesso: true,
        mensagem: "Lote excluído com sucesso",
      });
    } catch (error) {
      console.error("[LoteController] Erro ao deletar lote:", error);

      if (error instanceof Error && error.message === "Lote não encontrado") {
        res.status(404).json({ sucesso: false, erro: "Lote não encontrado" });
        return;
      }

      res.status(500).json({
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}
