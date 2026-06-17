# Guia Completo: Setup Supabase e Deploy no Cloudflare Pages

Este documento detalha o processo passo a passo para configurar o banco de dados no Supabase, autenticar usuários e realizar o deploy da aplicação no Cloudflare Pages.

## Fase 1: Preparação do Projeto Supabase

### Passo 1.1: Criar um Projeto no Supabase

1. Acesse https://supabase.com e faça login (ou crie uma conta gratuita).
2. Clique em **"New Project"** (Novo Projeto).
3. Preencha os dados:
   - **Project Name**: `central-tecnica` (ou o nome que preferir).
   - **Database Password**: Crie uma senha forte e guarde-a com segurança.
   - **Region**: Selecione a região mais próxima (ex.: `South America (São Paulo)` para melhor latência).
4. Clique em **"Create new project"** e aguarde a inicialização (pode levar alguns minutos).

### Passo 1.2: Executar o Schema SQL

1. No painel do Supabase, clique em **"SQL Editor"** (no menu à esquerda).
2. Clique em **"New Query"** para criar uma nova query.
3. Abra o arquivo `supabase/schema.sql` do seu projeto e copie todo o conteúdo.
4. Cole o conteúdo na query do Supabase.
5. Clique em **"Run"** para executar o script.

**Resultado esperado**: As tabelas `profiles`, `technicians`, `clients`, `activities`, `activity_history` serão criadas, junto com as políticas de segurança (RLS).

### Passo 1.3: Obter as Chaves de Acesso

1. No painel do Supabase, clique em **"Settings"** (engrenagem no canto inferior esquerdo).
2. Vá para **"API"** (no menu à esquerda).
3. Copie os seguintes valores:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public**: A chave pública (anon key)

Guarde esses valores, você precisará deles no próximo passo.

## Fase 2: Autenticação e Gestão de Usuários

### Passo 2.1: Criar Usuários no Supabase Auth

1. No painel do Supabase, clique em **"Authentication"** (no menu à esquerda).
2. Vá para **"Users"**.
3. Clique em **"Invite"** para convidar um novo usuário.
4. Preencha o e-mail do usuário e clique em **"Send invite"**.

**Nota**: O Supabase enviará um e-mail de convite. O usuário precisará clicar no link para definir sua senha.

### Passo 2.2: Criar Perfis de Usuários

Após criar um usuário no Auth, você precisa criar um registro correspondente na tabela `profiles`.

1. No painel do Supabase, clique em **"SQL Editor"**.
2. Clique em **"New Query"**.
3. Execute o seguinte comando SQL, substituindo os valores:

```sql
insert into public.profiles (id, full_name, role)
values ('ID_DO_AUTH_USER', 'Nome Completo do Usuário', 'operador');
```

**Onde**:
- `ID_DO_AUTH_USER`: O UUID do usuário criado no Auth (você pode encontrá-lo na tela "Users" do Supabase).
- `Nome Completo do Usuário`: O nome que aparecerá no sistema.
- `operador`: O papel do usuário. Opções: `supervisor`, `operador`, `tecnico`, `visualizador`.

**Exemplo**:

```sql
insert into public.profiles (id, full_name, role)
values ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'João Silva', 'supervisor');

insert into public.profiles (id, full_name, role)
values ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Maria Santos', 'operador');
```

### Passo 2.3: Papéis de Usuário

| Papel | Permissões |
|:------|:-----------|
| **supervisor** | Gerencia tudo: cria, edita, exclui atividades, técnicos, clientes e usuários. Acesso total aos relatórios. |
| **operador** | Cria atividades e edita/exclui apenas as que criou. Não pode gerenciar técnicos, clientes ou usuários. |
| **tecnico** | Altera apenas o status das atividades atribuídas a ele. Visualiza agenda e relatórios básicos. |
| **visualizador** | Apenas consulta atividades, técnicos, clientes e relatórios. Sem permissão de edição. |

## Fase 3: Configurar o Frontend

### Passo 3.1: Criar o Arquivo de Configuração

1. Na pasta raiz do seu projeto, copie o arquivo `supabase-config.example.js` e renomeie para `supabase-config.js`.
2. Abra `supabase-config.js` e preencha com os valores obtidos no Passo 1.3:

```javascript
window.SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co",
  anonKey: "sua_chave_anon_publica_aqui",
};
```

**Importante**: Não compartilhe a chave anon com pessoas não autorizadas. Embora seja uma chave pública, ela permite acesso ao seu banco de dados.

### Passo 3.2: Testar Localmente

