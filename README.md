# Admin da Agenda — Colo de Deus // Missão SP

Pacote para adicionar o CRUD da agenda ao projeto React + Vite + Supabase.

## Ordem

1. Copie `src/admin/` para o projeto.
2. Execute `supabase/01-admin-eventos.sql` no SQL Editor do Supabase.
3. Em Supabase > Authentication > Users, crie o usuário administrador.
4. Use `src/admin/INTEGRACAO_MAIN.jsx.txt` para ajustar o seu `src/main.jsx`.
5. Use os dois arquivos `AGENDA_*` para adicionar o link opcional de ingresso na agenda pública.
6. Se a Vercel ainda não possui rewrite para SPA, use o conteúdo de `vercel.json.example`.

## Segurança

O frontend continua usando somente a chave pública/publishable do Supabase.
Nunca coloque `service_role` no React.

As policies permitem:
- visitante anônimo: SELECT;
- usuário autenticado: SELECT, INSERT, UPDATE e DELETE.

## Datas

Eventos antigos não são apagados automaticamente. O site público continua filtrando `data_evento >= hoje`, então um evento fica visível durante todo o seu dia e some a partir do dia seguinte. No admin ele permanece no histórico como `Encerrado`.

## Link de ingresso

`link_ingresso` é opcional. Se estiver vazio, nenhum botão é renderizado no site.
