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
    const key = decodeURIComponent(keyEncoded);
    const value = decodeURIComponent(valueEncoded);
    decoded[key] = value;
    return decoded;
  }, {} as { [key: string]: string });
}