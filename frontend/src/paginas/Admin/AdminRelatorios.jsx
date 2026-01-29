import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable";

import useAdminRelatorios from "../../hooks/useAdminRelatorios";
import LoadingComponent from "../../componentes/Loading";
import ErroComponent from "../../componentes/Erro";
import StatCard from "../../componentes/Admin/StatCard";

const AdminRelatorios = () => {
  const navigate = useNavigate();
  const { participantes, loading, erro, estatisticas, carregarParticipantes } =
    useAdminRelatorios();

  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Gerar PDF
  const gerarPDF = () => {
    try {
      setGerandoPDF(true);
      console.log("📄 [Relatórios] Gerando PDF...");

      // Criar novo documento PDF
      const doc = new jsPDF({
        orientation: "landscape", // Paisagem para caber mais colunas
        unit: "mm",
        format: "a4",
      });

      // Configurar fonte
      doc.setFont("helvetica");

      // CABEÇALHO
      doc.setFontSize(18);
      doc.setTextColor(0, 100, 0); // Verde
      doc.text("TRILHÃO DOS AMIGOS - LISTA DE PARTICIPANTES", 148, 15, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Cinza
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 148, 22, {
        align: "center",
      });

      doc.text(
        `Total de Participantes: ${estatisticas.total} | Confirmados: ${estatisticas.confirmados} | Pendentes: ${estatisticas.pendentes}`,
        148,
        28,
        { align: "center" }
      );

      doc.setFontSize(8);
        doc.setTextColor(80, 80, 80); // Cinza escuro
        doc.text("Legenda: M.C = Manga Curta | M.L = Manga Longa", 148, 36, {
        align: "center",
        });
            // Preparar dados da tabela
      const dadosTabela = participantes.map((p) => {
        // Montar string das camisetas
        let camisetas = `${p.tamanhoCamiseta} ${p.tipoCamiseta === "manga_curta" ? "M.Curta" : "M.Longa"}`;

        // Adicionar camisetas extras se houver
        if (p.camisetasExtras && p.camisetasExtras.length > 0) {
          const extras = p.camisetasExtras
            .map(
              (c) =>
                `${c.tamanho} ${c.tipo === "manga_curta" ? "M.Curta" : "M.Longa"}`
            )
            .join(", ");
          camisetas += ` + ${extras}`;
        }

        return [
          p.numeroInscricao || "N/A",
          p.nome || "N/A",
          camisetas,
          p.cidade || "N/A",
          p.estado || "N/A",
          p.statusPagamento === "confirmado" ? "✓ Pago" : "⏳ Pendente",
        ];
      });

      // Gerar tabela
      autoTable(doc, {
        startY: 45,
        startX: 35,
        head: [
          [
            "Nº Inscrição",
            "Nome",
            "Camisetas",
            "Cidade",
            "Estado",
            "Status",
          ],
        ],
        body: dadosTabela,
        theme: 'grid', 
        tableWidth: 'auto',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [0, 100, 0], 
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 28 }, 
          1: { halign: "left", cellWidth: 65 }, 
          2: { halign: "left", cellWidth: 75 }, 
          3: { halign: "left", cellWidth: 50 }, 
          4: { halign: "center", cellWidth: 18 }, 
          5: { halign: "center", cellWidth: 25 }, 
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 35, left: 14, right: 14 },
      });

      // RODAPÉ
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          148,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Salvar PDF
      const nomeArquivo = `Trilhao_Participantes_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(nomeArquivo);

      console.log("✅ [Relatórios] PDF gerado com sucesso!");
    } catch (error) {
      console.error("❌ [Relatórios] Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  };

  if (loading) return <LoadingComponent />;
  if (erro) return <ErroComponent erro={erro} onTentarNovamente={carregarParticipantes} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-8">
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
                 onClick={() => navigate("/admin")}
                 className="mr-4 p-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
                          >
                <ArrowLeft size={24} />
            </button>
            <div>
              <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                Relatórios
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-green-400"></div>
              </div>
              <p className="text-gray-400 text-xl mt-2">
                Gere e exporte listas de participantes
              </p>
            </div>
          </div>

          <button
            onClick={gerarPDF}
            disabled={gerandoPDF || participantes.length === 0}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            {gerandoPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gerando...
              </>
            ) : (
              <>
                <Download size={20} />
                Gerar PDF
              </>
            )}
          </button>
        </div>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <StatCard
            icon={Users}
            value={estatisticas.total}
            label="Total de Participantes"
            color="yellow"
          />
         
        </div>

        {/* TABELA */}
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Printer className="text-yellow-400" size={24} />
              Pré-visualização do Relatório
            </h2>
            <span className="text-gray-400">
              {participantes.length} registros
            </span>
          </div>

          {participantes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-400 text-xl">
                Nenhum participante cadastrado ainda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-400/30">
                    <th className="text-left text-yellow-400 font-bold py-3 px-4">
                      Nº Inscrição
                    </th>
                    <th className="text-left text-yellow-400 font-bold py-3 px-4">
                      Nome
                    </th>
                    <th className="text-left text-yellow-400 font-bold py-3 px-4">
                      Camisetas
                    </th>
                    <th className="text-left text-yellow-400 font-bold py-3 px-4">
                      Cidade
                    </th>
                    <th className="text-center text-yellow-400 font-bold py-3 px-4">
                      Estado
                    </th>
                    <th className="text-center text-yellow-400 font-bold py-3 px-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((p, index) => (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-700/30 hover:bg-green-900/20 transition-colors ${
                        index % 2 === 0 ? "bg-black/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-white font-mono">
                        {p.numeroInscricao}
                      </td>
                      <td className="py-3 px-4 text-white">{p.nome}</td>
                      <td className="py-3 px-4 text-gray-300">
                        <div className="flex flex-col">
                          <span>
                            {p.tamanhoCamiseta}{" "}
                            {p.tipoCamiseta === "manga_curta"
                              ? "Manga Curta"
                              : "Manga Longa"}
                          </span>
                          {p.camisetasExtras &&
                            p.camisetasExtras.length > 0 && (
                              <span className="text-xs text-yellow-400">
                                +{" "}
                                {p.camisetasExtras
                                  .map(
                                    (c) =>
                                      `${c.tamanho} ${c.tipo === "manga_curta" ? "M.C" : "M.L"}`
                                  )
                                  .join(", ")}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{p.cidade}</td>
                      <td className="py-3 px-4 text-center text-white">
                        {p.estado}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            p.statusPagamento === "confirmado"
                              ? "bg-green-600/30 text-green-400"
                              : "bg-yellow-600/30 text-yellow-400"
                          }`}
                        >
                          {p.statusPagamento === "confirmado"
                            ? "✓ Pago"
                            : "⏳ Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INFO ADICIONAL */}
        <div className="mt-8 bg-green-900/30 rounded-2xl p-6 border border-green-400/30">
          <h4 className="text-lg font-bold text-green-400 mb-3">
            Sobre o Relatório em PDF
          </h4>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              • <strong>Formato:</strong> PDF em orientação paisagem (A4)
            </p>
            <p>
              • <strong>Conteúdo:</strong> Lista completa de participantes com
              número de inscrição, nome, camisetas, cidade, estado e status de
              pagamento
            </p>
            <p>
              • <strong>Ideal para:</strong> Impressão, controle de entrega de
              camisetas e conferência de inscrições
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorios;