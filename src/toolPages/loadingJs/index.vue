<template>
  <div class="js-executor-container">
    <n-card class="editor-section" title="代码执行器" size="large">
      <n-input
        v-model:value="cdnLinks"
        type="textarea"
        placeholder="在这里输入CDN链接，多个链接请用逗号或换行分隔，如：https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
        rows="3"
      />
      <n-input
        v-model:value="code"
        type="textarea"
        placeholder="在这里输入你的 JS 代码"
        rows="14"
        style="margin-top: 10px"
      />
      <n-space style="margin-top: 10px">
        <n-button @click="executeCode" type="primary">调试预览</n-button>
        <n-button @click="insertExample">举个例子</n-button>
        <n-button @click="insertCdnExample">CDN例子</n-button>
        <n-button @click="clearCode" type="error">清空</n-button>
        <n-button @click="copyCode">复制</n-button>
      </n-space>
    </n-card>

    <n-card class="result-section" title="执行结果" size="large">
      <div class="result-container">
        <div v-html="executionResult"></div>
      </div>
      <template #footer>
        <div style="justify-content: flex-end; display: flex; gap: 5px">
          <n-button @click="copyExecutionResult">复制结果</n-button>
          <n-button @click="clearResult" type="default">清空结果</n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { NCard, NInput, NButton, NSpace, useMessage } from "naive-ui";

const code = ref(``);
const cdnLinks = ref("");
const message = useMessage();
const executionResult = ref("");

const executeCode = async () => {
  executionResult.value = '<span class="log-system">执行中...</span>\n';
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  const win = iframe.contentWindow as any;
  const doc = iframe.contentDocument as Document;

  if (win) {
    // 重置 logOutput
    win.console.logOutput = "";

    // 重写 iframe 中的 console 方法
    win.console.log = function (...args: any[]) {
      const formattedArgs = args.map((arg) => {
        if (arg === null) return '<span class="log-null">null</span>';
        if (arg === undefined)
          return '<span class="log-undefined">undefined</span>';

        if (typeof arg === "object") {
          try {
            const json = JSON.stringify(arg, null, 2);
            return (
              '<span class="log-object">' +
              json.replace(/(".*?"): /g, '<span class="log-key">$1</span>: ') +
              "</span>"
            );
          } catch (e) {
            return String(arg);
          }
        }

        if (typeof arg === "string")
          return '<span class="log-string">"' + arg + '"</span>';
        if (typeof arg === "number")
          return '<span class="log-number">' + arg + "</span>";
        if (typeof arg === "boolean")
          return '<span class="log-boolean">' + arg + "</span>";

        return String(arg);
      });
      win.console.logOutput += formattedArgs.join(" ") + "\n";
    };

    // 添加console.error支持
    win.console.error = function (...args: any[]) {
      win.console.logOutput +=
        '<span class="log-error">Error: ' + args.join(" ") + "</span>\n";
    };

    // 添加console.warn支持
    win.console.warn = function (...args: any[]) {
      win.console.logOutput +=
        '<span class="log-warning">Warning: ' + args.join(" ") + "</span>\n";
    };

    // 添加console.info支持
    win.console.info = function (...args: any[]) {
      win.console.logOutput +=
        '<span class="log-info">Info: ' + args.join(" ") + "</span>\n";
    };

    let hasError = false;
    // 加载CDN
    if (cdnLinks.value.trim()) {
      executionResult.value =
        '<span class="log-system">正在加载CDN库...</span>\n';
      const links = cdnLinks.value
        .replace(/\n/g, ",")
        .split(",")
        .map((link) => link.trim())
        .filter((link) => link);

      // 等待所有CDN加载完成
      try {
        await Promise.all(
          links.map((link) => {
            return new Promise<void>((resolve, reject) => {
              const script = doc.createElement("script");
              script.src = link;
              script.onload = () => {
                executionResult.value +=
                  '<span class="log-success">✅ 已加载:</span> <span class="log-url">' +
                  link +
                  "</span>\n";
                resolve();
              };
              script.onerror = () => {
                executionResult.value +=
                  '<span class="log-error">❌ 加载失败:</span> <span class="log-url">' +
                  link +
                  "</span>\n";
                hasError = true;
                reject(new Error(`加载 ${link} 失败`));
              };
              doc.head.appendChild(script);
            });
          })
        ).catch((error) => {
          console.error("CDN加载错误:", error);
        });
      } catch (error) {
        console.error("加载CDN时出错:", error);
      }
    }

    if (!hasError) {
      // 执行代码
      try {
        executionResult.value +=
          '\n<span class="log-section">--- 执行结果 ---</span>\n';
        win.eval(code.value);
        if (!win.console.logOutput) {
          executionResult.value +=
            '<span class="log-empty">代码执行完成，没有输出。</span>';
        } else {
          executionResult.value += win.console.logOutput;
        }
      } catch (error) {
        executionResult.value +=
          '<span class="log-error">代码执行错误: ' + error + "</span>";
      }
    }
  } else {
    message.error("允许弹出窗口。");
  }

  document.body.removeChild(iframe);
};

