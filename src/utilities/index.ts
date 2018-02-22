/**
 * wraps `decodeURIComponent` and returns the original string if it cannot be decoded
 */
export function decodeUri(str: string) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export function formEncode(obj: { [key: string]: string }) {
  return (Object
    .entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  );
}

export function formDecode(str: string) {
  return str.split('&').reduce((decoded, keyValuePair) => {
    const [keyEncoded, valueEncoded] = keyValuePair.split('=');
    const key = decodeUri(keyEncoded);
    const value = decodeUri(valueEncoded);
    decoded[key] = value;
    return decoded;
  }, {} as { [key: string]: string });
}

export function regularToCamelCase(reg: string) {
  const words = (reg
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(x => !!x)
    .map(s => s.substring(0, 1).toUpperCase() + s.substring(1))
  );

  const firstWord = words[0];
  if (!firstWord) { return ''; }

  return [firstWord.toLowerCase(), ...words.slice(1)].join('');
}
