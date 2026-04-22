import React, { useState, useEffect } from "react";
import { Flame, Clock, Tag, ShirtIcon, Flag } from "lucide-react";
const API_URL = "http://localhost:8000/api";

const LoteBanner = () => {
  const [precos, setPrecos] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/lotes/precos`)
      .then((r) => r.json())
      .then((data) => {
        if (data.sucesso && !data.dados.usandoFallback) setPrecos(data.dados);
      })
      .catch(() => {});
  }, []);

  if (!precos) return null;

  const { loteAtivo, precoInscricao,precoCamisa } = precos;
  const dataFim = loteAtivo.dataFim.split("-").reverse().join("/");

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-green-400/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Info do lote */}
          <div className="flex flex-col gap-3">
            <span className="bg-yellow-400 text-black text-base font-black px-4 py-1.5 rounded-full uppercase tracking-wider text-center ">
              Estamos no Lote {loteAtivo.numero}
            </span>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400/20 rounded-xl p-3 flex-shrink-0">
                <Flame className="text-yellow-400" size={28} />
              </div>
              <p className="text-white text-lg font-black">
                Aproveite enquanto ainda há tempo!
              </p>
            </div>
          </div>

          {/* Preço e prazo */}
          <div className="flex gap-6 flex-shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                <Tag size={12} />
                Inscrição
              </div>
              <div className="text-2xl font-black text-yellow-400">
                R$ {Number(precoInscricao).toFixed(2).replace(".", ",")}
              </div>
            </div>
            <div className="w-px bg-yellow-400/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                <ShirtIcon size={12} />
                Camisa
              </div>
              <div className="text-2xl font-black text-yellow-400">
                R$ {Number(precoCamisa).toFixed(2).replace(".", ",")}
              </div>
            </div>
            <div className="w-px bg-yellow-400/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                <Clock size={12} />
                Válido até
              </div>
              <div className="text-2xl font-black text-white">{dataFim}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoteBanner;