// 举个例子功能
const insertExample = () => {
  code.value = `for (var i = 1; i <= 10; i++) {
    console.log("例子: " + i)
  };`;
  message.success("示例代码已插入。");
};

// CDN例子功能
const insertCdnExample = () => {
  cdnLinks.value = `https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js,
https://cdn.jsdelivr.net/npm/axios@1.4.0/dist/axios.min.js,
https://cdn.jsdelivr.net/npm/echarts@5.4.2/dist/echarts.min.js,
https://cdn.jsdelivr.net/npm/dayjs@1.11.7/dayjs.min.js`;

  code.value = `// 综合实例：展示多种库的用法与不同输出类型
console.log('🚀 开始执行综合示例...');

// ---------- 1. 基础数据类型 ----------
console.log('--- 基础数据类型展示 ---');
const number = 42;
const string = '这是一个字符串';
const boolean = true;
const nullValue = null;
const undefinedValue = undefined;

console.log('数字:', number);
console.log('字符串:', string);
console.log('布尔值:', boolean);
console.log('空值:', nullValue);
console.log('未定义:', undefinedValue);

// ---------- 2. 复杂数据类型 ----------
console.log('\\n--- 复杂数据类型展示 ---');
const array = [1, 2, 3, '四', '五', { name: '数组中的对象' }];
const object = {
  name: '张三',
  age: 28,
  isActive: true,
  skills: ['JavaScript', 'Vue', 'React'],
  address: {
    city: '北京',
    district: '海淀区'
  }
};

console.log('数组:', array);
console.log('对象:', object);

// ---------- 3. 不同日志级别 ----------
console.log('\\n--- 不同日志级别展示 ---');
console.log('这是普通日志');
console.info('这是信息日志');
console.warn('这是警告日志');
console.error('这是错误日志');

// ---------- 4. Lodash 示例 ----------
console.log('\\n--- Lodash 示例 ---');
// 数组处理
const numbers = [10, 5, 100, 2, 1000];
console.log('原始数组:', numbers);
console.log('数组排序:', _.sortBy(numbers));
console.log('数组最大值:', _.max(numbers));
console.log('数组求和:', _.sum(numbers));

// 对象处理
const user = { name: '李四', age: 30 };
const defaults = { name: '默认用户', age: 25, gender: '未知' };
console.log('合并对象:', _.merge({}, defaults, user));
console.log('挑选属性:', _.pick(object, ['name', 'age']));

// 函数处理
const greet = (name) => \`你好, \${name}!\`;
const greetLoudly = _.wrap(greet, function(func, name) {
  return func(name).toUpperCase();
});
console.log('函数包装结果:', greetLoudly('世界'));

// ---------- 5. DayJS 示例 ----------
console.log('\\n--- DayJS 示例 ---');
const now = dayjs();
console.log('当前日期:', now.format('YYYY-MM-DD HH:mm:ss'));
console.log('30天后:', now.add(30, 'day').format('YYYY-MM-DD'));
console.log('上个月:', now.subtract(1, 'month').format('YYYY-MM-DD'));

// ---------- 6. Axios 示例 (模拟) ----------
console.log('\\n--- Axios 示例 (模拟) ---');
console.log('发起请求: GET https://jsonplaceholder.typicode.com/todos/1');
// 实际发送请求会遇到跨域问题，这里仅演示，不真正发送
const mockResponse = {
  userId: 1,
  id: 1,
  title: '完成示例代码',
  completed: false
};
console.log('模拟响应数据:', mockResponse);

// ---------- 7. ECharts 配置示例 ----------
console.log('\\n--- ECharts 配置示例 ---');
const option = {
  title: {
    text: '示例图表'
  },
  tooltip: {},
  legend: {
    data: ['销量']
  },
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [{
    name: '销量',
    type: 'bar',
    data: [5, 20, 36, 10, 10, 20]
  }]
};
console.log('ECharts配置:', option);

// ---------- 8. 异常处理 ----------
console.log('\\n--- 异常处理示例 ---');
try {
  // 故意制造错误
  const a = {};
  console.log('尝试访问未定义的方法...');
  a.nonExistentMethod();
} catch (error) {
  console.error('捕获到错误:', error.message);
}

console.log('🎉 代码执行完毕!');`;

  message.success("综合示例已插入，展示了多种库的用法与不同输出类型");
};

