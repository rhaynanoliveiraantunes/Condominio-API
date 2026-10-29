# Condominio-API

API REST para **compras coletivas em condomínios**. Moradores se juntam para comprar produtos em quantidade, pagam via PIX e a compra só é concluída se a quantidade mínima for atingida dentro do prazo. Caso contrário, ela é cancelada e os pagamentos entram em fluxo de reembolso.

Projeto final do curso da Lions Startup.

> 📸 Prints da aplicação em breve.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

---

## Como funciona

1. O administrador do condomínio cria uma compra, informando produto, preço unitário, **quantidade mínima** e **prazo**.
2. Os moradores participam escolhendo a quantidade e pagam via **PIX** na chave do síndico.
3. O morador avisa que pagou e o síndico **confirma o pagamento**.
4. Ao atingir a quantidade mínima, a compra passa para o status `MINIMUM_REACHED`.
5. Se o prazo vence sem atingir o mínimo, a compra é **cancelada automaticamente** e os pagamentos já feitos ficam como `REFUND_PENDING`, até o síndico marcar o reembolso como concluído.
6. Cada pagamento confirmado alimenta um **ranking de produtos** mais pedidos.

## Funcionalidades

- Cadastro e login com **JWT** e senhas criptografadas
- **Controle de acesso por perfil**: usuário, administrador e super administrador
- Suporte a **múltiplos condomínios**, com cada um acessando apenas as próprias compras
- Ciclo completo de compra: criação, edição, participação, confirmação de pagamento e cancelamento
- Fluxo de **reembolso** para compras canceladas
- **Ranking** de produtos mais pedidos
- Exportação de dados em **XML**
- Gerenciamento de perfil e histórico do usuário

## Tecnologias

**Back-end:** Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt, dotenv, CORS, xml2js

**Front-end:** interface web em React que consome a API (TanStack Start, Vite, Tailwind CSS)

## Estrutura

```
Condominio-API/
├── Back/    # API REST (Node.js + Express + MongoDB)
└── front/   # Interface web
```

## Como rodar

**Pré-requisitos:** [Node.js](https://nodejs.org) e uma instância do MongoDB (local ou [MongoDB Atlas](https://www.mongodb.com/atlas)).

### Back-end

```bash
git clone https://github.com/rhaynanoliveiraantunes/Condominio-API.git
cd Condominio-API/Back
npm install
```

Crie um arquivo `.env` na pasta `Back` (veja a seção abaixo) e inicie:

```bash
npm run dev     # desenvolvimento, com nodemon
npm start       # produção
```

### Front-end

```bash
cd Condominio-API/front
npm install
npm run dev
```

O endereço da interface aparece no terminal ao iniciar.

## Variáveis de ambiente

Arquivo `.env` na pasta `Back`:

```env
PORT=3000
MONGO_URI=sua_string_de_conexao_do_mongodb
JWT_SECRET=uma_chave_secreta_longa_e_aleatoria
```

## Endpoints

### Autenticação

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/register` | Cadastro de usuário | Público |
| POST | `/login` | Login, retorna o token JWT | Público |

### Condomínios

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/` | Lista os condomínios | Público |
| POST | `/` | Cria um condomínio | Super admin |

### Compras

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/` | Lista as compras | Login |
| POST | `/` | Cria uma compra | Admin |
| GET | `/:id` | Detalhes de uma compra | Login |
| PUT | `/:id` | Edita uma compra | Admin |
| PATCH | `/:id/cancel` | Cancela uma compra | Admin |
| POST | `/:id/participate` | Participa de uma compra (também em `/:id/join`) | Login |
| DELETE | `/:id/join` | Cancela a própria participação | Login |
| GET | `/:id/participants` | Lista os participantes | Admin |
| GET | `/ranking` | Ranking de produtos | Login |
| GET | `/exportar-acervo` | Exporta o acervo em XML | Público |

### Usuários

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| GET | `/me` | Dados do usuário logado | Login |
| PUT | `/me` | Atualiza o próprio perfil | Login |
| GET | `/history` | Histórico do usuário | Login |
| GET | `/admin` | Lista os usuários | Login |
| PUT | `/admin/:id` | Ativa ou desativa um usuário | Admin |

As rotas protegidas exigem o header `Authorization: Bearer <token>`.

## Autor

**Rhaynan Oliveira Antunes**
Estudante de Engenharia de Software na UEPG

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rhaynan-oliveira-antunes-1b8517431)
[![E-mail](https://img.shields.io/badge/E--mail-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:rhaynanoliveiraantunes@gmail.com)
