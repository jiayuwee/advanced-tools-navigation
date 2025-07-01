<template>
  <div class="star-rating">
    <span
      v-for="n in 5"
      :key="n"
      class="star"
      :class="{ filled: n <= modelValue }"
      @click="updateRating(n)"
    >
      ★
    </span>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);

function updateRating(n: number) {
  if (!props.readonly) {
    emit("update:modelValue", n);
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  gap: 4px;
  font-size: 1.5rem;
  color: #ffd700;
  cursor: pointer;
}
.star {
  transition: color 0.2s;
}
.star.filled {
  color: #ffd700;
}
.star:not(.filled) {
  color: #ccc;
}
</style>
