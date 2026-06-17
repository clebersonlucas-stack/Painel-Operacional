# Migração para Supabase - Central de Atividades Técnicas

## Ordem Recomendada

1. Criar um projeto em https://supabase.com.
2. Abrir `SQL Editor` e executar `supabase/schema.sql`.
3. Criar usuários em `Authentication > Users`.
4. Para cada usuário criado, inserir um registro em `profiles`.
5. Conectar o frontend usando `SUPABASE_URL` e `SUPABASE_ANON_KEY` no arquivo `supabase-config.js`.
6. Publicar o site no Cloudflare Pages.

## Perfis e Permissões

| Papel | Permissões |
|:------|:-----------|
| **supervisor** | Gerencia tudo: cria, edita, exclui atividades, técnicos, clientes e usuários. Acesso total aos relatórios. |
| **operador** | Cria atividades e edita/exclui apenas as que criou. Não pode gerenciar técnicos, clientes ou usuários. |
| **tecnico** | Altera apenas o status das atividades atribuídas a ele. Visualiza agenda e relatórios básicos. |
| **visualizador** | Apenas consulta atividades, técnicos, clientes e relatórios. Sem permissão de edição. |

## Exemplo de Criação de Profile

```sql
insert into public.profiles (id, full_name, role)
values ('ID_DO_AUTH_USER', 'Nome do Usuário', 'operador');
```

O `ID_DO_AUTH_USER` vem da tela `Authentication > Users` no Supabase.

## Melhorias Implementadas

### Schema SQL Atualizado

- **Coluna `created_by_name`** adicionada à tabela `activities` para armazenar o nome do criador.
- **Política `profiles_read_all_basic`** permite que todos os usuários autenticados leiam perfis (necessário para exibir nomes de criadores).
- **Política `activities_read`** atualizada para permitir que o criador veja suas próprias atividades.
- **Sincronização de histórico** agora inclui o rastreamento completo de mudanças de status.

### Frontend Otimizado

- **Sincronização robusta** com tratamento de erros melhorado.
- **Histórico de atividades** agora sincronizado com o banco de dados.
- **Funções async/await** para garantir que os dados sejam salvos antes de prosseguir.
- **Mapeamento de dados** entre o formato local e o esquema Supabase.

## Publicação Grátis

Use Cloudflare Pages para hospedar os arquivos estáticos:

- `index.html`
- `styles.css`
- `app.js`
- `supabase-config.js` (arquivo de configuração com suas chaves)

**Importante**: Não envie a pasta `.tmp` para o repositório Git.

## Guia Completo

Para instruções detalhadas, consulte o arquivo `SETUP_SUPABASE_DEPLOY.md` na raiz do projeto.

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

---

**Versão**: 2.0  
**Última atualização**: Junho de 2026  
**Autor**: Manus AI
