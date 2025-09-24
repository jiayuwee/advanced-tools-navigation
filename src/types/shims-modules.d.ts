// Conservative module shims to silence missing type errors for some third-party packages.

declare module 'lucide-vue-next' {
  import { DefineComponent } from 'vue';
  const content: { [key: string]: DefineComponent<any, any, any> } & { default: any };
  export default content;
}

declare module '@heroicons/vue/*' {
  import { DefineComponent } from 'vue';
  const content: DefineComponent<any, any, any>;
  export default content;
}

// Allow importing modules without types
declare module '*';
