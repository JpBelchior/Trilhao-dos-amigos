import { Op } from "sequelize";
import {
  PedidoCamisetaAvulsa,
  ItemPedidoCamisetaAvulsa,
  Participante,
  EstoqueCamiseta,
  CamisetaExtra,
} from "../models";
import { PagamentoService } from "./pagamentoService";
import { LoteService } from "./LoteService";
import { EmailService } from "./EmailService";
import {
  ICriarPedidoCamisetaAvulsaDTO,
  StatusPagamento,
  StatusEntrega,
} from "../types/models";

export class PedidoCamisetaAvulsaService {
  // ========================================
  // CRIAR PEDIDO
  // ========================================

  public static async criarPedido(dados: ICriarPedidoCamisetaAvulsaDTO) {
    const { nome, cpf, email, telefone, itens } = dados;

    // 1. Verificar estoque para todos os itens
    for (const item of itens) {
      const estoque = await EstoqueCamiseta.findOne({
        where: { tamanho: item.tamanho, tipo: item.tipo },
      });
      if (!estoque || estoque.quantidadeDisponivel < item.quantidade) {
        return {
          sucesso: false,
          erro: `Estoque insuficiente para ${item.tamanho} - ${item.tipo}`,
          detalhes: `Disponível: ${estoque?.quantidadeDisponivel ?? 0}, Solicitado: ${item.quantidade}`,
        };
      }
    }

    // 2. Verificar se CPF já existe em Participante
    const cpfLimpo = cpf.replace(/\D/g, "");
    const participante = await Participante.findOne({
      where: { cpf: { [Op.like]: `%${cpfLimpo}%` } },
    });

    // 3. Calcular valor total no backend
    const { precoCamisa } = await LoteService.getPrecos();
    const valorTotal = itens.reduce((soma, i) => soma + i.quantidade * precoCamisa, 0);

    // 4. Criar pedido (cabeçalho)
    const pedido = await PedidoCamisetaAvulsa.create({
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.toLowerCase().trim(),
      telefone: telefone.trim(),
      valorTotal,
      participanteId: participante?.id ?? undefined,
      statusPagamento: StatusPagamento.PENDENTE,
    });

    // 5. Criar itens
    for (const item of itens) {
      await ItemPedidoCamisetaAvulsa.create({
        pedidoId: pedido.id,
        tamanho: item.tamanho,
        tipo: item.tipo,
        quantidade: item.quantidade,
        statusEntrega: StatusEntrega.NAO_ENTREGUE,
      });
    }

    console.log(
      ` [PedidoAvulso] Pedido #${pedido.id} criado com ${itens.length} item(ns)` +
        (participante ? ` — vinculado a ${participante.numeroInscricao}` : "")
    );

    return {
      sucesso: true,
      dados: {
        pedido: {
          id: pedido.id,
          codigoReferencia: pedido.codigoReferencia,
          nome: pedido.nome,
          email: pedido.email,
          valorTotal: pedido.valorTotal,
          itens,
          participanteVinculado: participante
            ? { id: participante.id, numeroInscricao: participante.numeroInscricao }
            : null,
        },
      },
    };
  }

  // ========================================
  // CRIAR PIX
  // ========================================

  public static async criarPix(pedidoId: number) {
    const pedido = await PedidoCamisetaAvulsa.findByPk(pedidoId, {
      include: [{ model: ItemPedidoCamisetaAvulsa, as: "itens" }],
    });

    if (!pedido) return { sucesso: false, erro: "Pedido não encontrado" };
    if (pedido.statusPagamento === StatusPagamento.CONFIRMADO)
      return { sucesso: false, erro: "Pedido já foi pago" };

    const pagador = {
      nome: pedido.nome,
      cpf: pedido.cpf,
      email: pedido.email,
      numeroInscricao: pedido.codigoReferencia,
    };

    const resultado = await PagamentoService.criarPix(pagador as any, Number(pedido.valorTotal));

    if (!resultado.sucesso || !resultado.dados) return resultado;

    await pedido.update({
      mercadoPagoId: resultado.dados.pagamentoId,
      externalReference: resultado.dados.externalReference,
    });

    return {
      sucesso: true,
      dados: {
        ...resultado.dados,
        pedido: {
          id: pedido.id,
          codigoReferencia: pedido.codigoReferencia,
          nome: pedido.nome,
          email: pedido.email,
          valorTotal: pedido.valorTotal,
          itens: (pedido as any).itens,
        },
      },
    };
  }

  // ========================================
  // CONFIRMAR PEDIDO
  // ========================================

