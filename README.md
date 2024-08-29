# Site de Reservas de Salas do IFC de Sombrio

Este projeto tem como objetivo a criação de um sistema de reservas de salas para o Instituto Federal Catarinense (IFC) de Sombrio. O sistema permite que usuários façam login, reservem salas disponíveis e os administradores gerenciem as salas através de uma interface dedicada.

## Tecnologias Utilizadas

- **React.JS:** Utilizado para a criação da interface do usuário.
- **MongoDB:** Banco de dados NoSQL utilizado para armazenar informações sobre usuários, salas e reservas.
- **Express.JS:** Framework para Node.js utilizado na construção da API do servidor.
- **Axios:** Biblioteca para fazer requisições HTTP do frontend para o backend.
- **JWT (JSON Web Token):** Utilizado para autenticação e autorização dos usuários.
- **CSS Modules:** Para estilização dos componentes do React.

## Histórico de Desenvolvimento

### Dia 17/07
- **Início do Projeto:** Estruturação inicial do projeto, criação da página inicial e setup do ambiente de desenvolvimento.

### Dia 31/07
- **Integração com MongoDB:** Implementação do MongoDB como banco de dados principal do projeto. Salas iniciais foram adicionadas ao banco.

### Dia 04/08
- **Sistema de Login:** Desenvolvimento e integração de um sistema de autenticação utilizando JWT. O sistema de login foi finalizado e testado.

### Dia 07/08
- **Página de Administração:** Implementação da página de administração, permitindo a gestão de salas. Foi também implementada a funcionalidade de reserva de salas pelos usuários.

### Dia 17/08
- **Melhorias e Hot Reload:** Implementação de hot reload na página de administração para atualização automática das informações das salas sem a necessidade de recarregar a página. Correções de bugs e refinamentos no fluxo de reserva e gerenciamento de salas.

### Dia 28/08
- **Função de Reserva por Dia e Aula:** Adicionada a funcionalidade de reserva por dia e aula na página de administração. Agora, as reservas podem ser gerenciadas e visualizadas com base nos dias e aulas específicos, permitindo um controle mais detalhado sobre a disponibilidade das salas.
