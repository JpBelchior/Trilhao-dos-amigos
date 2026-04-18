import sequelize from "../config/db";

// Importar todos os modelos
import Participante from "./Participante";
import EstoqueCamiseta from "./EstoqueCamiseta";
import CamisetaExtra from "./CamisasExtras";
import CampeaoBarranco from "./CampeoesMorro";
import Gerente from "./Gerente";
import Foto from "./Foto";
import Trajeto from "./Trajeto";
import PedidoCamisetaAvulsa from "./PedidoCamisetaAvulsa";
import ItemPedidoCamisetaAvulsa from "./ItemPedidoCamisetaAvulsa";
import Lote from "./Lote";

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

// 3. PedidoCamisetaAvulsa pode pertencer a um Participante (opcional)
PedidoCamisetaAvulsa.belongsTo(Participante, {
  foreignKey: "participanteId",
  as: "participante",
});

Participante.hasMany(PedidoCamisetaAvulsa, {
  foreignKey: "participanteId",
  as: "pedidosAvulsos",
});

// 4. PedidoCamisetaAvulsa tem muitos itens
PedidoCamisetaAvulsa.hasMany(ItemPedidoCamisetaAvulsa, {
  foreignKey: "pedidoId",
  as: "itens",
  onDelete: "CASCADE",
});

ItemPedidoCamisetaAvulsa.belongsTo(PedidoCamisetaAvulsa, {
  foreignKey: "pedidoId",
  as: "pedido",
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
  Trajeto,
  PedidoCamisetaAvulsa,
  ItemPedidoCamisetaAvulsa,
  Lote,
};

export default {
  sequelize,
  Participante,
  EstoqueCamiseta,
  CamisetaExtra,
  CampeaoBarranco,
  Gerente,
  Foto,
  Trajeto,
  PedidoCamisetaAvulsa,
  ItemPedidoCamisetaAvulsa,
  Lote,
};
