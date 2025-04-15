## Projeto: Eu Digital — Engenharia Web 2025

Este documento serve de guia para os programadores envolvidos no desenvolvimento da aplicação. Descreve os tipos de ficheiros suportados, a definição dos metadados e a estrutura do manifesto (SIP) com base na norma BagIt.

## 📁 Tipos de Ficheiros Suportados

A aplicação deverá aceitar os seguintes tipos de ficheiros, divididos por categoria:

### Imagens

- `.jpg`, `.jpeg`
- `.png`
- `.gif`

### Documentos e Texto

- `.txt`
- `.md` (Markdown)
- `.pdf`

### Ficheiros de Dados

- `.csv`
- `.json`

### Áudio

- `.mp3`
- `.wav`

### Vídeo

- `.mp4`
- `.webm`

## Outros

Qualquer outro tipo de dados desconhecido ou não suportado cai nesta categoria.

## 🏷️ Metadados

Todos os ficheiros submetidos devem ser acompanhados de metadados que descrevam o recurso. Estes metadados serão armazenados na base de dados MongoDB e utilizados para facilitar a pesquisa e categorização.

### Campos de Metadados Obrigatórios

| Campo           | Descrição                                                                   |
| --------------- | --------------------------------------------------------------------------- |
| `dataCriacao`   | Data em que o conteúdo foi criado                                           |
| `dataSubmissao` | Data em que o ficheiro foi submetido à aplicação                            |
| `produtor`      | Nome ou identificação de quem criou o conteúdo                              |
| `publicador`    | Nome ou identificação de quem submeteu o ficheiro                           |
| `tituloRecurso` | Título ou descrição breve do recurso                                        |
| `tipoRecurso`   | Tipo do recurso (ver [Tipos Suportados](#📁-tipos-de-ficheiros-suportados)) |
| `descricao`     | Descrição mais completa (opcional mas recomendada)                          |
| `tags`          | Lista de palavras-chave para facilitar a pesquisa (opcional)                |

## 📦 Estrutura do Manifesto SIP (`manifesto-SIP.json`)

O manifesto é um ficheiro JSON (ou XML) incluído dentro do ficheiro `.zip` enviado pelo produtor. Ele define:

- A versão do BagIt utilizada
- Os ficheiros submetidos (payload)
- Os respetivos checksums
- Os metadados associados ao conteúdo

### 📄 Exemplo de `manifesto-SIP.json`

```json
{
  "version": "0.97",
  "payload": [
    {
      "filename": "fotos/foto_aniversario.jpg",
      "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    {
      "filename": "documentos/registo_evento.pdf",
      "checksum": "1a2b3c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef"
    }
  ]
}
```

### 🧪 Requisitos do Processo de Ingestão

Ao receber o `.zip`, o backend deve:

1. Verificar se o `manifesto-SIP.json` está presente.
2. Validar se todos os ficheiros listados no manifesto existem dentro do ZIP.
3. Calcular e validar checksums dos ficheiros.
4. Guardar os metadados na base de dados MongoDB.
5. Armazenar os ficheiros fisicamente na pasta `uploads/`.

## 🧱 Considerações Técnicas

- A pasta `uploads/` deverá ser montada como volume Docker.
- Os caminhos relativos dos ficheiros no manifesto devem coincidir com a estrutura do ZIP.
- A integridade dos ficheiros será verificada via checksums (SHA-256 recomendado).
- O manifesto será o único ponto de entrada com metainformação — não devem ser inferidos dados a partir dos ficheiros diretamente.

---

Este documento deverá ser seguido para garantir a uniformidade e integridade dos dados durante a submissão, ingestão e gestão dos conteúdos na aplicação _Eu Digital_.
