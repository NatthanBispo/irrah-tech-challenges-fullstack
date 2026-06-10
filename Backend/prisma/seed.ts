async function main() {
  console.log('Seed concluído. Nenhum dado padrão inserido.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
