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

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Para conectar o formulário ao servidor Flask, crie um arquivo `.env` (que não
deve ser commitado) a partir do exemplo abaixo:

```bash
VITE_API_URL=http://localhost:5000
```

O formulário envia um novo roteiro para `POST ${VITE_API_URL}/roteiros`, com
as datas e endereços dos destinos e as quantidades separadas de calças,
camisetas, shorts e agasalhos.