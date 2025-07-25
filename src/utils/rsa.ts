import JSEncrypt from 'jsencrypt'

// 生成密钥对
export function generateKeyPair(keySize: number): Promise<{ publicKey: string; privateKey: string }> {
  return new Promise((resolve) => {
    const crypt = new JSEncrypt({ default_key_size: keySize.toString() })
    const publicKey = crypt.getPublicKey()
    const privateKey = crypt.getPrivateKey()
    resolve({ publicKey, privateKey })
  })
}

// 加密
export function encrypt(text: string, publicKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const crypt = new JSEncrypt()
    crypt.setPublicKey(publicKey)
    const encrypted = crypt.encrypt(text)
    if (encrypted) {
      resolve(encrypted)
    } else {
      reject(new Error('Encryption failed'))
    }
  })
}

// 解密
export function decrypt(text: string, privateKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const crypt = new JSEncrypt()
    crypt.setPrivateKey(privateKey)
    const decrypted = crypt.decrypt(text)
    if (decrypted) {
      resolve(decrypted)
    } else {
      reject(new Error('Decryption failed'))
    }
  })
} 