import { Request, Response } from "express";
import {Trajeto} from "../models"
import { XMLParser } from "fast-xml-parser";

export class TrajetoController {
  /**
   * POST /api/trajeto/upload
   * Upload e processamento de arquivo GPX
   */
  public static async uploadGPX(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          sucesso: false,
          erro: "Arquivo GPX não fornecido",
        });
        return;
      }

      console.log("📍 Processando GPX:", file.originalname);

      // Parser XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });

      const gpxData = parser.parse(file.buffer.toString());

      // Extrair pontos
      const trackPoints = gpxData.gpx?.trk?.trkseg?.trkpt || [];

      if (!Array.isArray(trackPoints) || trackPoints.length === 0) {
        res.status(400).json({
          sucesso: false,
          erro: "GPX sem pontos válidos",
        });
        return;
      }

      // Converter para [lat, lon]
      const coordenadas: number[][] = trackPoints.map((pt: any) => [
        parseFloat(pt.lat),
        parseFloat(pt.lon),
      ]);

      // Calcular distância (fórmula de Haversine)
      let distanciaKm = 0;
      for (let i = 0; i < coordenadas.length - 1; i++) {
        const [lat1, lon1] = coordenadas[i];
        const [lat2, lon2] = coordenadas[i + 1];

        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanciaKm += R * c;
      }

      // Calcular ganho de elevação (se tiver)
      let ganhoElevacao = 0;
      const elevacoes = trackPoints
        .map((pt: any) => (pt.ele ? parseFloat(pt.ele) : null))
        .filter((e: number | null) => e !== null);

      if (elevacoes.length > 0) {
        for (let i = 0; i < elevacoes.length - 1; i++) {
          const diff = elevacoes[i + 1] - elevacoes[i];
          if (diff > 0) ganhoElevacao += diff;
        }
      }

      // Desativar trajetos anteriores
      await Trajeto.update({ ativo: false }, { where: { ativo: true } });

      // Salvar novo trajeto
      const trajeto = await Trajeto.create({
        nome: gpxData.gpx?.trk?.name || gpxData.gpx?.trk?.n || "Trilhão dos Amigos",
        coordenadas: JSON.stringify(coordenadas),
        totalPontos: coordenadas.length,
        distanciaKm: parseFloat(distanciaKm.toFixed(2)),
        ganhoElevacao: ganhoElevacao > 0 ? parseInt(ganhoElevacao.toFixed(0)) : null,
        ativo: true,
      });

      console.log("✅ Trajeto salvo:", {
        pontos: coordenadas.length,
        distancia: distanciaKm.toFixed(2),
      });

      res.json({
        sucesso: true,
        dados: {
          id: trajeto.id,
          totalPontos: trajeto.totalPontos,
          distanciaKm: trajeto.distanciaKm,
          ganhoElevacao: trajeto.ganhoElevacao,
        },
        mensagem: "Trajeto importado com sucesso!",
      });
    } catch (error) {
      console.error("❌ Erro ao processar GPX:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro ao processar GPX",
      });
    }
  }

  /**
   * GET /api/trajeto/atual
   * Retorna trajeto ativo
   */
  public static async obterTrajetoAtual(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const trajeto = await Trajeto.findOne({
        where: { ativo: true },
        order: [["createdAt", "DESC"]],
      });

      if (!trajeto) {
        res.json({
          sucesso: false,
          mensagem: "Nenhum trajeto disponível",
        });
        return;
      }

      res.json({
        sucesso: true,
        dados: {
          id: trajeto.id,
          nome: trajeto.nome,
          coordenadas: JSON.parse(trajeto.coordenadas),
          distanciaKm: trajeto.distanciaKm,
          totalPontos: trajeto.totalPontos,
          ganhoElevacao: trajeto.ganhoElevacao,
        },
      });
    } catch (error) {
      console.error("❌ Erro ao buscar trajeto:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro ao buscar trajeto",
      });
    }
  }
}