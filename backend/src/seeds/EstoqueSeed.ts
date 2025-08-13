// src/seeds/EstoqueSeed.ts
import { EstoqueCamiseta } from "../models";
import { TamanhoCamiseta, TipoCamiseta, CategoriaMoto } from "../types/models";

export const popularEstoque = async (): Promise<void> => {
  try {
    console.log("🏭 Populando estoque de camisetas...");

    // Definir estoque para cada combinação tamanho + tipo
    const estoqueInicial = [
      // MANGA CURTA
      {
        tamanho: TamanhoCamiseta.PP,
        tipo: TipoCamiseta.MANGA_CURTA,
        quantidade: 30,
      },
      {
        tamanho: TamanhoCamiseta.P,
        tipo: TipoCamiseta.MANGA_CURTA,
        quantidade: 50,
      },
      {
        tamanho: TamanhoCamiseta.M,
        tipo: TipoCamiseta.MANGA_CURTA,
        quantidade: 70,
      },
      {
        tamanho: TamanhoCamiseta.G,
        tipo: TipoCamiseta.MANGA_CURTA,
        quantidade: 60,
      },
      {
        tamanho: TamanhoCamiseta.GG,
        tipo: TipoCamiseta.MANGA_CURTA,
        quantidade: 40,
      },

      // MANGA LONGA
      {
        tamanho: TamanhoCamiseta.PP,
        tipo: TipoCamiseta.MANGA_LONGA,
        quantidade: 25,
      },
      {
        tamanho: TamanhoCamiseta.P,
        tipo: TipoCamiseta.MANGA_LONGA,
        quantidade: 45,
      },
      {
        tamanho: TamanhoCamiseta.M,
        tipo: TipoCamiseta.MANGA_LONGA,
        quantidade: 60,
      },
      {
        tamanho: TamanhoCamiseta.G,
        tipo: TipoCamiseta.MANGA_LONGA,
        quantidade: 50,
      },
      {
        tamanho: TamanhoCamiseta.GG,
        tipo: TipoCamiseta.MANGA_LONGA,
        quantidade: 35,
      },
    ];

    // Limpar estoque existente
    await EstoqueCamiseta.destroy({ where: {} });
    console.log("🗑️  Estoque anterior removido");

    // Criar novo estoque
    for (const item of estoqueInicial) {
      await EstoqueCamiseta.create({
        tamanho: item.tamanho,
        tipo: item.tipo,
        quantidadeTotal: item.quantidade,
        quantidadeReservada: 0, // Inicia sem reservas
      });

      console.log(
        `✅ ${item.tamanho} ${item.tipo}: ${item.quantidade} unidades`
      );
    }

    // Resumo final
    const totalCamisetas = estoqueInicial.reduce(
      (total, item) => total + item.quantidade,
      0
    );
    console.log(`🎉 Estoque criado com sucesso!`);
    console.log(
      `📦 Total: ${totalCamisetas} camisetas em ${estoqueInicial.length} produtos diferentes`
    );
  } catch (error) {
    console.error("❌ Erro ao popular estoque:", error);
    throw error;
  }
};

// Função para popular dados de exemplo dos campeões
export const popularCampeoes = async (): Promise<void> => {
  try {
    console.log("🏆 Populando hall da fama...");

    const { CampeaoBarranco } = await import("../models");

    // Limpar campeões existentes
    await CampeaoBarranco.destroy({ where: {} });

    // Campeões de exemplo
    const campeoes = [
      {
        nome: "Carlos Mendes",
        edicao: "15ª Edição",
        ano: 2024,
        cidade: "São Paulo",
        estado: "SP",
        resultadoAltura: 47.25,
        modeloMoto: "KTM 350 EXC-F",
        categoriaMoto: CategoriaMoto.IMPORTADA,
      },
      {
        nome: "João Silva",
        edicao: "14ª Edição",
        ano: 2023,
        cidade: "Rio de Janeiro",
        estado: "RJ",
        resultadoAltura: 45.8,
        modeloMoto: "Honda Bros 160",
        categoriaMoto: CategoriaMoto.NACIONAL,
      },
      {
        nome: "Pedro Costa",
        edicao: "13ª Edição",
        ano: 2022,
        cidade: "Itamonte",
        estado: "MG",
        resultadoAltura: 44.5,
        modeloMoto: "Yamaha Lander 250",
        categoriaMoto: CategoriaMoto.NACIONAL,
      },
      {
        nome: "Roberto Lima",
        edicao: "12ª Edição",
        ano: 2021,
        cidade: "São Paulo",
        estado: "SP",
        resultadoAltura: 42.9,
        modeloMoto: "Honda CRF 250",
        categoriaMoto: CategoriaMoto.IMPORTADA,
      },
    ];

    for (const campeao of campeoes) {
      await CampeaoBarranco.create(campeao);
      console.log(
        `🏆 ${campeao.nome} (${campeao.edicao}): ${campeao.resultadoAltura}m`
      );
    }

    console.log("🎉 Hall da fama populado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao popular campeões:", error);
    throw error;
  }
};