  public static async confirmarPedido(externalReference: string) {
    const pedido = await PedidoCamisetaAvulsa.findOne({
      where: { externalReference },
      include: [{ model: ItemPedidoCamisetaAvulsa, as: "itens" }],
    });

    if (!pedido) {
      console.warn(` [PedidoAvulso] Não encontrado para ref: ${externalReference}`);
      return { sucesso: false, erro: "Pedido não encontrado" };
    }

    if (pedido.statusPagamento === StatusPagamento.CONFIRMADO) {
      return { sucesso: true, dados: { jaConfirmado: true } };
    }

    const itens = (pedido as any).itens as ItemPedidoCamisetaAvulsa[];

    // CPF de participante: converter cada item em CamisetaExtra e deletar pedido
    if (pedido.participanteId) {
      const { precoCamisa } = await LoteService.getPrecos();
      for (const item of itens) {
        for (let i = 0; i < item.quantidade; i++) {
          await CamisetaExtra.create({
            participanteId: pedido.participanteId!,
            tamanho: item.tamanho,
            tipo: item.tipo,
            preco: precoCamisa,
            statusEntrega: StatusEntrega.NAO_ENTREGUE,
          });
          // afterCreate do CamisetaExtra já atualiza valorInscricao e estoque
        }
      }
      await pedido.destroy(); // CASCADE deleta os itens também
      console.log(` [PedidoAvulso] Pedido #${pedido.id} convertido para CamisetaExtra`);
      return { sucesso: true, dados: { convertido: true } };
    }

    // Sem participante: confirmar normalmente
    await pedido.update({ statusPagamento: StatusPagamento.CONFIRMADO });

    // Atualizar estoque para cada item
    for (const item of itens) {
      const estoque = await EstoqueCamiseta.findOne({
        where: { tamanho: item.tamanho, tipo: item.tipo },
      });
      if (estoque) await estoque.atualizarReservadas();
    }

    // Enviar comprovante por email em background
    EmailService.enviarComprovantePedidoAvulso(
      {
        nome: pedido.nome,
        email: pedido.email,
        codigoReferencia: pedido.codigoReferencia,
        valorTotal: Number(pedido.valorTotal),
      },
      itens.map((i) => ({ tamanho: i.tamanho, tipo: i.tipo, quantidade: i.quantidade }))
    ).catch((err) => console.error(" [PedidoAvulso] Falha ao enviar email:", err));

    console.log(` [PedidoAvulso] Pedido #${pedido.id} confirmado!`);
    return { sucesso: true, dados: { pedido } };
  }

  // ========================================
  // LISTAR PARA ADMIN
  // ========================================

  public static async listarParaAdmin() {
    const pedidos = await PedidoCamisetaAvulsa.findAll({
      where: { statusPagamento: { [Op.ne]: StatusPagamento.CANCELADO } },
      include: [
        {
          model: ItemPedidoCamisetaAvulsa,
          as: "itens",
        },
        {
          model: Participante,
          as: "participante",
          attributes: ["id", "numeroInscricao", "nome"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return { sucesso: true, dados: { pedidos } };
  }

  // ========================================
  // TOGGLE ENTREGA DE ITEM
  // ========================================

  public static async toggleEntregaItem(itemId: number) {
    const item = await ItemPedidoCamisetaAvulsa.findByPk(itemId, {
      include: [{ model: PedidoCamisetaAvulsa, as: "pedido" }],
    });

    if (!item) return { sucesso: false, erro: "Item não encontrado" };

    const pedido = (item as any).pedido as PedidoCamisetaAvulsa;
    if (pedido.statusPagamento !== StatusPagamento.CONFIRMADO) {
      return { sucesso: false, erro: "Pagamento ainda não confirmado" };
    }

    const novoStatus =
      item.statusEntrega === StatusEntrega.ENTREGUE
        ? StatusEntrega.NAO_ENTREGUE
        : StatusEntrega.ENTREGUE;

    await item.update({
      statusEntrega: novoStatus,
      dataEntrega: novoStatus === StatusEntrega.ENTREGUE ? new Date() : undefined,
    });

    return {
      sucesso: true,
      dados: { statusEntrega: novoStatus, entregue: novoStatus === StatusEntrega.ENTREGUE },
    };
  }

  // CANCELAR PEDIDOS EXPIRADOS

  public static async cancelarPedidosExpirados(): Promise<void> {
    const limite = new Date();
    limite.setMinutes(limite.getMinutes() - 20);

    const pendentes = await PedidoCamisetaAvulsa.findAll({
      where: {
        statusPagamento: StatusPagamento.PENDENTE,
        createdAt: { [Op.lt]: limite },
      },
      include: [{ model: ItemPedidoCamisetaAvulsa, as: "itens" }],
    });

    if (pendentes.length === 0) return;

    console.log(` [PedidoAvulso] ${pendentes.length} pedido(s) expirado(s) para cancelar`);

    for (const pedido of pendentes) {
      await pedido.update({ statusPagamento: StatusPagamento.CANCELADO });

      // Atualizar estoque para cada item único (tamanho+tipo)
      const itens = (pedido as any).itens as ItemPedidoCamisetaAvulsa[];
      const combinacoesUnicas = new Set(itens.map((i) => `${i.tamanho}_${i.tipo}`));
      for (const combo of combinacoesUnicas) {
        const [tamanho, tipo] = combo.split("_") as any;
        const estoque = await EstoqueCamiseta.findOne({ where: { tamanho, tipo } });
        if (estoque) await estoque.atualizarReservadas();
      }

      console.log(` [PedidoAvulso] Pedido #${pedido.id} cancelado por expiração`);
    }
  }
}
