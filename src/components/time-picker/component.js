import main from './main.vue'
export default {
  install (Vue, options) {
    const name = options && options.name || main.name
    Vue.component(name, main)
  }
}
