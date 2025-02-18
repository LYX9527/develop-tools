<script setup lang="ts">
import {ImageOutline} from "@vicons/ionicons5"
import {NIcon, NInput, NButton, NTag, NInputNumber, NSlider, useMessage, useNotification} from "naive-ui"
import {reactive, ref, watch, onMounted, type CSSProperties, toRaw} from "vue";

const message = useMessage()
const notification = useNotification()
const WaterMarkMagnification = 2

enum FontStyleEnum {
  Italic = "italic",//倾斜
  Bold = "bold",//加粗
  Underline = "underline",
  StrikeThrough = "line-through"
}

type WatermarkConfig = {
  content: string; // 水印文字内容
  fontSize: number; // 文字大小
  fontStyle: FontStyleEnum[]; // 字体样式，例如 'normal', 'italic', 'bold'
  fontColor: string; // 文字颜色
  rotation: number; // 旋转角度
  needTiled: boolean; // 平铺
  tiledMarginX: number; //平铺的X轴边距
  tiledMarginY: number;//平铺的Y轴边距
  xOffset: number; //x偏移
  yOffset: number; //y偏移
};
const defaultWatermarkConfig: WatermarkConfig = {
  content: "水印内容",
  fontSize: 40,
  fontStyle: [],
  fontColor: "#000000",
  rotation: 30,
  needTiled: true,
  tiledMarginX: 30,
  tiledMarginY: 30,
  xOffset: 0,
  yOffset: 0,
};
const imgFile = ref<File | null>(null);
const imgUrl = ref<string | null>(null);
const imageSelectRef = ref<HTMLInputElement | null>(null)
const imageResultRef = ref<HTMLDivElement | null>(null)
const nowHasImgDrop = ref(false)

const image = ref<HTMLImageElement | null>(null)
const imageCanvasRef = ref<HTMLCanvasElement | null>(null)
const watermarkCanvasRef = ref<HTMLCanvasElement | null>(null)
const watermarkCanvasContext = ref<CanvasRenderingContext2D | null>(null)
const customWatermarkConfig = reactive<WatermarkConfig>(defaultWatermarkConfig)
const downloadLoading = ref(false)

