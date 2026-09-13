import { supabase } from './supabase.js';


export async function listarEventosAdmin() {
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      id,
      nome_evento,
      data_evento,
      cidade_evento,
      estado_evento,
      link_ingresso
    `)
    .order('data_evento', {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}


export async function criarEvento(evento) {
  const { data, error } = await supabase
    .from('eventos')
    .insert({
      nome_evento: evento.nome_evento.trim(),
      data_evento: evento.data_evento,
      cidade_evento: evento.cidade_evento.trim(),

      estado_evento: evento.estado_evento
        .trim()
        .toUpperCase(),

      link_ingresso:
        evento.link_ingresso.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function editarEvento(
  id,
  evento,
) {
  const { data, error } = await supabase
    .from('eventos')
    .update({
      nome_evento: evento.nome_evento.trim(),
      data_evento: evento.data_evento,
      cidade_evento: evento.cidade_evento.trim(),

      estado_evento: evento.estado_evento
        .trim()
        .toUpperCase(),

      link_ingresso:
        evento.link_ingresso.trim() || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function excluirEvento(id) {
  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}