// Seed — dados de demonstração para o sistema de estoque veterinário
// Execução: npm run prisma:seed  (ou: node prisma/seed.js)
// As datas são relativas ao momento da execução para que os alertas
// (vencido, vencendo 30d, estoque baixo) estejam sempre demonstráveis.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const diasAtras = (dias, horas = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(d.getHours() - horas);
  return d;
};

const diasAFrente = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d;
};

async function main() {
  console.log('Limpando dados existentes...');
  await prisma.saida.deleteMany();
  await prisma.entrada.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.fornecedor.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  // ------------------------------------------------------------
  // Usuários
  // ------------------------------------------------------------
  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@clinica.com',
      senhaHash: bcrypt.hashSync('admin123', 10),
      perfil: 'ADMIN',
    },
  });

  const funcionario = await prisma.usuario.create({
    data: {
      nome: 'João Atendente',
      email: 'funcionario@clinica.com',
      senhaHash: bcrypt.hashSync('func123', 10),
      perfil: 'FUNCIONARIO',
    },
  });

  console.log('Usuários criados: admin@clinica.com / admin123 | funcionario@clinica.com / func123');

  // ------------------------------------------------------------
  // Categorias
  // ------------------------------------------------------------
  const categorias = await Promise.all(
    [
      { nome: 'Antibióticos', descricao: 'Medicamentos antibióticos' },
      { nome: 'Anti-inflamatórios', descricao: 'Medicamentos anti-inflamatórios' },
      { nome: 'Analgésicos', descricao: 'Medicamentos analgésicos' },
      { nome: 'Vermífugos', descricao: 'Medicamentos antiparasitários' },
      { nome: 'Vacinas', descricao: 'Vacinas veterinárias' },
      { nome: 'Materiais Descartáveis', descricao: 'Seringas, gazes, luvas etc.' },
      { nome: 'Higiene', descricao: 'Produtos de higiene e antissépticos' },
      { nome: 'Outros', descricao: 'Outros produtos e medicamentos' },
    ].map((c) => prisma.categoria.create({ data: c }))
  );

  const cat = Object.fromEntries(categorias.map((c) => [c.nome, c.id]));

  // ------------------------------------------------------------
  // Fornecedores
  // ------------------------------------------------------------
  const fornecedores = await Promise.all(
    [
      {
        nome: 'VetFarm Distribuidora',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 3456-7890',
        email: 'vendas@vetfarm.com.br',
        endereco: 'Av. das Nações, 1200',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000',
      },
      {
        nome: 'PharmaVet Ltda',
        cnpj: '98.765.432/0001-10',
        telefone: '(21) 98765-4321',
        email: 'contato@pharmavet.com.br',
        endereco: 'Rua do Comércio, 45',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '20000-000',
      },
      {
        nome: 'AgroSaúde Comércio',
        cnpj: '11.222.333/0001-44',
        telefone: '(31) 3333-4444',
        email: 'vendas@agrosaude.com.br',
        endereco: 'Rod. BR-040, km 12',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30000-000',
      },
      {
        nome: 'MedVet Suprimentos',
        cnpj: '55.444.333/0001-22',
        telefone: '(41) 3222-1100',
        email: 'pedidos@medvet.com.br',
        endereco: 'Av. Industrial, 800',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '80000-000',
      },
      {
        nome: 'BioPet Indústria',
        cnpj: '77.888.999/0001-66',
        telefone: '(51) 4002-8922',
        email: 'comercial@biopet.com.br',
        endereco: 'Rua das Indústrias, 300',
        cidade: 'Porto Alegre',
        estado: 'RS',
        cep: '90000-000',
      },
    ].map((f) => prisma.fornecedor.create({ data: f }))
  );

  const forn = Object.fromEntries(fornecedores.map((f) => [f.nome, f.id]));

  // ------------------------------------------------------------
  // Produtos (cenários: normal, estoque baixo, vencendo, vencido)
  // ------------------------------------------------------------
  const produtos = [
    // ESTOQUE BAIXO (5 <= mínimo 10), dentro da validade
    {
      nome: 'Dipirona Veterinária',
      codigo: 'PRO-001',
      categoriaId: cat['Analgésicos'],
      fornecedorId: forn['VetFarm Distribuidora'],
      descricao: 'Analgésico e antitérmico injetável 500mg/ml',
      unidadeMedida: 'ampola',
      quantidadeAtual: 5,
      quantidadeMinima: 10,
      valorCompra: 3.5,
      valorVenda: 8.9,
      lote: 'LOT-DIP-2201',
      dataValidade: diasAFrente(180),
    },
    // VENCENDO EM ATÉ 30 DIAS
    {
      nome: 'Amoxicilina',
      codigo: 'PRO-002',
      categoriaId: cat['Antibióticos'],
      fornecedorId: forn['PharmaVet Ltda'],
      descricao: 'Antibiótico de amplo espectro 250mg',
      unidadeMedida: 'comprimido',
      quantidadeAtual: 40,
      quantidadeMinima: 15,
      valorCompra: 1.2,
      valorVenda: 3.5,
      lote: 'LOT-AMX-3302',
      dataValidade: diasAFrente(22),
    },
    // NORMAL
    {
      nome: 'Meloxicam',
      codigo: 'PRO-003',
      categoriaId: cat['Anti-inflamatórios'],
      fornecedorId: forn['PharmaVet Ltda'],
      descricao: 'Anti-inflamatório não esteroidal 0,2%',
      unidadeMedida: 'ml',
      quantidadeAtual: 60,
      quantidadeMinima: 20,
      valorCompra: 2.1,
      valorVenda: 6.0,
      lote: 'LOT-MLX-1180',
      dataValidade: diasAFrente(240),
    },
    // VENCIDO (validade já passou)
    {
      nome: 'Vermífugo Praziquantel',
      codigo: 'PRO-004',
      categoriaId: cat['Vermífugos'],
      fornecedorId: forn['AgroSaúde Comércio'],
      descricao: 'Vermífugo de amplo espectro 50mg',
      unidadeMedida: 'comprimido',
      quantidadeAtual: 30,
      quantidadeMinima: 10,
      valorCompra: 0.9,
      valorVenda: 2.8,
      lote: 'LOT-VER-0905',
      dataValidade: diasAtras(15),
    },
    // NORMAL (maior volume)
    {
      nome: 'Soro Fisiológico 0,9%',
      codigo: 'PRO-005',
      categoriaId: cat['Outros'],
      fornecedorId: forn['MedVet Suprimentos'],
      descricao: 'Solução fisiológica 250ml',
      unidadeMedida: 'frasco',
      quantidadeAtual: 120,
      quantidadeMinima: 30,
      valorCompra: 4.0,
      valorVenda: 9.5,
      lote: 'LOT-SOR-7755',
      dataValidade: diasAFrente(400),
    },
    // NORMAL
    {
      nome: 'Clorexidina Antisséptica',
      codigo: 'PRO-006',
      categoriaId: cat['Higiene'],
      fornecedorId: forn['BioPet Indústria'],
      descricao: 'Antisséptico degermante 2%',
      unidadeMedida: 'frasco',
      quantidadeAtual: 45,
      quantidadeMinima: 12,
      valorCompra: 6.5,
      valorVenda: 14.9,
      lote: 'LOT-CLX-5510',
      dataValidade: diasAFrente(300),
    },
    // ESTOQUE BAIXO + VENCENDO 30D
    {
      nome: 'Vacina V10',
      codigo: 'PRO-007',
      categoriaId: cat['Vacinas'],
      fornecedorId: forn['VetFarm Distribuidora'],
      descricao: 'Vacina polivalente canina V10',
      unidadeMedida: 'dose',
      quantidadeAtual: 8,
      quantidadeMinima: 20,
      valorCompra: 18.0,
      valorVenda: 49.9,
      lote: 'LOT-VAC-4488',
      dataValidade: diasAFrente(28),
    },
    // NORMAL
    {
      nome: 'Seringa Descartável 5ml',
      codigo: 'PRO-008',
      categoriaId: cat['Materiais Descartáveis'],
      fornecedorId: forn['MedVet Suprimentos'],
      descricao: 'Seringa com agulha 25x7',
      unidadeMedida: 'un',
      quantidadeAtual: 200,
      quantidadeMinima: 50,
      valorCompra: 0.35,
      valorVenda: 1.0,
      lote: null,
      dataValidade: null,
    },
    // VENCENDO 30D
    {
      nome: 'Pomada Cicatrizante',
      codigo: 'PRO-009',
      categoriaId: cat['Outros'],
      fornecedorId: forn['BioPet Indústria'],
      descricao: 'Pomada regeneradora 50g',
      unidadeMedida: 'bisnaga',
      quantidadeAtual: 25,
      quantidadeMinima: 8,
      valorCompra: 7.0,
      valorVenda: 16.9,
      lote: 'LOT-POM-3390',
      dataValidade: diasAFrente(18),
    },
    // NORMAL
    {
      nome: 'Enrofloxacina',
      codigo: 'PRO-010',
      categoriaId: cat['Antibióticos'],
      fornecedorId: forn['AgroSaúde Comércio'],
      descricao: 'Antibiótico fluoroquinolona 10%',
      unidadeMedida: 'ml',
      quantidadeAtual: 55,
      quantidadeMinima: 15,
      valorCompra: 2.8,
      valorVenda: 7.5,
      lote: 'LOT-ENR-6622',
      dataValidade: diasAFrente(210),
    },
    // NORMAL
    {
      nome: 'Gaze Estéril 10x10',
      codigo: 'PRO-011',
      categoriaId: cat['Materiais Descartáveis'],
      fornecedorId: forn['MedVet Suprimentos'],
      descricao: 'Pacote com 10 unidades',
      unidadeMedida: 'pacote',
      quantidadeAtual: 90,
      quantidadeMinima: 25,
      valorCompra: 2.2,
      valorVenda: 5.5,
      lote: null,
      dataValidade: diasAFrente(500),
    },
    // ESTOQUE BAIXO
    {
      nome: 'Dipirona Gotas 200mg/ml',
      codigo: 'PRO-012',
      categoriaId: cat['Analgésicos'],
      fornecedorId: forn['VetFarm Distribuidora'],
      descricao: 'Analgésico em gotas 20ml',
      unidadeMedida: 'frasco',
      quantidadeAtual: 4,
      quantidadeMinima: 12,
      valorCompra: 5.0,
      valorVenda: 12.0,
      lote: 'LOT-DIG-2288',
      dataValidade: diasAFrente(150),
    },
  ];

  for (const p of produtos) {
    await prisma.produto.create({ data: p });
  }

  // ------------------------------------------------------------
  // Movimentações (entradas e saídas nos últimos 3 meses)
  // ------------------------------------------------------------
  const produtoPorCodigo = {};
  for (const p of produtos) {
    const criado = await prisma.produto.findUnique({ where: { codigo: p.codigo } });
    produtoPorCodigo[p.codigo] = criado.id;
  }

  const entrada = (codigo, quantidade, dias, lote, dataValidade, valorCompra, fornecedorNome, observacao, usuarioId, horas = 0) =>
    prisma.entrada.create({
      data: {
        produtoId: produtoPorCodigo[codigo],
        quantidade,
        lote,
        dataValidade,
        valorCompra,
        fornecedorId: fornecedorNome ? forn[fornecedorNome] : null,
        observacao,
        usuarioId,
        dataEntrada: diasAtras(dias, horas),
      },
    });

  const saida = (codigo, quantidade, dias, motivo, clienteTutor, observacao, usuarioId, horas = 0) =>
    prisma.saida.create({
      data: {
        produtoId: produtoPorCodigo[codigo],
        quantidade,
        motivo,
        clienteTutor,
        observacao,
        usuarioId,
        dataSaida: diasAtras(dias, horas),
      },
    });

  // Entradas (2 a 3 por mês nos últimos 3 meses)
  await entrada('PRO-005', 50, 80, 'LOT-SOR-7755', diasAFrente(400), 4.0, 'MedVet Suprimentos', 'Reposição de soro', admin.id, 5);
  await entrada('PRO-003', 30, 75, 'LOT-MLX-1180', diasAFrente(240), 2.1, 'PharmaVet Ltda', 'Compra mensal', admin.id, 8);
  await entrada('PRO-001', 20, 62, 'LOT-DIP-2201', diasAFrente(180), 3.5, 'VetFarm Distribuidora', 'Reposição de dipirona', admin.id, 3);
  await entrada('PRO-002', 40, 60, 'LOT-AMX-3302', diasAFrente(22), 1.2, 'PharmaVet Ltda', 'Compra de antibiótico', funcionario.id, 6);
  await entrada('PRO-008', 100, 52, null, null, 0.35, 'MedVet Suprimentos', 'Materiais', admin.id, 4);
  await entrada('PRO-006', 20, 45, 'LOT-CLX-5510', diasAFrente(300), 6.5, 'BioPet Indústria', 'Reposição', funcionario.id, 7);
  await entrada('PRO-007', 10, 38, 'LOT-VAC-4488', diasAFrente(28), 18.0, 'VetFarm Distribuidora', 'Lote de vacinas', admin.id, 2);
  await entrada('PRO-004', 30, 30, 'LOT-VER-0905', diasAtras(15), 0.9, 'AgroSaúde Comércio', 'Compra de vermífugo', admin.id, 5);
  await entrada('PRO-010', 25, 25, 'LOT-ENR-6622', diasAFrente(210), 2.8, 'AgroSaúde Comércio', 'Reposição', funcionario.id, 6);
  await entrada('PRO-012', 15, 18, 'LOT-DIG-2288', diasAFrente(150), 5.0, 'VetFarm Distribuidora', 'Reposição', admin.id, 4);
  await entrada('PRO-005', 40, 12, 'LOT-SOR-7799', diasAFrente(380), 4.0, 'MedVet Suprimentos', 'Novo lote', admin.id, 6);
  await entrada('PRO-009', 15, 8, 'LOT-POM-3390', diasAFrente(18), 7.0, 'BioPet Indústria', 'Novo lote', funcionario.id, 3);
  await entrada('PRO-011', 40, 5, null, diasAFrente(500), 2.2, 'MedVet Suprimentos', 'Reposição de gazes', admin.id, 7);

  // Saídas (vendas e uso clínico)
  await saida('PRO-005', 12, 70, 'VENDA', 'Carlos Silva', 'Venda de soro', funcionario.id, 3);
  await saida('PRO-003', 8, 66, 'USO_CLINICO', null, 'Aplicação em cirurgia', funcionario.id, 5);
  await saida('PRO-008', 40, 55, 'USO_CLINICO', null, 'Procedimentos da semana', funcionario.id, 4);
  await saida('PRO-001', 6, 50, 'VENDA', 'Maria Souza', 'Venda de dipirona', funcionario.id, 6);
  await saida('PRO-005', 15, 40, 'VENDA', 'Pedro Alves', 'Venda', funcionario.id, 2);
  await saida('PRO-006', 5, 35, 'VENDA', 'Ana Lima', 'Venda de antisséptico', admin.id, 5);
  await saida('PRO-010', 10, 28, 'USO_CLINICO', null, 'Tratamento de infecção', funcionario.id, 3);
  await saida('PRO-007', 2, 22, 'VENDA', 'Rita Costa', 'Venda de vacina', funcionario.id, 4);
  await saida('PRO-004', 3, 15, 'VENCIMENTO', null, 'Descarte de lote vencido', admin.id, 6);
  await saida('PRO-008', 30, 10, 'USO_CLINICO', null, 'Uso em consultas', funcionario.id, 2);
  await saida('PRO-005', 10, 7, 'VENDA', 'João Pedro', 'Venda de soro', funcionario.id, 5);
  await saida('PRO-002', 5, 3, 'VENDA', 'Luana Reis', 'Venda de amoxicilina', funcionario.id, 4);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
