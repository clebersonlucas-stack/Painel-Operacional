# Guia de Segurança: Chaves API e Configuração

## Tipos de Chaves no Supabase

O Supabase fornece dois tipos de chaves que você precisará:

### 1. Chave Anon (Pública)

- **O que é**: Uma chave pública que pode ser exposta no código frontend.
- **Uso**: Usada no arquivo `supabase-config.js` para conectar o frontend ao Supabase.
- **Segurança**: Embora seja "pública", ela está vinculada às políticas de segurança (RLS) do banco de dados. Sem RLS configurado, qualquer pessoa poderia acessar todos os dados.
- **Localização no Supabase**: Settings > API > `anon public`

### 2. Chave de Serviço (Service Role)

- **O que é**: Uma chave privada com acesso total ao banco de dados, ignorando RLS.
- **Uso**: **NUNCA** deve ser exposta no frontend. Usada apenas em backends seguros.
- **Segurança**: Mantenha esta chave em segredo absoluto. Se alguém a obtiver, poderá acessar e modificar todos os dados.
- **Localização no Supabase**: Settings > API > `service_role secret`

## Configuração Segura

### Passo 1: Obter as Chaves

1. Acesse https://supabase.com e faça login no seu projeto.
2. Clique em **"Settings"** (engrenagem no canto inferior esquerdo).
3. Vá para **"API"** (no menu à esquerda).
4. Copie:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public**: A chave pública

### Passo 2: Criar o Arquivo `supabase-config.js`

1. Na raiz do seu projeto, copie o arquivo `supabase-config.example.js` e renomeie para `supabase-config.js`.
2. Preencha com os valores:

```javascript
window.SUPABASE_CONFIG = {
  url: "https://seu-projeto.supabase.co",
  anonKey: "sua_chave_anon_publica_aqui",
};
```

### Passo 3: Adicionar ao `.gitignore` (Opcional, mas Recomendado)

Se você estiver usando Git, adicione o arquivo `supabase-config.js` ao `.gitignore` para evitar fazer commit acidental com as chaves:

```
supabase-config.js
.env.local
.env
```

**Nota**: O arquivo `supabase-config.example.js` deve ser versionado no Git para que outras pessoas saibam qual é o formato esperado.

## Boas Práticas de Segurança

### 1. Nunca Exponha a Chave de Serviço

- A chave de serviço (`service_role secret`) deve ser mantida em um servidor backend seguro.
- **Nunca** a coloque no frontend ou em repositórios públicos.

### 2. Use Row Level Security (RLS)

- O RLS está configurado no `schema.sql` fornecido.
- Ele garante que os usuários só possam acessar os dados que têm permissão.
- Mesmo que alguém obtenha a chave anon, o RLS impedirá acesso não autorizado.

### 3. Rotação de Chaves

Se você suspeitar que uma chave foi comprometida:

1. No Supabase, vá para Settings > API.
2. Clique em **"Regenerate"** ao lado da chave comprometida.
3. Atualize o arquivo `supabase-config.js` com a nova chave.
4. Faça deploy novamente.

### 4. Monitoramento

- Monitore os logs do Supabase para atividades suspeitas.
- No painel do Supabase, clique em **"Logs"** para visualizar atividades recentes.

### 5. Backup de Dados

- O Supabase fornece backups automáticos.
- Você pode restaurar de um backup se necessário.

## Variáveis de Ambiente (Para Desenvolvimento Local)

Se você estiver desenvolvendo localmente e quer evitar deixar as chaves no código, pode usar variáveis de ambiente:

### Usando `.env.local` (Recomendado)

1. Crie um arquivo `.env.local` na raiz do projeto:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica_aqui
```

2. Adicione `.env.local` ao `.gitignore`.

3. No seu `supabase-config.js`, leia as variáveis:

```javascript
window.SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
```

**Nota**: Este método funciona melhor se você estiver usando um bundler como Vite. Para um projeto HTML/CSS/JS puro, a abordagem anterior (arquivo `supabase-config.js`) é mais simples.

## Checklist de Segurança Antes do Deploy

- [ ] Arquivo `supabase-config.js` criado com a chave anon correta.
- [ ] Arquivo `supabase-config.js` adicionado ao `.gitignore` (se usando Git).
- [ ] Arquivo `supabase-config.example.js` versionado no Git como referência.
- [ ] RLS ativado em todas as tabelas no Supabase.
- [ ] Políticas de segurança (RLS) testadas com diferentes papéis de usuário.
- [ ] Chave de serviço (`service_role secret`) nunca foi exposta.
- [ ] Backup de dados configurado no Supabase.
- [ ] Logs do Supabase monitorados para atividades suspeitas.

## Referências

- [Documentação de Segurança do Supabase](https://supabase.com/docs/guides/auth)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP - API Security](https://owasp.org/www-project-api-security/)

---

**Versão**: 1.0  
**Última atualização**: Junho de 2026  
**Autor**: Manus AI
