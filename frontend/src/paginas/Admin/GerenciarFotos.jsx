// frontend/src/paginas/Admin/GerenciarFotos.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Upload,
  Trash2,
  Edit3,
  Save,
  X,
  Plus,
  Grid,
  List,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  FileImage,
} from "lucide-react";

const GerenciarFotos = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  // Estados principais
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Estados para upload
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    titulo: "",
    descricao: "",
    stats: "",
    categoria: "edicoes_anteriores",
    edicao: "",
    ano: new Date().getFullYear(),
  });
  const [arquivosSelecionados, setArquivosSelecionados] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Estados para edição
  const [editando, setEditando] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});

  // Estados para visualização
  const [tipoVisao, setTipoVisao] = useState("grid"); // "grid" ou "list"
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  // Categorias disponíveis
  const categorias = {
    edicoes_anteriores: "Edições Anteriores",
    hall_fama: "Hall da Fama",
    galeria_geral: "Galeria Geral",
    evento_atual: "Evento Atual",
  };

  // Carregar fotos ao montar componente
  useEffect(() => {
    carregarFotos();
  }, [filtroCategoria]);

  // Função para carregar fotos
  const carregarFotos = async () => {
    try {
      setLoading(true);
      setErro("");

      const url =
        filtroCategoria === "todas"
          ? "http://localhost:8000/api/fotos"
          : `http://localhost:8000/api/fotos?categoria=${filtroCategoria}`;

      const response = await fetchAuth(url);
      const data = await response.json();

      if (data.sucesso) {
        setFotos(data.dados.fotos || []);
      } else {
        setErro(data.erro || "Erro ao carregar fotos");
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
      setErro("Erro ao conectar com servidor");
    } finally {
      setLoading(false);
    }
  };

  // Função para selecionar arquivos
  const handleSelecionarArquivos = (e) => {
    const files = Array.from(e.target.files);
    const arquivosValidos = files.filter((file) => {
      const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      return (
        tiposPermitidos.includes(file.type) && file.size <= 10 * 1024 * 1024
      ); // 10MB
    });

    if (arquivosValidos.length !== files.length) {
      setErro(
        "Alguns arquivos foram ignorados (formato inválido ou muito grandes)"
      );
    }

    setArquivosSelecionados(arquivosValidos);
  };

  // Função para fazer upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (arquivosSelecionados.length === 0) {
      setErro("Selecione pelo menos uma foto");
      return;
    }

    if (!uploadData.titulo.trim()) {
      setErro("Título é obrigatório");
      return;
    }

    try {
      setUploadLoading(true);
      setErro("");

      const formData = new FormData();

      // Adicionar arquivos
      arquivosSelecionados.forEach((file) => {
        formData.append("fotos", file);
      });

      // Adicionar dados do formulário
      formData.append("titulo", uploadData.titulo);
      formData.append("descricao", uploadData.descricao);
      formData.append("stats", uploadData.stats);
      formData.append("categoria", uploadData.categoria);

      if (uploadData.categoria === "edicoes_anteriores") {
        formData.append("edicao", uploadData.edicao);
        formData.append("ano", uploadData.ano.toString());
      }

      const response = await fetchAuth(
        "http://localhost:8000/api/fotos/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setSucesso(
          `${arquivosSelecionados.length} foto(s) enviada(s) com sucesso!`
        );
        setMostrarUpload(false);
        setUploadData({
          titulo: "",
          descricao: "",
          stats: "",
          categoria: "edicoes_anteriores",
          edicao: "",
          ano: new Date().getFullYear(),
        });
        setArquivosSelecionados([]);
        carregarFotos();
      } else {
        setErro(data.erro || "Erro ao fazer upload");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setErro("Erro ao enviar fotos");
    } finally {
      setUploadLoading(false);
    }
  };

  // Função para deletar foto
  const deletarFoto = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar esta foto?")) {
      return;
    }

    try {
      const response = await fetchAuth(
        `http://localhost:8000/api/fotos/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setSucesso("Foto deletada com sucesso!");
        carregarFotos();
      } else {
        setErro(data.erro || "Erro ao deletar foto");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setErro("Erro ao deletar foto");
    }
  };

  // Função para iniciar edição
  const iniciarEdicao = (foto) => {
    setEditando(foto.id);
    setDadosEdicao({
      titulo: foto.titulo,
      descricao: foto.descricao || "",
      stats: foto.stats || "",
      categoria: foto.categoria,
      edicao: foto.edicao || "",
      ano: foto.ano || new Date().getFullYear(),
    });
  };

  // Função para salvar edição
  const salvarEdicao = async (id) => {
    try {
      const response = await fetchAuth(
        `http://localhost:8000/api/fotos/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosEdicao),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setSucesso("Foto editada com sucesso!");
        setEditando(null);
        carregarFotos();
      } else {
        setErro(data.erro || "Erro ao editar foto");
      }
    } catch (error) {
      console.error("Erro ao editar:", error);
      setErro("Erro ao salvar edições");
    }
  };

  // Componente de card de foto
  const FotoCard = ({ foto }) => (
    <div className="bg-gradient-to-br from-green-900/30 to-black/60 rounded-2xl overflow-hidden border border-green-400/30 hover:border-green-400/50 transition-all">
      {/* Preview da imagem */}
      <div className="h-48 bg-gray-800 relative overflow-hidden">
        <img
          src={`http://localhost:8000${foto.urlFoto}`}
          alt={foto.titulo}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div className="hidden absolute inset-0 bg-gray-800 items-center justify-center">
          <ImageIcon className="text-gray-500" size={48} />
        </div>

        {/* Badge da categoria */}
        <div className="absolute top-2 left-2">
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            {categorias[foto.categoria]}
          </span>
        </div>

        {/* Status */}
        <div className="absolute top-2 right-2">
          {foto.status === "ativo" ? (
            <Eye className="text-green-400" size={20} />
          ) : (
            <EyeOff className="text-gray-500" size={20} />
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {editando === foto.id ? (
          // Modo edição
          <div className="space-y-3">
            <input
              value={dadosEdicao.titulo}
              onChange={(e) =>
                setDadosEdicao((prev) => ({ ...prev, titulo: e.target.value }))
              }
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-400"
              placeholder="Título"
            />
            <textarea
              value={dadosEdicao.descricao}
              onChange={(e) =>
                setDadosEdicao((prev) => ({
                  ...prev,
                  descricao: e.target.value,
                }))
              }
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-400 resize-none"
              rows="2"
              placeholder="Descrição"
            />
            <input
              value={dadosEdicao.stats}
              onChange={(e) =>
                setDadosEdicao((prev) => ({ ...prev, stats: e.target.value }))
              }
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-400"
              placeholder="Stats (ex: 100+ Pilotos • 25km)"
            />

            <div className="flex gap-2">
              <button
                onClick={() => salvarEdicao(foto.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              >
                <Save size={16} className="mr-1" />
                Salvar
              </button>
              <button
                onClick={() => setEditando(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              >
                <X size={16} className="mr-1" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          // Modo visualização
          <div>
            <h3 className="text-white font-bold text-lg mb-2">{foto.titulo}</h3>
            {foto.descricao && (
              <p className="text-gray-300 text-sm mb-2">{foto.descricao}</p>
            )}
            {foto.stats && (
              <p className="text-yellow-400 text-sm mb-3">{foto.stats}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => iniciarEdicao(foto)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm"
              >
                <Edit3 size={16} className="mr-1" />
                Editar
              </button>
              <button
                onClick={() => deletarFoto(foto.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm"
              >
                <Trash2 size={16} className="mr-1" />
                Deletar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Camera className="mr-3 text-green-400" />
                Gerenciar Fotos
              </h1>
              <p className="text-gray-400">
                Upload e gerenciamento de fotos do evento
              </p>
            </div>
          </div>

          <button
            onClick={() => setMostrarUpload(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center font-bold transition-all"
          >
            <Plus className="mr-2" size={20} />
            Nova Foto
          </button>
        </div>

        {/* Mensagens */}
        {sucesso && (
          <div className="mb-6 bg-green-900/30 border border-green-400/50 rounded-xl p-4 flex items-center">
            <CheckCircle className="text-green-400 mr-3" size={20} />
            <span className="text-green-300">{sucesso}</span>
            <button
              onClick={() => setSucesso("")}
              className="ml-auto text-green-400 hover:text-green-300"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {erro && (
          <div className="mb-6 bg-red-900/30 border border-red-400/50 rounded-xl p-4 flex items-center">
            <AlertTriangle className="text-red-400 mr-3" size={20} />
            <span className="text-red-300">{erro}</span>
            <button
              onClick={() => setErro("")}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Filtros e controles */}
        <div className="mb-8 bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filtro por categoria */}
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Filtrar:</span>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-400"
              >
                <option value="todas">Todas as categorias</option>
                {Object.entries(categorias).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de visualização */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTipoVisao("grid")}
                className={`p-2 rounded-lg transition-all ${
                  tipoVisao === "grid"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setTipoVisao("list")}
                className={`p-2 rounded-lg transition-all ${
                  tipoVisao === "list"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Total de fotos */}
            <div className="text-gray-400">
              {fotos.length} foto{fotos.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2
              className="animate-spin mx-auto mb-4 text-green-400"
              size={48}
            />
            <p className="text-white text-xl">Carregando fotos...</p>
          </div>
        ) : (
          /* Grid de fotos */
          <div
            className={
              tipoVisao === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {fotos.length > 0 ? (
              fotos.map((foto) => <FotoCard key={foto.id} foto={foto} />)
            ) : (
              <div className="col-span-full text-center py-20">
                <FileImage className="mx-auto mb-4 text-gray-500" size={64} />
                <p className="text-gray-400 text-xl mb-4">
                  Nenhuma foto encontrada
                </p>
                <button
                  onClick={() => setMostrarUpload(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                >
                  Adicionar primeira foto
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {mostrarUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-green-900/90 to-black/90 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-400/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Upload className="mr-3 text-green-400" />
                Upload de Fotos
              </h2>
              <button
                onClick={() => setMostrarUpload(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* Seleção de arquivos */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Selecionar Fotos *
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleSelecionarArquivos}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-green-400"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Máximo 10 fotos • JPEG, PNG, WebP • Máximo 10MB cada
                </p>

                {arquivosSelecionados.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {arquivosSelecionados.map((file, index) => (
                      <div key={index} className="text-green-400 text-sm">
                        ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={uploadData.titulo}
                  onChange={(e) =>
                    setUploadData((prev) => ({
                      ...prev,
                      titulo: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-3 border border-gray-600 focus:border-green-400"
                  placeholder="Ex: 8ª Edição - 2024"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Categoria *
                </label>
                <select
                  value={uploadData.categoria}
                  onChange={(e) =>
                    setUploadData((prev) => ({
                      ...prev,
                      categoria: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-3 border border-gray-600 focus:border-green-400"
                  required
                >
                  {Object.entries(categorias).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos específicos para edições anteriores */}
              {uploadData.categoria === "edicoes_anteriores" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Edição
                    </label>
                    <input
                      type="text"
                      value={uploadData.edicao}
                      onChange={(e) =>
                        setUploadData((prev) => ({
                          ...prev,
                          edicao: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-3 border border-gray-600 focus:border-green-400"
                      placeholder="Ex: 8ª Edição"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Ano
                    </label>
                    <input
                      type="number"
                      value={uploadData.ano}
                      onChange={(e) =>
                        setUploadData((prev) => ({
                          ...prev,
                          ano: parseInt(e.target.value),
                        }))
                      }
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-3 border border-gray-600 focus:border-green-400"
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>
              )}

              {/* Descrição */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  value={uploadData.descricao}
                  onChange={(e) =>
                    setUploadData((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-3 border border-gray-600 focus:border-green-400 resize-none"
                  rows="3"
                  placeholder="Ex: Mais de 100 participantes enfrentaram o desafio"
                />
              </div>

              {/* Stats */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Estatísticas
                </label>
                <input
                  type="text"
                  value={uploadData.stats}
                  onChange={(e) =>
                    setUploadData((prev) => ({
                      ...prev,
                      stats: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-3 border border-gray-600 focus:border-green-400"
                  placeholder="Ex: 100+ Pilotos • 25km • 4h de Duração"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMostrarUpload(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || arquivosSelecionados.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={20} />
                      Enviar {arquivosSelecionados.length} foto
                      {arquivosSelecionados.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarFotos;
