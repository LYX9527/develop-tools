// RSA 加密解密工具函数

// 生成RSA密钥对
export async function generateKeyPair(keySize: number = 2048) {
  const algorithm = {
    name: 'RSA-OAEP',
    modulusLength: keySize,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256'
  }

  const keyPair = await crypto.subtle.generateKey(algorithm, true, ['encrypt', 'decrypt'])
  
  const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey)
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

  return {
    publicKey: formatKey(publicKey, 'PUBLIC KEY'),
    privateKey: formatKey(privateKey, 'PRIVATE KEY')
  }
}

// 格式化密钥为PEM格式
function formatKey(keyData: ArrayBuffer, type: string): string {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(keyData)))
  const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64
  return `-----BEGIN ${type}-----\n${formatted}\n-----END ${type}-----`
}

// 解析PEM格式密钥
function parseKey(pemString: string): ArrayBuffer {
  const base64 = pemString
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s/g, '')
  
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// 加密
export async function encrypt(text: string, publicKeyPem: string): Promise<string> {
  const algorithm = {
    name: 'RSA-OAEP',
    hash: 'SHA-256'
  }

  const keyData = parseKey(publicKeyPem)
  const publicKey = await crypto.subtle.importKey('spki', keyData, algorithm, false, ['encrypt'])
  
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  
  const encrypted = await crypto.subtle.encrypt(algorithm, publicKey, data)
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}

// 解密
export async function decrypt(encryptedText: string, privateKeyPem: string): Promise<string> {
  const algorithm = {
    name: 'RSA-OAEP',
    hash: 'SHA-256'
  }

  const keyData = parseKey(privateKeyPem)
  const privateKey = await crypto.subtle.importKey('pkcs8', keyData, algorithm, false, ['decrypt'])
  
  const encryptedData = new Uint8Array(atob(encryptedText).split('').map(char => char.charCodeAt(0)))
  
  const decrypted = await crypto.subtle.decrypt(algorithm, privateKey, encryptedData)
  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
} 