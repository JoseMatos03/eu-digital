Este ficheiro explica como instalar e executar a aplicação localmente utilizando Docker. Inclui também detalhes sobre as dependências, estrutura do projeto e comandos úteis.

## Pré-requisitos

Antes de começares, garante que tens instalado:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) + [npm](https://www.npmjs.com/)

## Estrutura do Projeto

```
eu-digital/
├── src/                # Código da aplicação (Express, Pug, Mongoose, etc.)
│   ├── app.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── views/
│   ├── public/
│   ├── uploads/        # Pasta onde ficam os ficheiros submetidos (volume Docker)
│   ├── logs/           # Logs da aplicação (volume Docker)
│   ├── .env            # Variáveis de ambiente (não versionado)
│   └── Dockerfile      # Define o ambiente Docker do backoffice
├── data/               # Volume de dados para MongoDB
├── docker-compose.yml  # Orquestra os serviços
├── DEVELOPERS.md
├── SPECIFICATIONS.md   # Define especificações sobre o projeto
└── README.md
```

## Instalar e correr o projeto com Docker

### 1. Clonar o repositório

```bash
git clone https://github.com/JoseMatos03/eu-digital.git
cd eu-digital
```

### 2. Criar ficheiro `.env`

Dentro da pasta `src/`, cria um ficheiro `.env` com o seguinte conteúdo:

```
MONGO_URI=mongodb://mongo:27017/eu-digital
PORT=3000
```

### 3. Lançar a aplicação

```bash
npm run docker
```

Este comando:

- Cria os containers do **MongoDB** e do **backoffice (Express)**;
- Liga-os em rede;
- Monta os volumes de dados, uploads e logs;
- Inicia a app na porta `http://localhost:3000`

## Comandos úteis Docker

### Ver logs da aplicação:

```bash
docker-compose logs -f
```

### Aceder ao terminal do container do backoffice:

```bash
docker exec -it ew-backoffice-1 bash
```

> Usa `docker ps` para ver o nome exato do container em execução, caso o nome seja diferente.

Garante que tens o MongoDB a correr localmente na porta 27017 e ajusta o `MONGO_URI` no `.env` se necessário.
