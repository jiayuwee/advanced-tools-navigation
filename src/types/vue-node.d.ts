import { ComponentPublicInstance } from 'vue';

declare module '@vue/test-utils' {
  interface VueNode extends ComponentPublicInstance {
    value?: string | number | boolean;
    checked?: boolean;
    setChecked?(checked: boolean): void;
  }
}