function downloadNewImage() {
  downloadLoading.value=true
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!!;
  canvas.width = imageCanvasRef.value!!.width;
  canvas.height = imageCanvasRef.value!!.height;
  ctx.drawImage(imageCanvasRef.value!!, 0, 0);
  ctx.drawImage(watermarkCanvasRef.value!!, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'img.png';
  downloadLoading.value=false
  link.click();
}

function clearImage() {
  imgFile.value = null
  image.value = null
  imgUrl.value = null
  const selectDom: HTMLInputElement | null = imageSelectRef.value
  if (selectDom) {
    selectDom.value = ""
  }
}

function adjustWatermarkConfig(): WatermarkConfig {
  return {
    fontSize: customWatermarkConfig.fontSize * WaterMarkMagnification,
    tiledMarginX: customWatermarkConfig.tiledMarginX * WaterMarkMagnification,
    tiledMarginY: customWatermarkConfig.tiledMarginY * WaterMarkMagnification,
    xOffset: customWatermarkConfig.xOffset * WaterMarkMagnification,
    yOffset: customWatermarkConfig.yOffset * WaterMarkMagnification,
    content: customWatermarkConfig.content,
    rotation: customWatermarkConfig.rotation * WaterMarkMagnification,
    fontColor: customWatermarkConfig.fontColor,
    fontStyle: customWatermarkConfig.fontStyle,
    needTiled: customWatermarkConfig.needTiled,
  }
}

function updateWatermark() {
  const canvasCtx: CanvasRenderingContext2D = watermarkCanvasContext.value!!;
  const canvasWidth = canvasCtx.canvas.width;
  const canvasHeight = canvasCtx.canvas.height;
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight); // 清除画布
  if (customWatermarkConfig.content == "") {
    return
  }
  const watermarkConfig = adjustWatermarkConfig()
  const {fontSize, tiledMarginX, tiledMarginY, xOffset, yOffset, content, rotation, fontColor} = watermarkConfig
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  let fontStyle = ""
  if (watermarkConfig.fontStyle.includes(FontStyleEnum.Italic)) {
    fontStyle += `${FontStyleEnum.Italic} `
  }
  if (watermarkConfig.fontStyle.includes(FontStyleEnum.Bold)) {
    fontStyle += `${FontStyleEnum.Bold} `
  }
  canvasCtx.font = `${fontStyle} ${fontSize}px Verdana`;
  canvasCtx.textBaseline = 'middle';
  canvasCtx.textAlign = 'center';
  canvasCtx.fillStyle = fontColor;
  canvasCtx.save();
  const textWidth = canvasCtx.measureText(content).width
  //单文字渲染
  if (!watermarkConfig.needTiled) {
    canvasCtx.translate(centerX + xOffset, centerY + yOffset);
    canvasCtx.rotate(rotation * Math.PI / 180);
    canvasCtx.fillText(content, 0, 0);
    if (watermarkConfig.fontStyle.includes(FontStyleEnum.Underline)) {
      drawTextUnderline(canvasCtx, fontSize, fontColor, 0, 0, textWidth)
    }
    if (watermarkConfig.fontStyle.includes(FontStyleEnum.StrikeThrough)) {
      drawTextStrikeThrough(canvasCtx, fontColor, 0, 0, textWidth)
    }
    canvasCtx.restore();
    return
  }
  //平铺模式
  canvasCtx.translate(centerX, centerY);
  canvasCtx.rotate(rotation * Math.PI / 180)
  canvasCtx.translate(-centerX, -centerY);
  for (let y = -canvasHeight; y <= canvasHeight * 2; y += fontSize + tiledMarginY) {
    for (let x = -canvasWidth; x <= canvasWidth * 2; x += textWidth + tiledMarginX) {
      const textX = x + xOffset
      const textY = y + yOffset
      canvasCtx.fillText(content, textX, textY);
      if (watermarkConfig.fontStyle.includes(FontStyleEnum.Underline)) {
        drawTextUnderline(canvasCtx, fontSize, fontColor, textX, textY, textWidth)
      }
      if (watermarkConfig.fontStyle.includes(FontStyleEnum.StrikeThrough)) {
        drawTextStrikeThrough(canvasCtx, fontColor, textX, textY, textWidth)
      }
    }
  }
  canvasCtx.restore();
}

function drawTextUnderline(canvasCtx: CanvasRenderingContext2D, fontSize: number, fontColor: string, textX: number, textY: number, textWidth: number) {
  canvasCtx.beginPath();
  canvasCtx.moveTo(textX - textWidth / 2, textY + fontSize / 2);
  canvasCtx.lineTo(textX + textWidth / 2, textY + fontSize / 2);
  canvasCtx.strokeStyle = fontColor;
  canvasCtx.lineWidth = 8;
  canvasCtx.stroke();
}

function drawTextStrikeThrough(canvasCtx: CanvasRenderingContext2D, fontColor: string, textX: number, textY: number, textWidth: number) {
  canvasCtx.beginPath();
  canvasCtx.moveTo(textX - textWidth / 2, textY);
  canvasCtx.lineTo(textX + textWidth / 2, textY);
  canvasCtx.strokeStyle = fontColor;
  canvasCtx.lineWidth = 8;
  canvasCtx.stroke();
}

