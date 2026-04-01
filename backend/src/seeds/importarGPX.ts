import fs from "fs";
import path from "path";
import { Trajeto } from "../models";
import { XMLParser } from "fast-xml-parser";

/**
 * Importar arquivo GPX da pasta uploads
 */
export const importarGPXdaPasta = async () => {
  try {

    // Caminho do arquivo GPX
    const gpxPath = path.join(process.cwd(), "uploads", "trajeto.gpx");

    // Verificar se arquivo existe
    if (!fs.existsSync(gpxPath)) {
      console.log("⚠️  Arquivo não encontrado em: uploads/trajeto.gpx");
      console.log("\n📝 INSTRUÇÕES:");
      console.log("   1. Coloque seu arquivo GPX na pasta: backend/uploads/");
      console.log("   2. Renomeie para: trajeto.gpx");
      console.log("   3. Execute novamente: npm run seed\n");
      return;
    }

    console.log("✅ Arquivo encontrado:", gpxPath);
    

    // Ler arquivo
    const gpxContent = fs.readFileSync(gpxPath, "utf8");

    // Parser XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const gpxData = parser.parse(gpxContent);

    // Extrair nome
    const nomeTrilha =
      gpxData.gpx?.trk?.name || gpxData.gpx?.trk?.n || "Trilhão dos Amigos";

    // Extrair pontos
    const trackPoints = gpxData.gpx?.trk?.trkseg?.trkpt || [];

    if (!Array.isArray(trackPoints) || trackPoints.length === 0) {
      console.log("❌ Arquivo GPX sem pontos válidos");
      return;
    }

    // Converter para [lat, lon]
    const coordenadas: number[][] = trackPoints.map((pt: any) => [
      parseFloat(pt.lat),
      parseFloat(pt.lon),
    ]);

    console.log(`📍 Total de pontos GPS: ${coordenadas.length}`);

    // Calcular distância (Haversine)
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

    // Calcular ganho de elevação
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

    console.log(`📏 Distância calculada: ${distanciaKm.toFixed(2)} km`);
    if (ganhoElevacao > 0) {
      console.log(`⬆️  Ganho de elevação: ${ganhoElevacao.toFixed(0)} m`);
    }

    // Desativar trajetos anteriores
    await Trajeto.update({ ativo: false }, { where: { ativo: true } });

    // Salvar novo trajeto
    const trajeto = await Trajeto.create({
      nome: nomeTrilha,
      coordenadas: JSON.stringify(coordenadas),
      totalPontos: coordenadas.length,
      distanciaKm: parseFloat(distanciaKm.toFixed(2)),
      ganhoElevacao: ganhoElevacao > 0 ? parseInt(ganhoElevacao.toFixed(0)) : null,
      ativo: true,
    });

    console.log("\n✅ ========================================");
    console.log("   TRAJETO IMPORTADO COM SUCESSO!");
    console.log("========================================");
    console.log(`📌 Nome: ${trajeto.nome}`);
    console.log(`🆔 ID: ${trajeto.id}`);
    console.log(`📍 Pontos: ${trajeto.totalPontos.toLocaleString()}`);
    console.log(`📏 Distância: ${trajeto.distanciaKm} km`);
    if (trajeto.ganhoElevacao) {
      console.log(`⬆️  Elevação: ${trajeto.ganhoElevacao} m`);
    }
    console.log("\n🗺️  Agora acesse o site e veja o mapa atualizado!\n");
  } catch (error) {
    console.error("\n❌ Erro ao importar GPX:", error);
  }
};