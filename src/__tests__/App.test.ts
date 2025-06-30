import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Ramusi 工具导航站')
    expect(wrapper.text()).toContain('让工作更高效的工具导航站')
  })
})
