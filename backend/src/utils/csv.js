// Geração de CSV (separador ; para compatibilidade com Excel pt-BR)
// Com BOM UTF-8 para acentuação correta no Excel
function escapar(valor) {
  if (valor === null || valor === undefined) return '';
  const texto = String(valor);
  if (/[";\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function gerarCSV(cabecalho, linhas) {
  const linhasCSV = [cabecalho, ...linhas].map((linha) => linha.map(escapar).join(';')).join('\r\n');
  return `\uFEFF${linhasCSV}`;
}

module.exports = { gerarCSV };
