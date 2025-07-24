<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from './composables/useTheme';
import { useToast } from './composables/useToast';
import { useModal } from './composables/useModal';

import ThemeToggle from './components/ui/ThemeToggle.vue';
import Button from './components/ui/Button.vue';
import Input from './components/ui/Input.vue';
import NumberInput from './components/ui/NumberInput.vue';
import TextArea from './components/ui/TextArea.vue';
import Select from './components/ui/Select.vue';
import Checkbox from './components/ui/Checkbox.vue';
import Radio from './components/ui/Radio.vue';
import Toggle from './components/ui/Toggle.vue';
import Upload from './components/ui/Upload.vue';
import Modal from './components/ui/modal/Modal.vue';
import Tag from './components/ui/Tag.vue';
import Tab from './components/ui/tabs/Tab.vue';
import TabItem from './components/ui/tabs/TabItem.vue';

const { theme } = useTheme();
const toast = useToast();
const modal = useModal();

// Input demo
const inputValue = ref('');
const inputWithError = ref('');
const inputWithSuccess = ref('Success value');

// NumberInput demo
const numberValue = ref(50);

// TextArea demo
const textareaValue = ref('');

// Select demo
const selectValue = ref('');
const selectOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

// Checkbox demo
const checkboxValue = ref(false);
const checkboxMultipleValue = ref(['option1']);
const checkboxOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

// Radio demo
const radioValue = ref('option1');

// Toggle demo
const toggleValue = ref(false);

// Upload demo
const uploadedFiles = ref<File[]>([]);

// Modal demo
const isModalOpen = ref(false);

// Tag demo
const tagItems = ref(['Vue', 'TypeScript', 'Tailwind CSS']);
const removeTag = (index: number) => {
  tagItems.value.splice(index, 1);
};

// Tab demo
const activeTab = ref(0);

// Toast demo
const showSuccessToast = () => {
  toast.success('This is a success message!');
};

const showErrorToast = () => {
  toast.error('This is an error message!');
};

const showWarningToast = () => {
  toast.warning('This is a warning message!');
};

const showInfoToast = () => {
  toast.info('This is an info message!');
};

// Confirm dialog demo
const showConfirmDialog = async () => {
  const confirmed = await modal.confirm({
    title: 'Confirm Action',
    message: 'Are you sure you want to perform this action?',
    confirmText: 'Yes, I\'m sure',
    cancelText: 'Cancel',
    confirmVariant: 'danger',
  });

  if (confirmed) {
    toast.success('Action confirmed!');
  } else {
    toast.info('Action cancelled');
  }
};
/**

 */
</script>

