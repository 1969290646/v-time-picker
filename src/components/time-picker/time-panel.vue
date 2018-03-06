<template>
  <transition name="scroll">
    <div
      v-show="showWrapper"
      tabindex="-1"
      class="dt-time-picker-wrapper"
      :class="rangeWrapper"
      :style="wrapperStyle">
      <div
        v-if="!range"
        class="spinner-input-wrapper"
        @mouseenter="showCloseHandler"
        @mouseleave="showClose = false">
        <dt-input v-model="timeValue" readonly />
        <i
          v-show="showClose"
          class="dt-icon-close"
          @click="$emit('close')">
        </i>
        <span v-show="!showClose" :style="{ width : '12px' }"></span>
      </div>
      <div
        v-else
        class="spinner-range-input-wrapper"
        @mouseenter="showCloseHandler"
        @mouseleave="showClose = false">
        <dt-input
          v-model="timeValues[0]"
          readonly>
        </dt-input>
        <span class="spinner-range-input-separator">至</span>
        <dt-input
          v-model="timeValues[1]"
          readonly>
        </dt-input>
        <i
          v-show="showClose"
          class="dt-icon-close"
          @click="$emit('close')">
        </i>
        <span v-show="!showClose" :style="{ width : '12px' }"></span>
      </div>
      <time-spinner
        v-if="!range"
        :range="range"
        :time.sync="copyTime"
        :time-value="timeValue"
        :hide-hours="hideHours"
        :hide-minutes="hideMinutes"
        :hide-seconds="hideSeconds"
        :show-wrapper="showWrapper"
        :disabled-hours="disabledHours"
        :select-options="selectOptions"
        :show-time-select="showTimeSelect"
        :disabled-minutes="disabledMinutes"
        :disabled-seconds="disabledSeconds">
      </time-spinner>
      <div
        v-else
        class="spinner-range-wrapper">
        <time-spinner
          :range="range"
          :compare="copyTimes[1]"
          :time.sync="copyTimes[0]"
          :hide-hours="hideHours"
          :time-values="timeValues"
          :hide-minutes="hideMinutes"
          :hide-seconds="hideSeconds"
          :show-wrapper="showWrapper"
          :disabled-hours="disabledHours"
          :select-options="selectOptions"
          :show-time-select="showTimeSelect"
          :disabled-minutes="disabledMinutes"
          :disabled-seconds="disabledSeconds">
        </time-spinner>
        <time-spinner
          end-time
          :range="range"
          :compare="copyTimes[0]"
          :time.sync="copyTimes[1]"
          :hide-hours="hideHours"
          :time-values="timeValues"
          :hide-minutes="hideMinutes"
          :hide-seconds="hideSeconds"
          :show-wrapper="showWrapper"
          :disabled-hours="disabledHours"
          :select-options="selectOptions"
          :show-time-select="showTimeSelect"
          :disabled-minutes="disabledMinutes"
          :disabled-seconds="disabledSeconds">
        </time-spinner>
      </div>
    </div>
  </transition>
</template>

<script>
import CommonPropMixin from './common-prop-mixin.js'

import DtInput from '../dt-input.vue'
import TimeSpinner from './time-spinner.vue'

export default {
  mixins: [CommonPropMixin],

  props: {
    time: [Number, String],
    times: Array,
    timeValue: String,
    timeValues: Array,
    showWrapper: Boolean,
    showTimeSelect: Boolean,
    wrapperStyle: {
      type: Object,
      default () {
        return {}
      }
    }
  },

  data () {
    return {
      showClose: true
    }
  },

  computed: {
    copyTime: {
      get () { return this.time },
      set (v) { this.$emit('update:time', v) }
    },

    copyTimes: {
      get () { return this.times },
      set (v) { this.$emit('update:time', v) }
    },

    rangeWrapper () {
      return { 'dt-time-range-wrapper': this.range }
    }
  },
  components: {
    DtInput,
    TimeSpinner
  },

  methods: {
    showCloseHandler () {
      this.showClose = true
    }
  }
}
</script>
