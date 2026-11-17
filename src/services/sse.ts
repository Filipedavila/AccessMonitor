export interface SseMessage {
  event: string;
  data: string;
}

/**
 * Parser incremental de Server-Sent Events. Aceita chunks arbitrários
 * (blocos partidos a meio), `\n` ou `\r\n`, e linhas de comentário (`:`).
 * Mensagens `ping` e sem `data` são ignoradas.
 */
export function createSseParser(onMessage: (msg: SseMessage) => void): {
  push: (chunk: string) => void;
} {
  let buffer = '';

  const dispatch = (block: string): void => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split(/\r?\n/)) {
      if (line === '' || line.startsWith(':')) continue;
      const idx = line.indexOf(':');
      const field = idx === -1 ? line : line.slice(0, idx);
      let value = idx === -1 ? '' : line.slice(idx + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') event = value;
      else if (field === 'data') data.push(value);
    }
    if (event === 'ping' || data.length === 0) return;
    onMessage({ event, data: data.join('\n') });
  };

  return {
    push(chunk: string): void {
      buffer += chunk;
      let match: RegExpExecArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer)) !== null) {
        const block = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        dispatch(block);
      }
    },
  };
}
