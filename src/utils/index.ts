import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function formatDate(value: Date) {
  return format(value, 'dd MMM yyyy', { locale: ptBR });
}