// 清空功能
const clearCode = () => {
  code.value = "";
  cdnLinks.value = "";
  message.info("代码已清空。");
};

// 清空结果
const clearResult = () => {
  executionResult.value = "";
  message.info("执行结果已清空。");
};

// 复制功能
const copyCode = () => {
  navigator.clipboard
    .writeText(code.value)
    .then(() => {
      message.success("代码已复制到剪贴板");
    })
    .catch(() => {
      message.error("复制失败");
    });
};

// 复制执行结果功能
const copyExecutionResult = () => {
  navigator.clipboard
    .writeText(executionResult.value)
    .then(() => {
      message.success("执行结果已复制到剪贴板");
    })
    .catch(() => {
      message.error("复制失败");
    });
};
</script>

<style lang="scss" scoped>
.js-executor-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 150px);
  min-height: 500px;
  width: 100%;

  .editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.n-card__content) {
      flex: 1;
      display: flex;
      flex-direction: column;

      .n-input {
        &:nth-child(2) {
          flex: 1;
        }
      }
    }
  }

  .result-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 50%;

    :deep(.n-card__content) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden; // 防止卡片内容溢出
    }

    .result-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: auto;
      background: #1e1e1e;
      color: #ffffff;
      border-radius: 4px;
      padding: 12px;
      font-family: "Monaco", "Consolas", monospace;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      box-sizing: border-box;

      :deep(.log-string) {
        color: #ce9178;
      }

      :deep(.log-number) {
        color: #b5cea8;
      }

      :deep(.log-boolean) {
        color: #569cd6;
      }

      :deep(.log-null),
      :deep(.log-undefined) {
        color: #569cd6;
        font-style: italic;
      }

      :deep(.log-object) {
        color: #9cdcfe;
      }

      :deep(.log-key) {
        color: #9cdcfe;
      }

      :deep(.log-error) {
        color: #f14c4c;
        font-weight: bold;
      }

      :deep(.log-warning) {
        color: #ff9e3b;
      }

      :deep(.log-info) {
        color: #3794ff;
      }

      :deep(.log-success) {
        color: #4ec9b0;
        font-weight: bold;
      }

      :deep(.log-system) {
        color: #c586c0;
        font-style: italic;
      }

      :deep(.log-empty) {
        color: #969696;
        font-style: italic;
      }

      :deep(.log-section) {
        color: #dcdcaa;
        font-weight: bold;
        border-bottom: 1px solid #565656;
        padding-bottom: 3px;
      }

      :deep(.log-url) {
        color: #4ec9b0;
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 768px) {
  .js-executor-container {
    flex-direction: column;

    .editor-section,
    .result-section {
      max-width: 100%;
    }
  }
}
</style>
