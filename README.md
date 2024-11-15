
---

# Site de Reservas de Salas do IFC de Sombrio

Este projeto tem como objetivo a criação de um sistema de reservas de salas para o Instituto Federal Catarinense (IFC) de Sombrio. O sistema permite que usuários façam login, reservem salas disponíveis e os administradores gerenciem as salas através de uma interface dedicada.

## Tecnologias Utilizadas

- **React.JS:** Utilizado para a criação da interface do usuário.
- **MongoDB:** Banco de dados NoSQL utilizado para armazenar informações sobre usuários, salas e reservas.
- **Express.JS:** Framework para Node.js utilizado na construção da API do servidor.
- **Axios:** Biblioteca para fazer requisições HTTP do frontend para o backend.
- **JWT (JSON Web Token):** Utilizado para autenticação e autorização dos usuários.
- **Bootstrap e PrimeReact:** Bibliotecas de componentes UI para estilização e criação de interfaces interativas.
- **Socket.io:** Para comunicação em tempo real, possibilitando atualizações instantâneas sobre reservas e disponibilidade das salas.

## Dependências

### Principais Dependências

- **axios:** Biblioteca para fazer requisições HTTP.
- **bcrypt:** Utilizado para hash de senhas.
- **body-parser:** Middleware para parsing de dados do corpo das requisições.
- **bootstrap, primeflex, primeicons, primereact:** Bibliotecas de UI e estilos para melhorar a aparência do aplicativo.
- **cors:** Middleware para gerenciar políticas de CORS.
- **express:** Framework para construir a API do servidor.
- **jsonwebtoken:** Para gerenciamento de tokens JWT.
- **mongodb:** Driver do MongoDB para conexão e manipulação de dados.
- **mysql:** Biblioteca para interação com bancos de dados MySQL.
- **react, react-dom, react-router-dom, react-calendar:** Bibliotecas para construção de interfaces e gerenciamento de rotas.

### DevDependencies

- **@types/*:** Tipagens para TypeScript.
- **eslint, eslint-plugin-*:** Ferramentas para análise e formatação de código.
- **vite, @vitejs/plugin-react:** Ferramentas para construção e desenvolvimento de aplicações React.

---

## Histórico de Desenvolvimento

### Dia 17/07 Alpha 1.0.0
- **Início do Projeto:** Estruturação inicial do projeto, criação da página inicial e setup do ambiente de desenvolvimento.

### Dia 31/07 Alpha 1.0.2
- **Integração com MongoDB:** Implementação do MongoDB como banco de dados principal do projeto. Salas iniciais foram adicionadas ao banco.

### Dia 04/08 Alpha 1.0.3
- **Sistema de Login:** Desenvolvimento e integração de um sistema de autenticação utilizando JWT. O sistema de login foi finalizado e testado.

### Dia 07/08 Alpha 1.0.4
- **Página de Administração:** Implementação da página de administração, permitindo a gestão de salas. Foi também implementada a funcionalidade de reserva de salas pelos usuários.

### Dia 17/08 Alpha 1.1.0
- **Melhorias e Hot Reload:** Implementação de hot reload na página de administração para atualização automática das informações das salas sem a necessidade de recarregar a página. Correções de bugs e refinamentos no fluxo de reserva e gerenciamento de salas.

### Dia 28/08 Alpha 1.1.1
- **Função de Reserva por Dia e Aula:** Adicionada a funcionalidade de reserva por dia e aula na página de administração. Agora, as reservas podem ser gerenciadas e visualizadas com base nos dias e aulas específicos, permitindo um controle mais detalhado sobre a disponibilidade das salas.

### Dia 11/09 Alpha 1.2.0
- **Correção de Cancelamento de Reservas:** Implementadas melhorias na lógica de cancelamento de reservas, incluindo verificação de ID e validação adicional para garantir a integridade das operações. As alterações garantem que apenas reservas válidas possam ser canceladas, com tratamento adequado para IDs inválidos e não encontrados.

- **Estilizações com Bootstrap:** Aplicadas estilizações com Bootstrap para um tema escuro na interface de administração. Melhorias na aparência geral, incluindo botões e formulários.

- **Nota sobre Bugs:** Identificado um bug que impede a remoção de reservas próprias. Os usuários estão enfrentando dificuldades ao tentar cancelar suas próprias reservas.

### Dia 21/09 Alpha 1.2.1
- **Criação da Página Pública:** Implementação da página pública, permitindo que usuários vejam as salas reservadas sem a necessidade de login.

- **Correções de Bugs:** Realizados bugfixes em relação a algumas datas, garantindo uma melhor usabilidade e precisão nas reservas.

### Dia 29/09 Alpha 1.2.2
- **Correções de Bugs no Bootstrap:** Resolvido o problema de expansão do navbar e aplicadas melhorias de estilização em várias páginas.
- **Calendário em Português (Brasil):** O sistema agora apresenta o calendário totalmente traduzido para o português brasileiro, melhorando a usabilidade para os usuários.
- **Outros Bugs Corrigidos:** Incluem ajustes em pequenas funcionalidades e melhorias de performance.

- **Nota sobre bugs:** O bug que impede a remoção de reservas próprias ainda não foi resolvido. Além de que o sistema agora apresenta um bug de visualização das datas de reservas próprias.

### Dia 15/11 Beta 1.0.0
- **Correção de Todos os Bugs:** Foram corrigidos todos os bugs identificados nas versões anteriores, incluindo a remoção de reservas próprias e problemas de visualização de datas de reservas.
- **Adição do Artigo do Projeto:** Foi adicionado o artigo completo sobre o projeto, detalhando todas as fases de desenvolvimento, decisões tomadas e tecnologias utilizadas.
- **Melhorias de Desempenho:** O sistema recebeu otimizações para melhorar a performance, com ajustes em como os dados são manipulados no frontend e backend.

---

## Como Rodar o Projeto

1. **Clone o repositório:**

   ```bash
   git clone [link do repositório]
   ```

2. **Instale as dependências:**

   ```bash
   cd app
   npm install
   ```

3. **Configure o ambiente:**

   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

   ```
   MONGO_URI=mongodb://localhost:27017/teste
   JWT_SECRET=sua_chave_secreta
   ```

4. **Inicie o servidor:**

   ```bash
   cd backend
   node server.js
   ```

5. **Inicie o frontend (separado):**

   Navegue para a pasta do frontend e execute:

   ```bash
   npm run dev
   ```

--- 