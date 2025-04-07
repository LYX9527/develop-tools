<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import {
  NCard,
  NInput,
  NSpace,
  NStatistic,
  NGrid,
  NGridItem,
  NButton,
  NSlider,
  NDivider,
  useMessage,
  NModal,
} from "naive-ui";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// 消息提示
const message = useMessage();

// 控制设置弹窗显示
const showSettingsModal = ref(false);

// 本地存储键名
const STORAGE_KEY = "wordcount_settings";

// 用户输入的文本
const inputText = ref(``);

// 方格纸配置
const columns = ref(20); // 每行列数
const rows = ref(20); // 每页行数
const cellSize = ref(30); // 方格大小(px)
const gridGap = ref(14); // 行间距(px)，增加默认值以确保标记可见
const showLineNumbers = ref(true); // 是否显示行号
const pageGap = ref(30); // 页面之间的间距
const isPunSeparate = ref(true); // 标点符号单独显示
// 分页相关
const canvasRefs = ref<Array<HTMLCanvasElement | null>>([]);
const currentPage = ref(1); // 当前页码
const pageSize = computed(() => columns.value * rows.value); // 每页字符数
const totalPages = computed(
  () => Math.ceil(textChars.value.length / pageSize.value) || 1
); // 总页数
const scrollContainerRef = ref<HTMLElement | null>(null);
const isAtEnd = ref(false);

// Canvas相关
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasCtx = ref<CanvasRenderingContext2D | null>(null);
const canvasWidth = computed(() => columns.value * cellSize.value + 1); // 单页宽度
const canvasHeight = computed(
  () => rows.value * (cellSize.value + gridGap.value) - gridGap.value + 20
); // 单页高度

//用于计算字符宽度的元素
const calcRef = ref<HTMLSpanElement | null>(null);

// 计算单页显示的行数
const pagesData = computed(() => {
  const chars = textChars.value;
  const pages = [];

  for (let pageIndex = 0; pageIndex < totalPages.value; pageIndex++) {
    const startIndex = pageIndex * pageSize.value;
    const endIndex = Math.min(startIndex + pageSize.value, chars.length);
    const pageChars = chars.slice(startIndex, endIndex);
    pages.push(pageChars);
  }

  return pages;
});

// 计算容器总宽度
const containerWidth = computed(() => {
  return (
    totalPages.value * canvasWidth.value +
    (totalPages.value - 1) * pageGap.value
  );
});

