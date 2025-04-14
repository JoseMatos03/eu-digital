FROM node:22-slim

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar restante código da app
COPY . .

# Expor a porta da aplicação
EXPOSE 3000

# Iniciar a aplicação
CMD ["node", "app.js"]