<template>
  <div
    class="min-h-screen p-8 dark:bg-gray-900 dark:text-white bg-gray-100 text-gray-900"
  >
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">UI Component Library</h1>
        <ThemeToggle />
      </div>

      <div class="grid gap-8">
        <!-- Buttons -->
        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 dark:text-white">Buttons</h2>
          <div class="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">Sizes</h3>
          <div class="flex flex-wrap gap-3 items-center">
            <Button size="sm">Small</Button>
            <Button>Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">States</h3>
          <div class="flex flex-wrap gap-3">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>

          <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">Rounded Corners</h3>
          <div class="flex flex-wrap gap-3">
            <Button rounded="sm">Small Rounded</Button>
            <Button rounded="md">Medium Rounded</Button>
            <Button rounded="lg">Large Rounded</Button>
            <Button rounded="pill">Pill Shaped</Button>
            <Button rounded="full">Fully Rounded</Button>
          </div>
          <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">Icon Buttons</h3>
          <div class="flex flex-wrap gap-3 items-center">
            <Button icon rounded="full" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </Button>
            <Button icon rounded="full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </Button>
            <Button icon rounded="full" size="lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </Button>
            <Button icon rounded="full" variant="secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </Button>
            <Button icon rounded="full" variant="danger">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </Button>
          </div>
        </section>

        <!-- Form Controls -->
        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 dark:text-white">Form Controls</h2>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <h3 class="text-lg font-medium mb-3 dark:text-white">Input</h3>
              <div class="space-y-4">
                <Input
                  v-model="inputValue"
                  label="Standard Input"
                  placeholder="Enter some text"
                />

                <Input
                  v-model="inputWithError"
                  label="Input with Error"
                  placeholder="Enter some text"
                  error="This field is required"
                />

                <Input
                  v-model="inputWithSuccess"
                  label="Input with Success"
                  placeholder="Enter some text"
                  success
                />

                <Input
                  label="Disabled Input"
                  placeholder="This input is disabled"
                  disabled
                />
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-3 dark:text-white">TextArea</h3>
              <TextArea
                v-model="textareaValue"
                label="Text Area"
                placeholder="Enter multiple lines of text"
                maxLength="200"
                showCounter
              />

              <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">TextArea with Character Limit</h3>
              <TextArea
                v-model="textareaValue"
                label="Limited Text Area (100 characters)"
                placeholder="Enter text (limited to 100 characters)"
                maxLength="100"
                showCounter
              />

              <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">NumberInput</h3>
              <NumberInput
                v-model="numberValue"
                label="Number Input"
                placeholder="Enter a number"
                :min="0"
                :max="100"
                :step="5"
              />

              <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">Select</h3>
              <Select
                v-model="selectValue"
                :options="selectOptions"
                label="Select"
                placeholder="Choose an option"
              />
            </div>
          </div>
        </section>

        <!-- Checkbox, Radio, and Toggle -->
        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 dark:text-white">Selection Controls</h2>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <h3 class="text-lg font-medium mb-3 dark:text-white">Checkbox</h3>
              <div class="space-y-3">
                <Checkbox
                  v-model="checkboxValue"
                  label="Single Checkbox"
                />

                <div class="mt-4">
                  <h4 class="text-sm font-medium mb-2 dark:text-gray-300">Multiple Checkboxes</h4>
                  <div class="space-y-2">
                    <Checkbox
                      v-for="option in checkboxOptions"
                      :key="option.value"
                      v-model="checkboxMultipleValue"
                      :value="option.value"
                      :label="option.label"
                    />
                  </div>
                </div>

                <div class="mt-4">
                  <h4 class="text-sm font-medium mb-2 dark:text-gray-300">Disabled Checkbox</h4>
                  <Checkbox
                    :modelValue="true"
                    label="Disabled Checkbox"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-3 dark:text-white">Radio Buttons</h3>
              <div class="space-y-2">
                <Radio
                  v-for="option in checkboxOptions"
                  :key="option.value"
                  v-model="radioValue"
                  :value="option.value"
                  :label="option.label"
                  name="radio-demo"
                />
              </div>

              <div class="mt-4">
                <h4 class="text-sm font-medium mb-2 dark:text-gray-300">Disabled Radio</h4>
                <Radio
                  :modelValue="'disabled'"
                  value="disabled"
                  label="Disabled Radio"
                  disabled
                />
              </div>

              <h3 class="text-lg font-medium mt-6 mb-3 dark:text-white">Toggle Switch</h3>
              <div class="space-y-4">
                <Toggle
                  v-model="toggleValue"
                  label="Toggle Switch"
                />

                <div class="space-y-2">
                  <h4 class="text-sm font-medium mb-2 dark:text-gray-300">Sizes</h4>
                  <div class="flex flex-col space-y-2">
                    <Toggle
                      v-model="toggleValue"
                      label="Small"
                      size="sm"
                    />
                    <Toggle
                      v-model="toggleValue"
                      label="Medium (default)"
                    />
                    <Toggle
                      v-model="toggleValue"
                      label="Large"
                      size="lg"
                    />
                  </div>
                </div>

                <Toggle
                  :modelValue="true"
                  label="Disabled Toggle"
                  disabled
                />
              </div>
            </div>
          </div>
        </section>

        <!-- File Upload -->
        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 dark:text-white">File Upload</h2>

          <Upload
            v-model="uploadedFiles"
            label="Upload Files"
            accept="image/*,.pdf"
            :maxSize="5 * 1024 * 1024"
            :maxFiles="5"
            multiple
          />
        </section>

        <!-- Tags -->
        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 dark:text-white">Tags</h2>

          <h3 class="text-lg font-medium mb-3 dark:text-white">Variants</h3>
          <div class="flex flex-wrap gap-2 mb-6">
            <Tag>Default</Tag>
            <Tag variant="primary">Primary</Tag>
            <Tag variant="secondary">Secondary</Tag>
            <Tag variant="success">Success</Tag>
            <Tag variant="danger">Danger</Tag>
            <Tag variant="warning">Warning</Tag>
            <Tag variant="info">Info</Tag>
          </div>

          <h3 class="text-lg font-medium mb-3 dark:text-white">Sizes</h3>
          <div class="flex flex-wrap gap-2 items-center mb-6">
            <Tag size="sm">Small</Tag>
            <Tag>Medium</Tag>
            <Tag size="lg">Large</Tag>
          </div>

          <h3 class="text-lg font-medium mb-3 dark:text-white">Closable Tags</h3>
          <div class="flex flex-wrap gap-2 mb-6">
            <Tag
              v-for="(tag, index) in tagItems"
              :key="index"
              closable
              @close="removeTag(index)"
            >
              {{ tag }}
            </Tag>
          </div>

          <h3 class="text-lg font-medium mb-3 dark:text-white">Disabled Tags</h3>
          <div class="flex flex-wrap gap-2">
            <Tag disabled>Disabled</Tag>
            <Tag variant="primary" disabled>Disabled Primary</Tag>
            <Tag closable disabled>Disabled Closable</Tag>
          </div>
        </section>

        <!-- Tabs -->
        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 dark:text-white">Tabs</h2>

          <h3 class="text-lg font-medium mb-3 dark:text-white">Underline Tabs (Animated)</h3>
          <Tab v-model="activeTab" variant="underline" animated>
            <TabItem label="Tab 1">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 1 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 1. The tabs have a smooth animation when switching between them.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 2">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 2 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 2. Notice how the indicator smoothly transitions between tabs.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 3">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 3 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 3. The content also has a fade-in animation when it appears.</p>
              </div>
            </TabItem>
          </Tab>

          <h3 class="text-lg font-medium mt-8 mb-3 dark:text-white">Pills Tabs</h3>
          <Tab variant="pills">
            <TabItem label="Tab 1">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 1 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 1 with the pills variant.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 2">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 2 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 2 with the pills variant.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 3">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 3 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 3 with the pills variant.</p>
              </div>
            </TabItem>
          </Tab>

          <h3 class="text-lg font-medium mt-8 mb-3 dark:text-white">Bordered Tabs</h3>
          <Tab variant="bordered">
            <TabItem label="Tab 1">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 1 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 1 with the bordered variant.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 2">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 2 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 2 with the bordered variant.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 3">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 3 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 3 with the bordered variant.</p>
              </div>
            </TabItem>
          </Tab>

          <h3 class="text-lg font-medium mt-8 mb-3 dark:text-white">Vertical Tabs</h3>
          <Tab variant="pills" vertical>
            <TabItem label="Tab 1">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 1 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 1 with vertical orientation.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 2">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 2 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 2 with vertical orientation.</p>
              </div>
            </TabItem>
            <TabItem label="Tab 3">
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 class="font-medium mb-2 dark:text-white">Tab 3 Content</h4>
                <p class="text-gray-600 dark:text-gray-300">This is the content for Tab 3 with vertical orientation.</p>
              </div>
            </TabItem>
          </Tab>
        </section>

        <!-- Notifications -->
        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 dark:text-white">Notifications</h2>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <h3 class="text-lg font-medium mb-3 dark:text-white">Toast Messages</h3>
              <div class="flex flex-wrap gap-3">
                <Button variant="success" @click="showSuccessToast">Success Toast</Button>
                <Button variant="danger" @click="showErrorToast">Error Toast</Button>
                <Button variant="warning" @click="showWarningToast">Warning Toast</Button>
                <Button variant="info" @click="showInfoToast">Info Toast</Button>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-3 dark:text-white">Modal Dialogs</h3>
              <div class="flex flex-wrap gap-3">
                <Button @click="isModalOpen = true">Open Modal</Button>
                <Button variant="danger" @click="showConfirmDialog">Confirm Dialog</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modal Demo -->
    <Modal v-model="isModalOpen" title="Modal Example">
      <p class="mb-4">This is an example modal dialog. You can put any content here.</p>
      <p>It supports dark mode and has smooth animations.</p>

      <template #footer>
        <div class="flex justify-end">
          <Button variant="ghost" class="mr-2" @click="isModalOpen = false">Cancel</Button>
          <Button @click="isModalOpen = false">Confirm</Button>
        </div>
      </template>
    </Modal>

    <!-- Toast Container (registered globally in main.ts) -->
    <ToastContainer />
  </div>
</template>
