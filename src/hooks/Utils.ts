/**
 * 根据输入字符串生成确定性的 UUID
 * 相同的输入字符串将始终生成相同的 UUID
 * 
 * @param str 源字符串
 * @param namespace 可选的命名空间，用于增加唯一性
 * @returns UUID 格式的字符串 (8-4-4-4-12)
 */
export function stringToUUID(str: string, namespace: string = ''): string {
  // 将命名空间添加到输入字符串
  const input = namespace + str;
  
  // 创建一个简单的哈希函数 (基于FNV-1a算法的简化版本)
  function simpleHash(s: string): number[] {
    const result = new Array(16).fill(0);
    let h1 = 0x811c9dc5;
    let h2 = 0x1b873593;
    
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i);
      h1 = ((h1 ^ char) * 0x01000193) & 0xffffffff;
      h2 = ((h2 ^ char) * 0x85ebca6b) & 0xffffffff;
      
      // 每8个字符更新结果数组的一部分
      if (i % 8 === 7 || i === s.length - 1) {
        const pos = Math.floor(i / 8) % 4;
        result[pos * 4] = (h1 & 0xff);
        result[pos * 4 + 1] = (h1 >> 8) & 0xff;
        result[pos * 4 + 2] = (h2 & 0xff);
        result[pos * 4 + 3] = (h2 >> 8) & 0xff;
      }
    }
    
    return result;
  }

  // 生成哈希值并转换为十六进制
  const hashBytes = simpleHash(input);
  
  // 转换为UUID格式 (8-4-4-4-12)
  let uuid = '';
  for (let i = 0; i < 16; i++) {
    uuid += hashBytes[i].toString(16).padStart(2, '0');
    // 添加分隔符
    if (i === 3 || i === 5 || i === 7 || i === 9) {
      uuid += '-';
    }
  }
  
  // 设置 UUID 版本 (版本 4) 和变体
  uuid = uuid.substring(0, 14) + '4' + uuid.substring(15, 18) + 
         '8' + uuid.substring(19);
  
  return uuid;
}

/**
 * 生成随机的 UUID v4
 * 
 * @returns 随机生成的 UUID 字符串
 */
export function generateRandomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 检查字符串是否为有效的 UUID 格式
 * 
 * @param uuid 待检查的 UUID 字符串
 * @returns 是否为有效的 UUID 格式
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
