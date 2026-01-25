import { Participante, CamisetaExtra, EstoqueCamiseta } from "../models";
import {
  TamanhoCamiseta,
  TipoCamiseta,
  CategoriaMoto,
  StatusPagamento,
  StatusEntrega,
} from "../types/models";

export const popularParticipantes = async (): Promise<void> => {
  try {
    console.log("👥 Populando participantes de teste...");

    // Limpar participantes existentes
    await CamisetaExtra.destroy({ where: {} });
    await Participante.destroy({ where: {} });
    console.log("🗑️ Participantes anteriores removidos");

    // Dados dos participantes confirmados
    const participantesConfirmados = [
      {
        nome: "João Silva",
        cidade: "Itamonte",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda Bros 160",
      },
      {
        nome: "Maria Santos",
        cidade: "Resende",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 350 EXC-F",
      },
      {
        nome: "Pedro Oliveira",
        cidade: "Passa Quatro",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Lander 250",
      },
      {
        nome: "Ana Costa",
        cidade: "Cruzeiro",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Honda CRF 250X",
      },
      {
        nome: "Carlos Mendes",
        cidade: "São Paulo",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda XRE 300",
      },
      {
        nome: "Lucia Fernandes",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Yamaha WR 250F",
      },
      {
        nome: "Rafael Lima",
        cidade: "Belo Horizonte",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Crosser 150",
      },
      {
        nome: "Juliana Alves",
        cidade: "Juiz de Fora",
        estado: "MG",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 250 Duke",
      },
      {
        nome: "Marcos Pereira",
        cidade: "Volta Redonda",
        estado: "RJ",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda Pop 110",
      },
      {
        nome: "Larissa Nogueira",
        cidade: "Campos do Jordão",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Beta RR 300",
      },
      {
        nome: "Caio Brito",
        cidade: "Piquete",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Crypton 115",
      },
      {
        nome: "Jéssica Cunha",
        cidade: "Guaratinguetá",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "GasGas EC 250F",
      },
    ];

    // Dados dos participantes cancelados
    const participantesCancelados = [
      {
        nome: "TESTE Cancelado 1",
        cidade: "Itamonte",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda Bros 160",
      },
      {
        nome: "TESTE Cancelado 2",
        cidade: "Resende",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 350 EXC-F",
      },
      {
        nome: "TESTE Cancelado 3",
        cidade: "São Paulo",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Lander 250",
      },
    ];

    // Criar participantes confirmados
    for (let i = 0; i < participantesConfirmados.length; i++) {
      const dados = participantesConfirmados[i];
      const cpfNumero = String(11122233000 + i).padStart(11, "0");
      const cpf = `${cpfNumero.slice(0, 3)}.${cpfNumero.slice(
        3,
        6
      )}.${cpfNumero.slice(6, 9)}-${cpfNumero.slice(9, 11)}`;

      const tamanhos = Object.values(TamanhoCamiseta);
      const tipos = Object.values(TipoCamiseta);
      const tamanhoCamiseta =
        tamanhos[Math.floor(Math.random() * tamanhos.length)];
      const tipoCamiseta = tipos[Math.floor(Math.random() * tipos.length)];

      let valorInscricao = 100.0;

      // ✅ SIMULAR DIFERENTES STATUS DE ENTREGA
      // 60% das camisetas principais já entregues para teste
      const camisetaPrincipalEntregue = Math.random() > 0.4;
      const statusEntregaCamiseta = camisetaPrincipalEntregue
        ? StatusEntrega.ENTREGUE
        : StatusEntrega.NAO_ENTREGUE;

      const dataEntregaCamiseta = camisetaPrincipalEntregue
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        : undefined;

      const entreguePor = camisetaPrincipalEntregue
        ? ["João Organizador", "Maria Coordenadora", "Carlos Voluntário"][
            Math.floor(Math.random() * 3)
          ]
        : undefined;

      const participante = await Participante.create({
        nome: dados.nome,
        cpf,
        email: `${dados.nome.toLowerCase().replace(/\s+/g, ".")}@email.com`,
        telefone: `(35) 9${String(
          Math.floor(Math.random() * 90000000) + 10000000
        )}`,
        cidade: dados.cidade,
        estado: dados.estado,
        modeloMoto: dados.moto,
        categoriaMoto: dados.categoria,
        tamanhoCamiseta,
        tipoCamiseta,
        valorInscricao,
        statusPagamento: StatusPagamento.CONFIRMADO,
        observacoes: "Participante de teste",

        // ✅ NOVOS CAMPOS DE ENTREGA
        statusEntregaCamiseta,
        dataEntregaCamiseta,
        entreguePor,
      });

      // 40% chance de ter camisetas extras
      if (Math.random() > 0.6) {
        const qtdExtras = Math.floor(Math.random() * 2) + 1; // 1 a 2 extras

        for (let j = 0; j < qtdExtras; j++) {
          const tamanhoExtra =
            tamanhos[Math.floor(Math.random() * tamanhos.length)];
          const tipoExtra = tipos[Math.floor(Math.random() * tipos.length)];

          // ✅ SIMULAR STATUS DE ENTREGA PARA EXTRAS
          // 50% das camisetas extras já entregues
          const extraEntregue = Math.random() > 0.5;
          const statusEntregaExtra = extraEntregue
            ? StatusEntrega.ENTREGUE
            : StatusEntrega.NAO_ENTREGUE;

          const dataEntregaExtra = extraEntregue
            ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            : undefined;

          const entreguePorExtra = extraEntregue
            ? ["Ana Organizadora", "Pedro Coordenador", "Lucas Voluntário"][
                Math.floor(Math.random() * 3)
              ]
            : undefined;

          await CamisetaExtra.create({
            participanteId: participante.id!,
            tamanho: tamanhoExtra,
            tipo: tipoExtra,
            preco: 50.0,

            // ✅ NOVOS CAMPOS DE ENTREGA
            statusEntrega: statusEntregaExtra,
            dataEntrega: dataEntregaExtra,
            entreguePor: entreguePorExtra,
          });

          valorInscricao += 50.0;
        }

        await participante.update({ valorInscricao });
      }

      console.log(
        `✅ ${dados.nome} (${dados.cidade}/${dados.estado}) - ${
          dados.moto
        } - Camiseta: ${
          statusEntregaCamiseta === StatusEntrega.ENTREGUE
            ? "ENTREGUE"
            : "PENDENTE"
        }`
      );
    }

    // Criar participantes cancelados (sem campos de entrega pois não fazem sentido)
    for (let i = 0; i < participantesCancelados.length; i++) {
      const dados = participantesCancelados[i];
      const cpfNumero = String(99988877000 + i).padStart(11, "0");
      const cpf = `${cpfNumero.slice(0, 3)}.${cpfNumero.slice(
        3,
        6
      )}.${cpfNumero.slice(6, 9)}-${cpfNumero.slice(9, 11)}`;

      await Participante.create({
        nome: dados.nome,
        cpf,
        email: `cancelado${i + 1}@teste.com`,
        telefone: `(35) 99999-999${i + 1}`,
        cidade: dados.cidade,
        estado: dados.estado,
        modeloMoto: dados.moto,
        categoriaMoto: dados.categoria,
        tamanhoCamiseta: TamanhoCamiseta.M,
        tipoCamiseta: TipoCamiseta.MANGA_CURTA,
        valorInscricao: 100.0,
        statusPagamento: StatusPagamento.CANCELADO,
        observacoes: "Participante cancelado para teste",

        // ✅ CAMPOS DE ENTREGA PARA CANCELADOS (sempre não entregue)
        statusEntregaCamiseta: StatusEntrega.NAO_ENTREGUE,
        dataEntregaCamiseta: undefined,
        entreguePor: undefined,
      });

      console.log(
        `❌ ${dados.nome} (${dados.cidade}/${dados.estado}) - ${dados.moto} - CANCELADO`
      );
    }

    // Atualizar estoque para refletir as reservas
    const todosItensEstoque = await EstoqueCamiseta.findAll();
    for (const item of todosItensEstoque) {
      await item.atualizarReservadas();
    }

    const totalParticipantes =
      participantesConfirmados.length + participantesCancelados.length;
    console.log(`🎉 Participantes criados com sucesso!`);
    console.log(
      `📊 Total: ${totalParticipantes} participantes (${participantesConfirmados.length} confirmados + ${participantesCancelados.length} cancelados)`
    );
    console.log(`📦 Status de entrega simulado para teste do sistema`);
  } catch (error) {
    console.error("❌ Erro ao popular participantes:", error);
    throw error;
  }
};
