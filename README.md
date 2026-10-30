# VestiTempo

Aplicativo para montar combinações de roupas para cada dia de uma viagem, considerando o roteiro e a previsão do tempo.

## Ideia do projeto

O usuário informa o plano ou roteiro da viagem. A aplicação organiza os destinos por dia, consulta a previsão meteorológica e recomenda looks adequados para cada atividade e condição climática.

As APIs externas previstas são:

- [Open-Meteo](https://open-meteo.com/): previsão do tempo.
- [Nominatim](https://nominatim.org/): conversão de nomes de cidades em coordenadas.

## Arquitetura

O projeto será composto por dois softwares em repositórios separados:

1. **Servidor**: API RESTful desenvolvida em Flask, responsável pelas regras de negócio, integração com as APIs externas e persistência.
2. **Cliente**: aplicação React responsável pela interface e pelo consumo da API do servidor.

O banco de dados será o MongoDB hospedado no MongoDB Atlas.


## Escopo inicial do frontend

- Tela inicial com os roteiros cadastrados.
- Cadastro e edição de um roteiro de viagem.
- Organização dos destinos e atividades por data.
- Exibição da previsão do tempo por destino.
- Recomendação de roupas para cada dia.
- Lista de peças da mala.
- Integração com a API Flask por meio de variáveis de ambiente.

## Executando o cliente

Pré-requisito: Node.js 18 ou superior.

1. Suba o servidor Flask ([projeto3-progefi-tempo-back](https://github.com/tomMatteo/projeto3-progefi-tempo-back)).
   Por padrão ele roda em `http://localhost:5000` e só aceita requisições
   vindas de `http://localhost:5173`.
2. Crie o arquivo `.env` a partir do exemplo (o `.env` não deve ser commitado):

   ```bash
   cp .env.example .env
   ```

3. Instale as dependências e inicie o servidor de desenvolvimento:

   ```bash
   npm install
   npm run dev
   ```

4. Acesse `http://localhost:5173`.

## Integração com a API

Ao clicar em **Gerar recomendações**, o formulário envia
`POST ${VITE_API_URL}/plan` com o corpo:

```json
{
  "clothes": {
    "t-shirt": 3, "long-sleeve": 0, "pants": 1, "shorts": 2,
    "coat": 1, "heavy-coat": 0, "second-skin": 0, "gloves": 0
  },
  "itinerary": { "2026-11-02": "Av. Paulista, 1578, São Paulo" },
  "average_temp": 22
}
```

- `clothes`: quantidade de cada peça. Hoje o formulário só preenche camisetas
  (`t-shirt`), calças (`pants`), shorts e agasalhos (`coat`); as demais vão
  como `0`.
- `itinerary`: data (`AAAA-MM-DD`) → endereço do destino naquele dia.
- `average_temp`: temperatura em que o usuário se sente confortável (°C).

A resposta traz a recomendação de cada dia, em ordem de data:

```json
{
  "2026-11-02": {
    "outfit": { "t-shirt": 1, "shorts": 1 },
    "notes": []
  }
}
```

Em caso de erro, a API responde `400` (dados inválidos ou endereço não
encontrado) ou `502` (Nominatim ou Open-Meteo fora do ar). A interface mostra
"Não achamos esse endereço." para o `400` e uma mensagem genérica para os
demais.