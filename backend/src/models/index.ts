// src/models/index.ts
import sequelize from "../config/db";

// Importar todos os modelos
import Participante from "./Participante";
import EstoqueCamiseta from "./EstoqueCamiseta";
import CamisetaExtra from "./CamisasExtras";
import CampeaoBarranco from "./CampeoesMorro";
import Gerente from "./Gerente";
import Foto from "./Foto";

// ============ DEFINIR RELACIONAMENTOS ============

// 1. Participante tem muitas CamisetasExtras
Participante.hasMany(CamisetaExtra, {
  foreignKey: "participanteId",
  as: "camisetasExtras",
  onDelete: "CASCADE", // Se deletar participante, deleta as camisetas extras
});

// 2. CamisetaExtra pertence a um Participante
CamisetaExtra.belongsTo(Participante, {
  foreignKey: "participanteId",
  as: "participante",
});

// ============ EXPORTAR TODOS OS MODELOS ============

export {
  sequelize,
  Participante,
  EstoqueCamiseta,
  CamisetaExtra,
  CampeaoBarranco,
  Gerente,
  Foto,
};

// Export default com todos os modelos organizados
export default {
  sequelize,
  Participante,
  EstoqueCamiseta,
  CamisetaExtra,
  CampeaoBarranco,
  Gerente,
  Foto,
};
