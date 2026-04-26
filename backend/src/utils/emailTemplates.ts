interface DadosComprovante {
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
  camisetasExtras: { tamanho: string; tipo: string; preco: number }[];
  pagamentoId: string;
  dataPagamento: string;
}

interface DadosComprovantePedidoAvulso {
  nome: string;
  email: string;
  codigoReferencia: string;
  valorTotal: number;
  itens: { tamanho: string; tipo: string; quantidade: number }[];
  dataPagamento: string;
}

const estilos = {
  container: 'max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;',
  header: 'background:#1a1a2e;padding:32px 24px;text-align:center;',
  headerTitulo: 'color:#ffffff;font-size:24px;font-weight:bold;margin:0;',
  headerSubtitulo: 'color:#a0aec0;font-size:14px;margin:8px 0 0;',
  badge: 'display:inline-block;background:#22c55e;color:#fff;font-size:13px;font-weight:bold;padding:6px 16px;border-radius:20px;margin-top:16px;',
  corpo: 'padding:24px;',
  secao: 'background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:16px;',
  secaoTitulo: 'font-size:12px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;',
  linha: 'display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #e2e8f0;',
  linhaLabel: 'color:#64748b;font-size:14px;',
  linhaValor: 'color:#1e293b;font-size:14px;font-weight:500;',
  destaque: 'background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:16px;',
  destaqueValor: 'font-size:28px;font-weight:bold;color:#16a34a;',
  rodape: 'background:#f1f5f9;padding:20px 24px;text-align:center;',
  rodapeTexto: 'color:#94a3b8;font-size:12px;margin:4px 0;',
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarTipoCamiseta(tipo: string): string {
  return tipo === 'manga_longa' ? 'Manga Longa' : 'Manga Curta';
}

function formatarCategoria(categoria: string): string {
  return categoria === 'importada' ? 'Importada' : 'Nacional';
}

function linhaTabela(label: string, valor: string): string {
  return `
    <tr>
      <td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;">${label}</td>
      <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:500;text-align:right;border-bottom:1px solid #e2e8f0;">${valor}</td>
    </tr>`;
}

export function templateComprovante(dados: DadosComprovante): string {
  const extrasHtml = dados.camisetasExtras.length > 0
    ? `
    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Camisetas Extras</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${dados.camisetasExtras.map((c) =>
          linhaTabela(
            `${c.tamanho.toUpperCase()} — ${formatarTipoCamiseta(c.tipo)}`,
            formatarMoeda(c.preco)
          )
        ).join('')}
      </table>
    </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Comprovante de Inscrição</title></head>
<body style="margin:0;padding:0;background:#e2e8f0;">
<div style="${estilos.container}">

  <div style="${estilos.header}">
    <p style="${estilos.headerTitulo}">TRILHÃO DOS AMIGOS 2026</p>
    <p style="${estilos.headerSubtitulo}">Comprovante de Inscrição</p>
    <span style="${estilos.badge}">Pagamento Confirmado</span>
  </div>

  <div style="${estilos.corpo}">

    <div style="${estilos.destaque}">
      <p style="margin:0 0 4px;color:#166534;font-size:13px;font-weight:bold;">NÚMERO DE INSCRIÇÃO</p>
      <p style="margin:0;${estilos.destaqueValor}">${dados.numeroInscricao}</p>
    </div>

    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Dados Pessoais</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${linhaTabela('Nome', dados.nome)}
        ${linhaTabela('CPF', dados.cpf)}
        ${linhaTabela('E-mail', dados.email)}
        ${linhaTabela('Telefone', dados.telefone)}
        ${linhaTabela('Cidade / Estado', `${dados.cidade} — ${dados.estado}`)}
      </table>
    </div>

    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Moto</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${linhaTabela('Modelo', dados.modeloMoto)}
        ${linhaTabela('Categoria', formatarCategoria(dados.categoriaMoto))}
      </table>
    </div>

    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Camiseta Incluída</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${linhaTabela('Tamanho', dados.tamanhoCamiseta.toUpperCase())}
        ${linhaTabela('Tipo', formatarTipoCamiseta(dados.tipoCamiseta))}
      </table>
    </div>

    ${extrasHtml}

    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Pagamento</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${linhaTabela('Valor Total', formatarMoeda(dados.valorInscricao))}
        ${linhaTabela('Data', dados.dataPagamento)}
        ${linhaTabela('ID Mercado Pago', dados.pagamentoId)}
      </table>
    </div>

  </div>

  <div style="${estilos.rodape}">
    <p style="${estilos.rodapeTexto}">Guarde este e-mail como comprovante da sua inscrição.</p>
    <p style="${estilos.rodapeTexto}">Dúvidas? Entre em contato com a organização.</p>
    <p style="${estilos.rodapeTexto}">Trilhão dos Amigos &copy; 2026</p>
  </div>

</div>
</body>
</html>`;
}

export function templateComprovantePedidoAvulso(dados: DadosComprovantePedidoAvulso): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Comprovante de Pedido</title></head>
<body style="margin:0;padding:0;background:#e2e8f0;">
<div style="${estilos.container}">

  <div style="${estilos.header}">
    <p style="${estilos.headerTitulo}">TRILHÃO DOS AMIGOS 2026</p>
    <p style="${estilos.headerSubtitulo}">Comprovante de Pedido — Camiseta Avulsa</p>
    <span style="${estilos.badge}">Pagamento Confirmado</span>
  </div>

  <div style="${estilos.corpo}">

    <div style="${estilos.destaque}">
      <p style="margin:0 0 4px;color:#166534;font-size:13px;font-weight:bold;">CÓDIGO DO PEDIDO</p>
      <p style="margin:0;${estilos.destaqueValor}">${dados.codigoReferencia}</p>
    </div>

    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Dados do Comprador</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${linhaTabela('Nome', dados.nome)}
        ${linhaTabela('E-mail', dados.email)}
      </table>
    </div>

    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Itens do Pedido</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${dados.itens.map((item) =>
          linhaTabela(
            `${item.quantidade}x ${item.tamanho.toUpperCase()} — ${formatarTipoCamiseta(item.tipo)}`,
            ''
          )
        ).join('')}
      </table>
    </div>

    <div style="${estilos.secao}">
      <p style="${estilos.secaoTitulo}">Pagamento</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${linhaTabela('Valor Total', formatarMoeda(dados.valorTotal))}
        ${linhaTabela('Data', dados.dataPagamento)}
      </table>
    </div>

  </div>

  <div style="${estilos.rodape}">
    <p style="${estilos.rodapeTexto}">Guarde este e-mail como comprovante do seu pedido.</p>
    <p style="${estilos.rodapeTexto}">Retire sua camiseta no dia do evento apresentando este código.</p>
    <p style="${estilos.rodapeTexto}">Trilhão dos Amigos &copy; 2026</p>
  </div>

</div>
</body>
</html>`;
}
