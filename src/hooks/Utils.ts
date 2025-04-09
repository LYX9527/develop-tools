import moment from 'moment';
import {unitOfTime} from "moment/moment";

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


export function parseRelativeDate(date: string, timezone: string = "UTC") {
    if (date === "刚刚") return new Date();

    // 预处理日期字符串
    const theDate = date.trim();

    // 将 `\d+年\d+月...\d+秒前` 分割成 `['\d+年', ..., '\d+秒前']`
    const matches = theDate.match(/\D*\d+(?![:\-/]|(a|p)m)\D+/g);

    // 创建当前时间的moment实例并设置时区
    const currentMoment = moment().utcOffset(timezone);

    if (matches) {
        const lastMatch = matches.pop();

        if (lastMatch) {
            const beforeMatches = /(.*)(?:前|ago)$/.exec(lastMatch);
            if (beforeMatches) {
                matches.push(beforeMatches[1]);
                const duration = toDurationsMoment(matches);
                return currentMoment.subtract(duration.value, duration.unit).toDate();
            }

            const afterMatches = /(?:^in(.*)|(.*)[后後])$/.exec(lastMatch);
            if (afterMatches) {
                matches.push(afterMatches[1] ?? afterMatches[2]);
                const duration = toDurationsMoment(matches);
                return currentMoment.add(duration.value, duration.unit).toDate();
            }

            matches.push(lastMatch);
        }

        const firstMatch = matches.shift();

        if (firstMatch) {
            for (const w of wordsMoment()) {
                const wordMatches = w.regExp.exec(firstMatch);
                if (wordMatches) {
                    matches.unshift(wordMatches[1]);

                    // 使用当前时区创建日期
                    const startDate = moment()
                        .utcOffset(timezone)
                        .hour(0).minute(0).second(0).millisecond(0);

                    const duration = toDurationsMoment(matches);
                    return startDate.add(duration.value, duration.unit).toDate();
                }
            }
        }
    } else {
        // 处理 `特殊词 + 标准时间格式` 的情形
        for (const w of wordsMoment()) {
            const wordMatches = w.regExp.exec(theDate);
            if (wordMatches) {
                const timeStr = /a|pm$/.test(wordMatches[1])
                    ? wordMatches[1].replace(/a|pm/, " $&")
                    : wordMatches[1];

                // 使用 utcOffset 设置时区
                return moment(`${moment().utcOffset(timezone).format("YYYY-MM-DD")} ${timeStr}`)
                    .utcOffset(timezone)
                    .toDate();
            }
        }
    }

    return date;
}

// 辅助函数：将时间单位转换为moment可识别的格式
function toDurationsMoment(matches: string[]) {
    let value = 0;
    let unit = 'seconds' as unitOfTime.Base;

    for (const match of matches) {
        const num = parseInt(match.match(/\d+/)?.[0] || '0');

        if (match.includes('年') || match.includes('year')) {
            value = num;
            unit = 'years';
        } else if (match.includes('月') || match.includes('month')) {
            value = num;
            unit = 'months';
        } else if (match.includes('周') || match.includes('week')) {
            value = num;
            unit = 'weeks';
        } else if (match.includes('天') || match.includes('day')) {
            value = num;
            unit = 'days';
        } else if (match.includes('小时') || match.includes('hour')) {
            value = num;
            unit = 'hours';
        } else if (match.includes('分') || match.includes('minute')) {
            value = num;
            unit = 'minutes';
        } else if (match.includes('秒') || match.includes('second')) {
            value = num;
            unit = 'seconds';
        }
    }

    return {value, unit};
}

// 辅助函数：定义特殊词及其对应的日期
function wordsMoment() {
    return [
        {
            regExp: /^(今天|today)/,
            startAt: moment()
        },
        {
            regExp: /^(明天|tomorrow)/,
            startAt: moment().add(1, 'days')
        },
        {
            regExp: /^(昨天|yesterday)/,
            startAt: moment().subtract(1, 'days')
        },
        {
            regExp: /^(后天|day after tomorrow)/,
            startAt: moment().add(2, 'days')
        },
        {
            regExp: /^(前天|day before yesterday)/,
            startAt: moment().subtract(2, 'days')
        }
    ];
}
