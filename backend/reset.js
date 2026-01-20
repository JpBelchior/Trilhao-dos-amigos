// Script para resetar senha do admin
// USO: node reset-senha-admin.js <email-do-gerente> <nova-senha>

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetarSenha() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Uso incorreto!');
    console.log('✅ Uso correto: node reset-senha-admin.js <email> <nova-senha>');
    console.log('📝 Exemplo: node reset-senha-admin.js admin@trilhao.com minhaNovaSenh@123');
    process.exit(1);
  }

  const [email, novaSenha] = args;

  console.log('🔧 Iniciando reset de senha...');
  console.log('📧 Email:', email);
  console.log('🔑 Nova senha:', novaSenha);
  console.log('');

  let connection;

  try {
    // Configurações do banco (suporta DB_PASS ou DB_PASSWORD)
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3307, // Porta padrão sua
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || process.env.DB_PASSWORD || '', // Suporta ambos!
      database: process.env.DB_NAME || 'trilhao_db',
    };

    console.log('📡 Conectando ao banco de dados...');
    console.log('   Host:', dbConfig.host);
    console.log('   Porta:', dbConfig.port);
    console.log('   Usuário:', dbConfig.user);
    console.log('   Database:', dbConfig.database);
    console.log('');

    // Conectar ao banco
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Buscar gerente
    const [rows] = await connection.execute(
      'SELECT id, nome, email FROM gerentes WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      console.log('❌ Gerente não encontrado com este email:', email);
      console.log('');
      console.log('💡 Dica: Verifique se o email está correto');
      console.log('   Você pode listar os gerentes com:');
      console.log('   SELECT id, nome, email FROM gerentes;');
      process.exit(1);
    }

    const gerente = rows[0];
    console.log('✅ Gerente encontrado:');
    console.log('   ID:', gerente.id);
    console.log('   Nome:', gerente.nome);
    console.log('   Email:', gerente.email);
    console.log('');

    // Gerar hash da nova senha
    console.log('🔐 Gerando hash da nova senha...');
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(novaSenha, saltRounds);
    console.log('✅ Hash gerado com sucesso');

    // Atualizar senha no banco
    console.log('💾 Atualizando senha no banco...');
    await connection.execute(
      'UPDATE gerentes SET senha = ?, updated_at = NOW() WHERE id = ?',
      [senhaHash, gerente.id]
    );

    console.log('');
    console.log('✅ ==========================================');
    console.log('✅ SENHA RESETADA COM SUCESSO!');
    console.log('✅ ==========================================');
    console.log('');
    console.log('📋 INFORMAÇÕES DE LOGIN:');
    console.log('   Email:', gerente.email);
    console.log('   Senha:', novaSenha);
    console.log('');
    console.log('🌐 Acesse:');
    console.log('   http://localhost:3001/login');
    console.log('');
    console.log('⚠️  IMPORTANTE - FAÇA ISSO AGORA:');
    console.log('   1. Faça login com as credenciais acima');
    console.log('   2. Vá em "Perfil do Gerente"');
    console.log('   3. ALTERE A SENHA para uma definitiva');
    console.log('   4. Delete este script: rm reset-senha-admin.js');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ==========================================');
    console.error('❌ ERRO AO RESETAR SENHA');
    console.error('❌ ==========================================');
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💥 Erro: MySQL não está rodando ou porta incorreta');
      console.error('   Verifique:');
      console.error('   - MySQL está rodando?');
      console.error('   - Porta está correta? (sua porta: 3307)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💥 Erro: Credenciais do MySQL incorretas');
      console.error('   Verifique no .env:');
      console.error('   - DB_USER');
      console.error('   - DB_PASS');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💥 Erro: Database não existe');
      console.error('   Database esperado:', process.env.DB_NAME || 'trilhao_db');
    } else {
      console.error('💥 Erro:', error.message);
      console.error('   Detalhes:', error.code || 'N/A');
    }
    
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com banco fechada');
      console.log('');
    }
  }
}

resetarSenha();