1. Abra o arquivo `index.html` em um navegador (você pode abrir diretamente ou usar um servidor local).
2. Tente fazer login com um dos e-mails de usuários que você criou no Supabase.
3. Verifique se o sistema carrega as atividades, técnicos e clientes do banco.

**Dica**: Se estiver usando um servidor local, você pode usar o comando `python -m http.server 8000` na pasta do projeto e acessar `http://localhost:8000`.

## Fase 4: Deploy no Cloudflare Pages

### Passo 4.1: Preparar os Arquivos

1. Certifique-se de que a pasta `.tmp` **não está incluída** no deploy (ela contém arquivos de teste).
2. Os arquivos necessários para o deploy são:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `supabase-config.js` (o arquivo que você criou com as chaves)

### Passo 4.2: Conectar o Repositório Git

1. Acesse https://github.com e crie um novo repositório (público ou privado).
2. Clone o repositório na sua máquina.
3. Copie os arquivos do seu projeto para a pasta do repositório.
4. Faça commit e push:

```bash
git add .
git commit -m "Initial commit: Central de Atividades Técnicas"
git push origin main
```

### Passo 4.3: Conectar ao Cloudflare Pages

1. Acesse https://dash.cloudflare.com e faça login (crie uma conta gratuita se necessário).
2. Clique em **"Pages"** (no menu à esquerda).
3. Clique em **"Create a project"** e selecione **"Connect to Git"**.
4. Autorize o Cloudflare a acessar seu GitHub.
5. Selecione o repositório que você criou.
6. Preencha os dados de build:
   - **Project name**: `central-tecnica` (ou o nome que preferir).
   - **Production branch**: `main`.
   - **Build command**: Deixe em branco (não há build necessário).
   - **Build output directory**: `/` (raiz do repositório).
7. Clique em **"Save and Deploy"**.

**Resultado**: Seu site será publicado em uma URL como `https://central-tecnica.pages.dev`.

### Passo 4.4: Configurar Domínio Personalizado (Opcional)

1. No painel do Cloudflare Pages, clique no seu projeto.
2. Vá para **"Settings"** > **"Domains"**.
3. Clique em **"Add a domain"** e siga as instruções para conectar um domínio personalizado.

## Fase 5: Validação e Testes

### Passo 5.1: Testar o Sistema Online

1. Acesse a URL do seu site (ex.: `https://central-tecnica.pages.dev`).
2. Faça login com um dos usuários criados no Supabase.
3. Teste as funcionalidades:
   - Criar uma nova atividade.
   - Editar uma atividade.
   - Alterar o status de uma atividade.
   - Visualizar a agenda semanal.
   - Gerar um relatório.

### Passo 5.2: Verificar Permissões

1. Crie usuários com diferentes papéis (supervisor, operador, tecnico, visualizador).
2. Teste cada papel para garantir que as permissões estão funcionando corretamente:
   - Um **operador** não deve conseguir editar atividades criadas por outro operador.
   - Um **tecnico** deve conseguir alterar apenas o status de suas atividades.
   - Um **visualizador** não deve conseguir criar ou editar nada.

## Fase 6: Manutenção e Suporte

### Backup de Dados

O Supabase fornece backups automáticos. Para acessá-los:

1. No painel do Supabase, clique em **"Settings"**.
2. Vá para **"Backups"**.
3. Você verá os backups automáticos realizados.

### Monitoramento

1. No painel do Supabase, clique em **"Logs"** para visualizar atividades do banco.
2. No Cloudflare Pages, você pode visualizar logs de deploy e erros.

### Atualizações

Se você precisar fazer alterações no código:

1. Edite os arquivos localmente.
2. Faça commit e push para o GitHub.
3. O Cloudflare Pages fará o deploy automaticamente.

## Troubleshooting

### Erro: "Chave anon inválida"

- Verifique se você copiou corretamente a chave anon do Supabase.
- Certifique-se de que o arquivo `supabase-config.js` está na raiz do projeto.

### Erro: "Usuário não autenticado"

- Verifique se o usuário foi criado corretamente no Supabase Auth.
- Certifique-se de que um registro correspondente foi criado na tabela `profiles`.

### Erro: "Permissão negada"

- Verifique o papel do usuário na tabela `profiles`.
- Verifique as políticas de segurança (RLS) no Supabase.

### O site não carrega dados do Supabase

- Abra o console do navegador (F12) e verifique se há erros.
- Certifique-se de que a URL do Supabase está correta no arquivo `supabase-config.js`.
- Verifique se as políticas de segurança (RLS) permitem o acesso.

## Referências

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Versão**: 1.0  
**Última atualização**: Junho de 2026  
**Autor**: Manus AI
