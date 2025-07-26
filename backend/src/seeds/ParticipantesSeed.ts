// backend/src/seeds/ParticipantesSeed.ts
import { Participante, CamisetaExtra, EstoqueCamiseta } from "../models";
import {
  TamanhoCamiseta,
  TipoCamiseta,
  CategoriaMoto,
  StatusPagamento,
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
        moto: "Honda NXR 160",
      },
      {
        nome: "Fernanda Souza",
        cidade: "Campos do Jordão",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Husqvarna FE 350",
      },
      {
        nome: "Gabriel Rodrigues",
        cidade: "Piquete",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha XT 660",
      },
      {
        nome: "Camila Barbosa",
        cidade: "Guaratinguetá",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 390 Adventure",
      },
      {
        nome: "Bruno Gomes",
        cidade: "Aparecida",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda Tornado 250",
      },
      {
        nome: "Isabela Martins",
        cidade: "Cachoeira Paulista",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Honda CRF 450X",
      },
      {
        nome: "Diego Carvalho",
        cidade: "Lorena",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Factor 125",
      },
      {
        nome: "Leticia Ribeiro",
        cidade: "Pindamonhangaba",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Yamaha YZ 250F",
      },
      {
        nome: "Thiago Nascimento",
        cidade: "Taubaté",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda CG 160",
      },
      {
        nome: "Patrícia Araújo",
        cidade: "São José dos Campos",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 690 Enduro",
      },
      {
        nome: "Leonardo Dias",
        cidade: "Jacareí",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha YBR 150",
      },
      {
        nome: "Vanessa Freitas",
        cidade: "Caçapava",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Husqvarna TE 300",
      },
      {
        nome: "Rodrigo Moreira",
        cidade: "São Sebastião",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda Pop 110",
      },
      {
        nome: "Stephanie Castro",
        cidade: "Caraguatatuba",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Beta RR 300",
      },
      {
        nome: "Felipe Correia",
        cidade: "Ubatuba",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Crypton 115",
      },
      {
        nome: "Bianca Vieira",
        cidade: "Paraty",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "GasGas EC 250F",
      },
      {
        nome: "André Machado",
        cidade: "Angra dos Reis",
        estado: "RJ",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda Bros 160",
      },
      {
        nome: "Carolina Monteiro",
        cidade: "Mangaratiba",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 350 EXC-F",
      },
      {
        nome: "Gustavo Cardoso",
        cidade: "Itatiaia",
        estado: "RJ",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Lander 250",
      },
      {
        nome: "Natália Ferreira",
        cidade: "Penedo",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Honda CRF 250X",
      },
      {
        nome: "Vinicius Rocha",
        cidade: "Visconde de Mauá",
        estado: "RJ",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda XRE 300",
      },
      {
        nome: "Amanda Silva",
        cidade: "Aiuruoca",
        estado: "MG",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Yamaha WR 250F",
      },
      {
        nome: "Roberto Pinto",
        cidade: "São Lourenço",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Crosser 150",
      },
      {
        nome: "Priscila Melo",
        cidade: "Caxambu",
        estado: "MG",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 250 Duke",
      },
      {
        nome: "Eduardo Torres",
        cidade: "Baependi",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda NXR 160",
      },
      {
        nome: "Renata Campos",
        cidade: "Carrancas",
        estado: "MG",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Husqvarna FE 350",
      },
      {
        nome: "Alexandre Ramos",
        cidade: "Queluz",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha XT 660",
      },
      {
        nome: "Claudia Teixeira",
        cidade: "Lavrinhas",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 390 Adventure",
      },
      {
        nome: "Fabio Santana",
        cidade: "Itamonte",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda Tornado 250",
      },
      {
        nome: "Monica Lopes",
        cidade: "Resende",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Honda CRF 450X",
      },
      {
        nome: "Daniel Cavalcanti",
        cidade: "Passa Quatro",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha Factor 125",
      },
      {
        nome: "Simone Duarte",
        cidade: "Cruzeiro",
        estado: "SP",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Yamaha YZ 250F",
      },
      {
        nome: "Henrique Reis",
        cidade: "São Paulo",
        estado: "SP",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Honda CG 160",
      },
      {
        nome: "Adriana Morais",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "KTM 690 Enduro",
      },
      {
        nome: "Igor Nunes",
        cidade: "Belo Horizonte",
        estado: "MG",
        categoria: CategoriaMoto.NACIONAL,
        moto: "Yamaha YBR 150",
      },
      {
        nome: "Sabrina Lacerda",
        cidade: "Juiz de Fora",
        estado: "MG",
        categoria: CategoriaMoto.IMPORTADA,
        moto: "Husqvarna TE 300",
      },
      {
        nome: "Otávio Andrade",
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
      });

      // 30% chance de ter camisetas extras
      if (Math.random() > 0.7) {
        const qtdExtras = Math.floor(Math.random() * 2) + 1; // 1 a 2 extras

        for (let j = 0; j < qtdExtras; j++) {
          const tamanhoExtra =
            tamanhos[Math.floor(Math.random() * tamanhos.length)];
          const tipoExtra = tipos[Math.floor(Math.random() * tipos.length)];

          await CamisetaExtra.create({
            participanteId: participante.id!,
            tamanho: tamanhoExtra,
            tipo: tipoExtra,
            preco: 50.0,
          });

          valorInscricao += 50.0;
        }

        await participante.update({ valorInscricao });
      }

      console.log(
        `✅ ${dados.nome} (${dados.cidade}/${dados.estado}) - ${dados.moto}`
      );
    }

    // Criar participantes cancelados
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
  } catch (error) {
    console.error("❌ Erro ao popular participantes:", error);
    throw error;
  }
};