function renderImage(fileReader: FileReader) {
  if (!imgFile.value) {
    message.warning("请先选择图片！")
    return
  }
  if (!imageCanvasRef.value) {
    message.warning("canvas不存在！")
    return
  }
  const canvas: HTMLCanvasElement = imageCanvasRef.value!!
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) {
    message.warning("图片渲染画布上下文为空")
    return
  }
  const img = new Image();
  img.src = fileReader.result as string;
  img.onload = () => {
    image.value = img
    const watermarkCanvasCtx: CanvasRenderingContext2D = watermarkCanvasContext.value!!;
    canvasContext.canvas.width = img.width;
    canvasContext.canvas.height = img.height;
    watermarkCanvasCtx.canvas.width = img.width * WaterMarkMagnification;
    watermarkCanvasCtx.canvas.height = img.height * WaterMarkMagnification;
    canvasContext.drawImage(img, 0, 0)
    updateWatermark()
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (!nowHasImgDrop.value) {
    nowHasImgDrop.value = true
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  nowHasImgDrop.value = false
  try {
    imgFile.value = checkImage(event.dataTransfer?.files[0])
  } catch (e: any) {
    message.warning(e.message)
  }
}

function checkImage(file: File | undefined): File {
  if (!file) {
    throw new Error("没有图片选择")

  }
  if (file.type.startsWith("image/")) {
    return file
  } else {
    throw new Error("选择的文件不是图片")
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  nowHasImgDrop.value = false
}

function handleImageSelect() {
  if (!imageSelectRef.value) {
    message.warning("不存在的图片选择组件！")
    return
  }
  imageSelectRef.value.click()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

function handleFileChange() {
  try {
    imgFile.value = checkImage(imageSelectRef.value?.files?.[0])
  } catch (e: any) {
    message.warning(e.message)
  }
}

watch(imgFile, (newFile: File | null) => {
  if (!newFile) return
  notification.info({
    title: "图片选择成功",
    description: `图片名：${newFile.name}`,
    meta: `文件大小：${formatFileSize(newFile.size)}`,
    duration: 2500,
  })
  const reader = new FileReader();
  reader.onload = (e) => {
    imgUrl.value = e.target?.result as string
    renderImage(e.target!!)
  };
  reader.readAsDataURL(newFile);
})
watch(customWatermarkConfig, (newConfig: WatermarkConfig) => {
  if (imgUrl.value) {
    updateWatermark()
  }
})
onMounted(() => {
  watermarkCanvasContext.value = watermarkCanvasRef.value!!.getContext("2d")
  // const canvasCtx: CanvasRenderingContext2D = watermarkCanvasContext.value!!;
  // const canvasWidth = canvasCtx.canvas.width * 4;
  // const canvasHeight = canvasCtx.canvas.height * 4;
  // canvasCtx.canvas.width = canvasWidth;
  // canvasCtx.canvas.height = canvasHeight;
})

</script>

<template>
  <input ref="imageSelectRef" type="file" style="display: none" @change="handleFileChange" accept="image/*">
  <n-spin :show="downloadLoading">
    <template #description>
      正在渲染图片下载
    </template>
    <div class="tool-view">
      <div class="image-preview" :class="{'image-preview-has-drop':nowHasImgDrop}" @dragover="handleDragOver"
           @dragleave="handleDragLeave" @drop="handleDrop"
           @click="handleImageSelect">
        <div v-if="imgUrl" class="image-box">
          <img class="image" :src="imgUrl!!" alt="图片"/>
          <transition name="fade">
            <div v-show="nowHasImgDrop" class="img-drop-change-tip">
              拖拽图片到此处替换当前图片
            </div>
          </transition>
        </div>
        <div v-else class="image-select-tip content-tip-box">
          <NIcon size="50" :component="ImageOutline"/>
          <p class="tip-content">点击或则拖拽图片到此区域上传</p>
          <p class="tip-supplement">图片不会上传到服务器，这是一个完全离线的工具，请放心上传图片内容</p>
          <p></p>
        </div>
      </div>
      <div class="custom-watermark">
        <n-form
            :model="customWatermarkConfig"
            :disabled="imgUrl==null"
            label-placement="left"
            require-mark-placement="right-hanging">
          <n-form-item label="水印内容">
            <n-input v-model:value="customWatermarkConfig.content" placeholder="输入水印内容"/>
          </n-form-item>
          <n-form-item label="基础样式">
            <div style="display: flex;gap: 10px;width: 100%;align-items: center">
              <n-input-number style="flex: 1" :min="1" v-model:value="customWatermarkConfig.fontSize">
                <template #suffix>
                  px
                </template>
              </n-input-number>
              <n-color-picker style="flex: 1" v-model:value="customWatermarkConfig.fontColor" :modes="['hex']"/>
            </div>
          </n-form-item>
          <n-form-item label="旋转角度">
            <div style="display: flex;width: 100%;align-items: center;gap: 10px">
              <n-slider v-model:value="customWatermarkConfig.rotation" :step="1" :max="360"/>
              <n-input-number :min="0" size="small" style="text-align: center" button-placement="both"
                              v-model:value="customWatermarkConfig.rotation">
                <template #suffix>°</template>
              </n-input-number>
            </div>
          </n-form-item>
          <n-form-item label="文字偏移">
            <div style="display: flex;width: 100%;align-items: center;gap: 10px">
              <n-input-number style="text-align: center" v-model:value="customWatermarkConfig.xOffset"
                              button-placement="both">
                <template #prefix>
                  X轴
                </template>
              </n-input-number>
              <n-input-number style="text-align: center" v-model:value="customWatermarkConfig.yOffset"
                              button-placement="both">
                <template #prefix>
                  X轴
                </template>
              </n-input-number>
            </div>
          </n-form-item>
          <n-form-item label="文字样式">
            <n-checkbox-group v-model:value="customWatermarkConfig.fontStyle">
              <n-checkbox :value="FontStyleEnum.Bold">
                加粗
              </n-checkbox>
              <n-checkbox :value="FontStyleEnum.Italic">
                倾斜
              </n-checkbox>
              <n-checkbox :value="FontStyleEnum.Underline">
                下划线
              </n-checkbox>
              <n-checkbox :value="FontStyleEnum.StrikeThrough">
                删除线
              </n-checkbox>
            </n-checkbox-group>
          </n-form-item>
          <n-form-item label="渲染模式">
            <div style="display: flex;gap: 10px;align-items: center">
              <n-radio-group v-model:value="customWatermarkConfig.needTiled">
                <n-radio-button :key="false" :value="false" label="单文字"/>
                <n-radio-button :key="true" :value="true" label="平铺"/>
              </n-radio-group>
              <n-input-group v-show="customWatermarkConfig.needTiled">
                <n-input-number v-model:value="customWatermarkConfig.tiledMarginX" :show-button="false">
                  <template #prefix>
                    X轴间距
                  </template>
                </n-input-number>
                <n-input-number v-model:value="customWatermarkConfig.tiledMarginY" :show-button="false">
                  <template #prefix>
                    X轴间距
                  </template>
                </n-input-number>
              </n-input-group>
            </div>
          </n-form-item>
        </n-form>
        <div class="operation-btns">
          <n-button style="flex: 1" :disabled="!imgUrl" @click="clearImage" type="error" secondary>清空</n-button>
          <n-button style="flex: 1" :disabled="!imgUrl" @click="handleImageSelect" type="info" secondary>重选</n-button>
          <n-button style="flex: 1" :disabled="!imgUrl" @click="downloadNewImage" type="success" secondary>下载
          </n-button>
        </div>
      </div>
      <div class="image-result-preview">
        <div v-show="imgUrl" ref="imageResultRef" class="canvas-box">
          <canvas ref="imageCanvasRef" class="image-canvas">
          </canvas>
          <canvas ref="watermarkCanvasRef" class="watermark-canvas"></canvas>
        </div>
        <div v-show="!imgUrl" class=" content-tip-box">
          <NIcon size="50" :component="ImageOutline"/>
          <p>请在左侧选择需要添加水印的图片</p>
        </div>
      </div>
    </div>
  </n-spin>

</template>

<style scoped lang="scss">
.tool-view {
  display: flex;
  gap: 15px;
  //图片预览
  .image-preview {
    flex: 1;
    position: relative;
    cursor: pointer;
    display: flex;
    box-sizing: border-box;
    transition: 0.2s;
    border: 2px dashed var(--border-color);

    .img-drop-change-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(54, 54, 54, 0.7);
      position: absolute;
      z-index: 9;
      color: #ffffff;
    }

    .image-box {
      width: 100%;
      height: 100%;
      display: flex;

      .image {
        width: 100%;
      }
    }


    .image-select-tip {
      transition: 0.2s;

      .tip-content {
        font-size: 16px;
      }

      .tip-supplement {
        color: var(--text-color-3);
      }
    }
  }

  .image-preview-has-drop {
    border: 2px dashed var(--primary-color);
  }

  //自定义水印
  .custom-watermark {
    flex: 0.8;

    .operation-btns {
      gap: 15px;
      display: flex;
      justify-content: space-between;
    }
  }

  //处理结果
  .image-result-preview {
    width: 100%;
    flex: 1;
    border: 2px dashed var(--border-color);
    box-sizing: border-box;

    .canvas-box {
      position: relative;
      display: flex;
      height: 100%;

      .image-canvas {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .watermark-canvas {
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        position: absolute;
      }
    }


    .image {
      width: 100%;
      box-sizing: border-box;
      border: 2px dashed var(--border-color);
    }
  }
}

.content-tip-box {
  width: 100%;
  display: flex;
  gap: 5px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 380px;

}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

</style>