// 计算各类字符数量
const statistics = computed(() => {
  const text = inputText.value;
  if (!text) {
    return {
      total: 0,
      chinese: 0,
      english: 0,
      number: 0,
      space: 0,
      lineBreak: 0,
      punctuation: 0,
      other: 0,
    };
  }

  // 汉字：匹配中文字符范围
  const chinesePattern = /[\u4e00-\u9fa5]/g;
  const chineseMatches = text.match(chinesePattern) || [];
  const chineseCount = chineseMatches.length;

  // 英文：匹配英文字母（含大小写）
  const englishPattern = /[a-zA-Z]/g;
  const englishMatches = text.match(englishPattern) || [];
  const englishCount = englishMatches.length;

  // 数字
  const numberPattern = /[0-9]/g;
  const numberMatches = text.match(numberPattern) || [];
  const numberCount = numberMatches.length;

  // 空格（只匹配真正的空格字符）
  const spacePattern = / /g;
  const spaceMatches = text.match(spacePattern) || [];
  const spaceCount = spaceMatches.length;

  // 换行符
  const lineBreakPattern = /\r\n|\r|\n/g;
  const lineBreakMatches = text.match(lineBreakPattern) || [];
  const lineBreakCount = lineBreakMatches.length;

  // 标点符号（中英文标点）
  const punctuationPattern =
    /[，。、；：？！…—·《》「」『』（）\[\]【】.,;:?!''""""()]/g;
  const punctuationMatches = text.match(punctuationPattern) || [];
  const punctuationCount = punctuationMatches.length;

  // 总字符数
  const totalCount = text.length;

  // 其他字符
  const otherCount =
    totalCount -
    chineseCount -
    englishCount -
    numberCount -
    spaceCount -
    lineBreakCount -
    punctuationCount;

  return {
    total: totalCount,
    chinese: chineseCount,
    english: englishCount,
    number: numberCount,
    space: spaceCount,
    lineBreak: lineBreakCount,
    punctuation: punctuationCount,
    other: otherCount,
  };
});

// 处理文本字符，转换为适合方格纸显示的字符数组
const textChars = computed(() => {
  const text = inputText.value;
  if (!text) return [];

  // 将文本按换行符分割
  const lines = text.split(/\r\n|\r|\n/);
  const result: string[] = [];

  lines.forEach((line, index) => {
    // 添加当前行的所有字符
    const chars = splitChars(
      processDoublePunctuation(convertToChineseText(line))
    ).map((e) => e.text);
    result.push(...chars);

    // 如果不是最后一行，添加行尾标记（用于换行处理）
    if (index < lines.length - 1) {
      result.push("\n");
    }
  });

  return result;
});

const processDoublePunctuation = (text: string) => {
  const result = [];
  let i = 0;
  while (i < text.length) {
    if (i < text.length - 1) {
      const twoChars = text.slice(i, i + 2);
      if (twoChars === "……" || twoChars === "——") {
        result.push(twoChars); // 作为独立元素存入数组
        i += 2;
        continue;
      }
    }
    result.push(text[i]);
    i++;
  }
  return result;
};

const splitChars = (chars: string[]) => {
  const post = new Set(["“", "‘", "《", "（"]); //后置标点
  const pre = new Set(["”", "’", "》", "）"]); //前置标点
  const indep = new Set(["，", "。", "！", "？", "、", "……", "——", "；", "："]); //普通标点

  type Group = {
    word: string;
    beforePun: string;
    afterPun: string;
    text: string;
  };
  const groups: Group[] = [];
  let i = 0;
  while (i < chars.length) {
    const char = chars[i];
    if (isPunSeparate.value) {
      //标点符号单独显示
      groups.push({
        word: char,
        beforePun: "",
        afterPun: "",
        text: char,
      });
      i++;
      continue;
    }
    if (post.has(char)) {
      //后置标点
      const nextChar = chars[i + 1] || "";
      groups.push({
        word: nextChar,
        beforePun: char,
        afterPun: "",
        text: char + nextChar,
      });
      i += 2;
    } else if (pre.has(char) || indep.has(char)) {
      //前置标点
      const beforeChar = chars[i - 1] || "";
      if (!beforeChar) {
        groups.push({
          word: "",
          beforePun: char,
          afterPun: "",
          text: "",
        });
      } else {
        const beforeGroup = groups[groups.length - 1];

        if (beforeGroup.afterPun) {
          groups.push({
            word: char,
            beforePun: "",
            afterPun: "",
            text: char,
          });
        } else {
          beforeGroup.afterPun = char;
          beforeGroup.text += char;
        }
      }
      i++;
    } else {
      // 普通文字
      groups.push({
        word: char,
        beforePun: "",
        afterPun: "",
        text: char,
      });
      i++;
    }
  }
  return groups;
};

const convertToChineseText = (str: string) => {
  let result = "";
  // 状态跟踪：引号类型和方向
  let quoteStack = {
    double: true, // 双引号状态（true=左，false=右）
    single: true, // 单引号状态
  };

  // 需要特殊处理的前后成对标点
  const PAIRS: Record<string, { left: string | null; right: string | null }> = {
    '"': { left: "“", right: "”" },
    "'": { left: "‘", right: "’" },
    "(": { left: "（", right: null },
    ")": { left: null, right: "）" },
    "<": { left: "《", right: null },
    ">": { left: null, right: "》" },
  };

  // 标点直接映射表（无方向性）
  const DIRECT_MAP: Record<string, string> = {
    ",": "，",
    ".": "。",
    "!": "！",
    "?": "？",
    ":": "：",
    ";": "；",
    "~": "～",
    "@": "＠",
    "#": "＃",
    $: "＄",
    "%": "％",
    "&": "＆",
    "=": "＝",
    "+": "＋",
    "\\": "＼",
    "|": "｜",
  };

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    // 处理特殊成对标点
    if (PAIRS[char]) {
      // 处理双引号
      if (char === '"') {
        result += quoteStack.double ? PAIRS[char].left : PAIRS[char].right;
        quoteStack.double = !quoteStack.double;
        continue;
      }

      // 处理单引号
      if (char === "'") {
        result += quoteStack.single ? PAIRS[char].left : PAIRS[char].right;
        quoteStack.single = !quoteStack.single;
        continue;
      }

      // 处理其他成对标点
      result += PAIRS[char].left || PAIRS[char].right;
      continue;
    }

    // 处理直接映射标点
    if (DIRECT_MAP[char]) {
      result += DIRECT_MAP[char];
      continue;
    }

    // 处理破折号（连续两个-）
    if (char === "-") {
      if (i < str.length - 1 && str[i + 1] === "-") {
        result += "——";
        i++; // 跳过下一个字符
        continue;
      }
      result += "－";
      continue;
    }

    // 处理省略号（连续三个.）
    if (char === ".") {
      if (i < str.length - 2 && str[i + 1] === "." && str[i + 2] === ".") {
        result += "……";
        i += 2; // 跳过后两个字符
        continue;
      }
      result += "。";
      continue;
    }

    // 处理空格（全角空格）
    if (char === " ") {
      result += "　";
      continue;
    }
    result += char; // 非英文字符保留
  }

  return result;
};

// 检查滚动位置
const checkScrollPosition = () => {
  const container = scrollContainerRef.value;
  if (!container) return;

  // 检查是否滚动到最右侧
  const scrollLeft = container.scrollLeft;
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;

  // 当滚动到最右侧时，scrollLeft + clientWidth ≈ scrollWidth
  isAtEnd.value = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 1;
};

// 监听canvas渲染
onMounted(() => {
  // 初始化canvasRefs数组
  canvasRefs.value = new Array(totalPages.value).fill(null);

  // 加载保存的设置
  loadSettings();

  nextTick(() => {
    renderCanvases();

    // 添加滚动监听
    if (scrollContainerRef.value) {
      scrollContainerRef.value.addEventListener("scroll", checkScrollPosition);
      // 初始检查
      checkScrollPosition();
    }
  });
});

// 当输入文本、列数或行数变化时重新渲染canvas
const renderCanvases = () => {
  // 确保canvasRefs数组长度与页数相匹配
  if (canvasRefs.value.length !== totalPages.value) {
    canvasRefs.value = new Array(totalPages.value).fill(null);
  }

  nextTick(() => {
    // 等待DOM更新后再渲染
    for (let i = 0; i < canvasRefs.value.length; i++) {
      renderSingleCanvas(i);
    }
  });
};

// 渲染单个Canvas
const renderSingleCanvas = (pageIndex: number) => {
  const canvas = canvasRefs.value[pageIndex];
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 设置canvas尺寸
  canvas.width = Math.round(canvasWidth.value);
  canvas.height = Math.round(canvasHeight.value);

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 添加白色背景
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制方格纸
  drawGridPaper(ctx, pageIndex);

  // 填充文字
  drawText(ctx, pageIndex);
};

const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number
) => {
  // 确保坐标是整数，避免线条渲染模糊
  x1 = Math.floor(x1) + 0.5; // 使用0.5偏移以绘制清晰的1px线条
  y1 = Math.floor(y1) + 0.5;
  x2 = Math.floor(x2) + 0.5;
  y2 = Math.floor(y2) + 0.5;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

// 绘制方格纸格子
const drawGridPaper = (ctx: CanvasRenderingContext2D, pageIndex: number) => {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;

  // 计算当前页的起始格子索引
  const pageStartCellIndex = pageIndex * (columns.value * rows.value);

  // 绘制行和列
  for (let row = 0; row < rows.value; row++) {
    // 每行都有空隙，空隙大小为gridGap
    const topY = row * (cellSize.value + gridGap.value);
    const bottomY = topY + cellSize.value;

    //画横线
    drawLine(ctx, 0, topY, canvasWidth.value, topY, "red", 1);
    drawLine(ctx, 0, bottomY, canvasWidth.value, bottomY, "red", 1);

    //画竖线
    for (let col = 0; col <= columns.value; col++) {
      const leftX = col * cellSize.value;
      // 确保绘制最右边的竖线
      drawLine(ctx, leftX, topY, leftX, bottomY, "red", 1);
    }

    // 在每100格添加标记
    const cellsInRow = columns.value;
    // 考虑页面偏移
    const currentCellCount = pageStartCellIndex + (row + 1) * cellsInRow;
    const previousCellCount = pageStartCellIndex + row * cellsInRow;

    // 检查这一行是否跨越了100的倍数
    for (let n = 1; n <= 10; n++) {
      // 支持到1000格
      const markPoint = n * 100;
      if (previousCellCount < markPoint && currentCellCount >= markPoint) {
        // 计算100字标记在当前行中的位置
        const position = markPoint - previousCellCount;

        // 计算标记的坐标（放在当前行底部的空隙中）
        const markX = position * cellSize.value - cellSize.value / 2;
        const markY = bottomY + gridGap.value / 2;

        if (markX > 0 && markX < canvasWidth.value) {
          // 绘制标记
          ctx.fillStyle = "#a8aaaf"; // 使用灰色
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${markPoint}▲`, markX, markY);
        }
      }
    }
  }

  // 绘制页码
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(
    `第 ${pageIndex + 1} 页 / 共 ${totalPages.value} 页`,
    canvasWidth.value / 2,
    canvasHeight.value - 2
  );
};

// 填充文字到方格纸
const drawText = (ctx: CanvasRenderingContext2D, pageIndex: number) => {
  const fontSize = Math.floor(cellSize.value * 0.5);
  ctx.fillStyle = "#000";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const pageChars = pagesData.value[pageIndex] || [];
  let currentRow = 0;
  let currentCol = 0;

  for (let i = 0; i < pageChars.length; i++) {
    // 检查是否是换行符
    if (pageChars[i] === "\n") {
      // 移动到下一行开始位置
      currentRow++;
      currentCol = 0;
      continue;
    }

    // 检查当前列是否超出了列数限制，如果是，换到下一行
    if (currentCol >= columns.value) {
      currentRow++;
      currentCol = 0;
    }

    // 计算字符坐标（考虑每行都有空隙）
    const y =
      currentRow * (cellSize.value + gridGap.value) + cellSize.value / 2;
    const x = currentCol * cellSize.value + cellSize.value / 2; // 修正：加上cellSize/2使文字在格子中居中
    if (pageChars[i].length < 2) {
      // 绘制字符
      ctx.fillText(pageChars[i], x, y);
      // 更新列位置
      currentCol++;
    } else {
      // 处理两个字符的组合
      const post = new Set(["“", "‘", "《", "（"]); //后置标点
      const pre = new Set(["”", "’", "》", "）"]); //前置标点
      const indep = new Set([
        "，",
        "。",
        "！",
        "？",
        "、",
        "……",
        "——",
        "；",
        "：",
      ]); //普通标点
      const specialPun = new Set(["《", "》", "（", "）", "、", "……", "——"]);
      const [first, second] = pageChars[i].split("");
      //判断哪个是标点符号
      const firstIsPun = post.has(first) || pre.has(first) || indep.has(first);
      const word = firstIsPun ? second : first;
      const pun = firstIsPun ? first : second;
      const isSpecialPun = specialPun.has(pun);
      const span = calcRef.value;
      let punWidth = 0;
      if (span) {
        span.textContent = pun;
        punWidth = span.offsetWidth > 6 ? 0 : span.offsetWidth;
      }

      ctx.fillText(word, x, y);
      // 绘制标点符号
      const transX = firstIsPun
        ? -cellSize.value / 2 + punWidth
        : cellSize.value / 2 - punWidth / 2;

      const punX = x + transX;
      // const punX = x + (firstIsPun ? -punWidth : punWidth);
      ctx.fillText(pun, punX, y);
      // 更新列位置
      currentCol++;
    }
  }
};

// 重新渲染方格纸
const refreshGridPaper = () => {
  nextTick(() => {
    renderCanvases();
  });
};

// 复制统计结果
const copyStatistics = async () => {
  const stats = statistics.value;
  const result = `总字符数: ${stats.total}
汉字数: ${stats.chinese}
英文字母: ${stats.english}
数字: ${stats.number}
空格: ${stats.space}
换行符: ${stats.lineBreak}
标点符号: ${stats.punctuation}
其他字符: ${stats.other}`;

  try {
    await navigator.clipboard.writeText(result);
    message.success("统计结果已复制到剪贴板");
  } catch (err) {
    message.error("复制失败");
  }
};

// 清空输入框
const clearInput = () => {
  inputText.value = "";
  renderCanvases();
};

// 导出为图片
const exportImage = async () => {
  if (canvasRefs.value.length === 0) return;

  try {
    // 如果只有一页，直接导出
    if (totalPages.value === 1) {
      const link = document.createElement("a");
      link.download = "方格纸.png";
      link.href = canvasRefs.value[0]?.toDataURL("image/png") || "";
      link.click();
      message.success("方格纸导出成功");
      return;
    }

    // 多页情况，创建一个ZIP文件
    message.info("正在打包多页方格纸...");

    const zip = new JSZip();
    const imgFolder = zip.folder("方格纸图片");

    // 添加所有页面到zip文件
    const promises = [];

    for (let i = 0; i < canvasRefs.value.length; i++) {
      const canvas = canvasRefs.value[i];
      if (!canvas) continue;

      // 获取图片数据
      const imgData = canvas
        .toDataURL("image/png")
        .replace(/^data:image\/(png|jpg);base64,/, "");

      // 添加到zip文件
      if (imgFolder) {
        imgFolder.file(`方格纸_第${i + 1}页.png`, imgData, { base64: true });
      }
    }

    // 生成并下载zip文件
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "方格纸导出.zip");
      message.success(`成功打包导出 ${canvasRefs.value.length} 页方格纸`);
    });
  } catch (err) {
    message.error(`导出失败: ${err}`);
  }
};

// 保存配置到本地存储
const saveSettings = () => {
  try {
    const settings = {
      columns: columns.value,
      rows: rows.value,
      cellSize: cellSize.value,
      gridGap: gridGap.value,
      showLineNumbers: showLineNumbers.value,
      pageGap: pageGap.value,
      isPunSeparate: isPunSeparate.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("保存配置失败:", error);
  }
};

// 从本地存储加载配置
const loadSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEY);
    if (settings) {
      const parsedSettings = JSON.parse(settings);

      // 应用保存的设置到当前状态
      columns.value = parsedSettings.columns || 20;
      rows.value = parsedSettings.rows || 20;
      cellSize.value = parsedSettings.cellSize || 30;
      gridGap.value = parsedSettings.gridGap || 14;
      showLineNumbers.value =
        parsedSettings.showLineNumbers !== undefined
          ? parsedSettings.showLineNumbers
          : true;
      pageGap.value = parsedSettings.pageGap || 30;
      isPunSeparate.value =
        parsedSettings.isPunSeparate !== undefined
          ? parsedSettings.isPunSeparate
          : true;

      message.success("已恢复您的方格纸设置");
    }
  } catch (error) {
    console.error("读取配置失败:", error);
  }
};

// 应用设置并关闭弹窗
const applySettings = () => {
  showSettingsModal.value = false;
  // 设置已经是响应式的，自动会触发重新渲染
  saveSettings(); // 保存设置到本地存储
  message.success("方格纸设置已更新");
};

// 监听文本变化重新渲染
watch(
  [inputText, columns, rows, cellSize, gridGap, showLineNumbers, isPunSeparate],
  () => {
    nextTick(() => {
      renderCanvases();
    });
  }
);

// 监听配置变化保存到本地存储
watch(
  [columns, rows, cellSize, gridGap, showLineNumbers, pageGap, isPunSeparate],
  () => {
    saveSettings();
  }
);

// 监听总页数变化，确保canvasRefs数组长度与页数相匹配
watch(totalPages, () => {
  // 当页数变化时，确保canvasRefs数组被重置
  canvasRefs.value = new Array(totalPages.value).fill(null);
  nextTick(() => {
    renderCanvases();
  });
});
</script>

<template>
  <div class="tool-page">
    <NCard>
      <div class="input-area">
        <div class="section-title">请输入要统计的文本：</div>
        <NInput
          clearable
          v-model:value="inputText"
          type="textarea"
          placeholder="请输入文本内容..."
          :autosize="{ minRows: 6, maxRows: 10 }"
        />
      </div>

      <!-- 统计结果部分 - 移到输入框下方 -->
      <div v-if="inputText" class="result-section">
        <div class="result-header">
          <h3 class="result-title">文本字符统计</h3>
          <NButton size="tiny" @click="copyStatistics" :disabled="!inputText">
            <template #icon>
              <div class="button-icon">📋</div>
            </template>
            复制统计结果
          </NButton>
        </div>

        <div class="result-area">
          <NGrid :cols="8" :x-gap="8" :y-gap="8">
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="总字符数" :value="statistics.total" />
              </NCard>
            </NGridItem>
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="汉字数" :value="statistics.chinese" />
              </NCard>
            </NGridItem>
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="英文字母" :value="statistics.english" />
              </NCard>
            </NGridItem>
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="数字" :value="statistics.number" />
              </NCard>
            </NGridItem>
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="空格" :value="statistics.space" />
              </NCard>
            </NGridItem>
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="换行符" :value="statistics.lineBreak" />
              </NCard>
            </NGridItem>
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="标点符号" :value="statistics.punctuation" />
              </NCard>
            </NGridItem>
            <NGridItem>
              <NCard size="small" class="stat-card">
                <NStatistic label="其他字符" :value="statistics.other" />
              </NCard>
            </NGridItem>
          </NGrid>
        </div>
      </div>

      <NDivider>方格纸预览</NDivider>

      <div class="preview-header">
        <div class="page-info">
          总页数: {{ totalPages }} | 每页字符数: {{ pageSize }}
          <span v-if="totalPages > 1" class="scroll-hint"
            >← 左右滚动查看所有页面 →</span
          >
        </div>
        <div class="preview-actions">
          <NButton size="small" @click="exportImage" :disabled="!inputText">
            <template #icon>
              <div class="button-icon">📥</div>
            </template>
            导出图片
          </NButton>
          <NButton size="small" @click="showSettingsModal = true">
            <template #icon>
              <div class="settings-icon">⚙️</div>
            </template>
            方格纸设置
          </NButton>
        </div>
      </div>

      <div
        class="canvas-container"
        ref="scrollContainerRef"
        :class="{ end: isAtEnd }"
      >
        <div
          class="canvas-wrapper"
          style="white-space: nowrap; min-width: 100%"
        >
          <div
            v-for="(_, index) in Array(totalPages)"
            :key="index"
            class="canvas-page"
            :style="{
              display: 'inline-block',
              marginRight: index < totalPages - 1 ? pageGap + 'px' : '0',
            }"
          >
            <canvas
              :ref="el => { canvasRefs[index] = el as HTMLCanvasElement }"
            ></canvas>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 方格纸设置弹窗 -->
    <NModal
      v-model:show="showSettingsModal"
      title="方格纸设置"
      preset="card"
      style="width: 500px"
      :mask-closable="true"
    >
      <div class="grid-settings">
        <NSpace vertical>
          <div class="setting-item">
            <span class="setting-label">标点符号:</span>
            <NSwitch v-model:value="isPunSeparate">
              <template #checked>
                <span>单独展示</span>
              </template>
              <template #unchecked>
                <span>合并展示</span>
              </template>
            </NSwitch>
          </div>
          <div class="setting-item">
            <span class="setting-label">列数:</span>
            <NSlider
              v-model:value="columns"
              :min="10"
              :max="40"
              :step="1"
              style="width: 200px"
            />
            <span class="setting-value">{{ columns }}</span>
          </div>

          <div class="setting-item">
            <span class="setting-label">行数:</span>
            <NSlider
              v-model:value="rows"
              :min="5"
              :max="30"
              :step="1"
              style="width: 200px"
            />
            <span class="setting-value">{{ rows }}</span>
          </div>

          <div class="setting-item">
            <span class="setting-label">格子大小:</span>
            <NSlider
              v-model:value="cellSize"
              :min="16"
              :max="40"
              :step="1"
              style="width: 200px"
            />
            <span class="setting-value">{{ cellSize }}px</span>
          </div>

          <div class="setting-item">
            <span class="setting-label">行间距:</span>
            <NSlider
              v-model:value="gridGap"
              :min="10"
              :max="30"
              :step="2"
              style="width: 200px"
            />
            <span class="setting-value">{{ gridGap }}px</span>
          </div>

          <div class="setting-item">
            <span class="setting-label">页间距:</span>
            <NSlider
              v-model:value="pageGap"
              :min="10"
              :max="60"
              :step="5"
              style="width: 200px"
            />
            <span class="setting-value">{{ pageGap }}px</span>
          </div>
        </NSpace>
      </div>

      <template #footer>
        <div class="modal-footer">
          <NButton @click="showSettingsModal = false">关闭</NButton>
          <NButton type="primary" @click="applySettings">应用设置</NButton>
        </div>
      </template>
    </NModal>
    <span id="calc" ref="calcRef" class="hide"></span>
  </div>
</template>

<style scoped lang="scss">
.tool-page {
  // max-width: 1200px;
  margin: 0 auto;
  .hide {
    position: absolute;
    left: -99999px;
    top: -90999px; /* 不占据空间，无法点击 */
  }
}

.input-area {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color);
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  justify-content: flex-end;
}

.result-section {
  margin: 10px 0;
  padding-top: 5px;
  border-top: 1px dashed #eee;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .button-icon {
    margin-right: 2px;
    font-size: 12px;
  }
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--n-text-color);
  margin: 0;
}

.result-area {
  .stat-card {
    padding: 8px 4px;

    :deep(.n-statistic) {
      line-height: 1.2;

      .n-statistic__label {
        font-size: 12px;
        margin-bottom: 2px;
      }

      .n-statistic__value {
        font-size: 14px;
      }
    }
  }

  .n-card {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

.grid-settings {
  .setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .setting-label {
      width: 120px;
      text-align: right;
      margin-right: 12px;
    }

    .setting-value {
      margin-left: 12px;
      width: 40px;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.page-info {
  margin-bottom: 10px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .scroll-hint {
    color: #2080f0;
    font-size: 12px;
    animation: pulse 2s infinite;
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .settings-icon,
  .button-icon {
    margin-right: 4px;
    font-size: 14px;
  }

  .preview-actions {
    display: flex;
    gap: 8px;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.canvas-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  border-bottom: 1px solid #eee; /* 添加底部边框提示可滚动 */
  position: relative;

  /* 添加渐变边缘效果，提示可滚动 */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 8px;
    width: 30px;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.8)
    );
    pointer-events: none;
    opacity: 0.8;
  }

  /* 隐藏渐变效果，当无法再向右滚动时 */
  &.end::after {
    display: none;
  }

  /* Webkit滚动条样式 */
  &::-webkit-scrollbar {
    height: 8px;
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d0d0d0;
    border-radius: 4px;

    &:hover {
      background-color: #aaa;
    }
  }

  /* Firefox滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 #f5f5f5;

  .canvas-wrapper {
    display: inline-flex;
    min-width: min-content;

    .canvas-page {
      flex: 0 0 auto;
      canvas {
        padding: 2px;
        // border: 1px solid #eee;
        display: block;
      }
    }
  }
}
</style>
