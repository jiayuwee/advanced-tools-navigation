import { ComponentPublicInstance } from 'vue';

declare module '@vue/test-utils' {
  interface VueNode<T extends Node = HTMLElement> extends ComponentPublicInstance {
    value?: string | number | boolean;
    checked?: boolean;
    setChecked?(checked: boolean): void;
  }
}