import { Resend } from "resend";
import { templateComprovante, templateComprovantePedidoAvulso } from "../utils/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

export class EmailService {
  public static async enviarComprovante(
    participante: {
      numeroInscricao: string;
      nome: string;
      cpf: string;
      email: string;
      telefone: string;
      cidade: string;
      estado: string;
      modeloMoto: string;
      categoriaMoto: string;
      tamanhoCamiseta: string;
      tipoCamiseta: string;
      valorInscricao: number;
    },
    camisetasExtras: { tamanho: string; tipo: string; preco: number }[],
    pagamentoInfo: { id: string; date_approved?: string }
  ): Promise<void> {
    const dataPagamento = pagamentoInfo.date_approved
      ? new Date(pagamentoInfo.date_approved).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
      : new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const html = templateComprovante({
      numeroInscricao: participante.numeroInscricao,
      nome: participante.nome,
      cpf: participante.cpf,
      email: participante.email,
      telefone: participante.telefone,
      cidade: participante.cidade,
      estado: participante.estado,
      modeloMoto: participante.modeloMoto,
      categoriaMoto: participante.categoriaMoto,
      tamanhoCamiseta: participante.tamanhoCamiseta,
      tipoCamiseta: participante.tipoCamiseta,
      valorInscricao: Number(participante.valorInscricao),
      camisetasExtras,
      pagamentoId: pagamentoInfo.id,
      dataPagamento,
    });

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: participante.email,
      subject: `Inscrição Confirmada — ${participante.numeroInscricao} | Trilhão dos Amigos 2026`,
      html,
    });

    if (error) {
      console.error("[EmailService] Erro ao enviar comprovante:", error);
    } else {
      console.log(` [EmailService] Comprovante enviado para ${participante.email} (${participante.numeroInscricao})`);
    }
  }

  public static async enviarComprovantePedidoAvulso(
    pedido: {
      nome: string;
      email: string;
      codigoReferencia: string;
      valorTotal: number;
    },
    itens: { tamanho: string; tipo: string; quantidade: number }[]
  ): Promise<void> {
    const html = templateComprovantePedidoAvulso({
      nome: pedido.nome,
      email: pedido.email,
      codigoReferencia: pedido.codigoReferencia,
      valorTotal: Number(pedido.valorTotal),
      itens,
      dataPagamento: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    });

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: pedido.email,
      subject: `Pedido Confirmado — ${pedido.codigoReferencia} | Trilhão dos Amigos 2026`,
      html,
    });

    if (error) {
      console.error("[EmailService] Erro ao enviar comprovante avulso:", error);
    } else {
      console.log(`[EmailService] Comprovante avulso enviado para ${pedido.email} (${pedido.codigoReferencia})`);
    }
  }
}
