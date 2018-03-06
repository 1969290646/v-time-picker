<template>
  <div ref="time" class="dt-time-picker">
    <dt-input
      v-if="!range"
      v-model="timeValue"
      readonly
      icon="time"
      @focus="focusHandler">
    </dt-input>
    <div
      v-else
      class="range-input-wrapper"
      @click="focusHandler">
      <dt-input v-model="timeValues[0]" readonly />
      <span class="range-input-separator">至</span>
      <dt-input v-model="timeValues[1]" readonly />
      <i class="dt-icon-time dt-range-icon"></i>
    </div>
    <time-panel
      ref="time-wrapper"
      :range="range"
      :time.sync="copyTime"
      :times.sync="copyTimes"
      :time-value="timeValue"
      :hide-hours="hideHours"
      :time-values="timeValues"
      :hide-minutes="hideMinutes"
      :hide-seconds="hideSeconds"
      :show-wrapper="showWrapper"
      :wrapper-style="wrapperStyle"
      :disabled-hours="disabledHours"
      :select-options="selectOptions"
      :show-time-select="showTimeSelect"
      :disabled-minutes="disabledMinutes"
      :disabled-seconds="disabledSeconds"
      @close="closeHandler">
    </time-panel>
  </div>
</template>

<script>
import dateFormat from 'dateformat'
import { getTimeOption } from './util.js'
import { bind, unbind } from 'focus-outside'
import CommonPropMixin from './common-prop-mixin.js'
import { getScrollContainer } from './util.js'
import { DEFAULT_TIME_FORMAT_STRING } from './constant.js'

import DtInput from '../dt-input.vue'
import TimePanel from './time-panel.vue'

const DEFAULT_TIME_VALUES = ['', '']

export default {
  name: 'dt-time-picker',

  mixins: [CommonPropMixin],

  props: {
    value: {
      type: [Date, Array, String, Number],
      required: true
    },
    formatter: String
  },

  data () {
    return {
      oldPosition: '',
      isClose: false,
      tempDate: {},
      tempDates: [],
      copyTime: 0,
      copyTimes: [],
      showWrapper: false,
      wrapperStyle: {},
      showTimeSelect: false
    }
  },

  computed: {
    timeValue () {
      const { copyTime, formatter, timeFormatString } = this
      if (!copyTime) return ''
      return dateFormat(copyTime, formatter || timeFormatString)
    },

    timeValues () {
      const { copyTimes, formatter, timeFormatString } = this
      if (!copyTimes[0]) return DEFAULT_TIME_VALUES
      return copyTimes.map(time => dateFormat(time, formatter || timeFormatString))
    },

    tempValue: {
      set (v) { this.$emit('input', v) },
      get () { return this.value }
    },

    timeFormatString () {
      let format = DEFAULT_TIME_FORMAT_STRING
      const { hideHours, hideMinutes, hideSeconds, showTimeSelect } = this
      if (showTimeSelect) {
        format = format.replace(/(:ss|ss)$/, '')
        return
      }
      if (hideHours) format = format.replace(/^(HH:|HH)/, '')
      if (hideMinutes) format = format.replace(/MM:|MM/, '')
      if (hideSeconds) format = format.replace(/(:ss|ss)$/, '')
      return format
    },

    notArrayValue () {
      return !Array.isArray(this.value)
    }
  },

  watch: {
    showWrapper: 'resetPosition'
  },

  mounted () {
    this.initDate()
    this.initSelectOptions()
    const wrapper = this.$refs['time-wrapper'].$el
    const parent = getScrollContainer(wrapper)
    this.oldPosition = parent.style.position
    parent.style.position = 'relative'
    parent.appendChild(wrapper)
    bind(wrapper, this.focusoutHandler)
    parent.addEventListener('scroll', this.resetPosition)
  },

  beforeDestory () {
    const wrapper = this.$refs['time-wrapper'].$el
    const parent = getScrollContainer(wrapper)
    parent.style.position = this.oldPosition
    unbind(wrapper, this.focusoutHandler)
    parent.removeEventListener('scroll', this.resetPosition)
  },

  components: {
    DtInput,
    TimePanel
  },

  methods: {
    createDate (v) {
      if (v instanceof Date) return new Date(v.getTime())
      return isNaN(Number(v)) ? new Date(v) : new Date()
    },

    initDate () {
      const { value, createDate } = this
      if (this.notArrayValue) {
        this.tempDate = createDate(value)
        this.copyTime = this.tempDate.getTime()
      } else {
        this.tempDates = value.map(item => createDate(item))
        this.copyTimes = this.tempDates.map(date => date.getTime())
      }
    },

    initSelectOptions () {
      const {
        tempDate,
        tempDates,
        selectOptions: { startHours, startMinutes }
      } = this
      if (!startHours || !startMinutes) return
      this.showTimeSelect = true
      if (this.notArrayValue) {
        tempDate.setHours(startHours)
        tempDate.setMinutes(startMinutes)
        this.copyTime = tempDate.getTime()
      } else {
        tempDates.forEach(date => {
          date.setHours(startHours)
          date.setMinutes(startMinutes)
        })
        this.copyTimes = tempDates.map(date => date.getTime())
      }
    },

    resetDate () {
      const { tempDate, tempDates, notArrayValue } = this
      if (tempDate instanceof Date || tempDates.length) {
        if (notArrayValue) {
          this.copyTime = tempDate.getTime()
        } else {
          this.copyTimes = tempDates.map(date => date.getTime())
        }
      }
    },

    resetPosition (v) {
      if (v) {
        const rect = this.$el.getBoundingClientRect()
        const parent = getScrollContainer(this.$refs['time-wrapper'].$el)
        const parentRect = parent.getBoundingClientRect()
        this.wrapperStyle = {
          top: `${rect.top - parentRect.top - 1}px`,
          left: `${rect.left - parentRect.left - 1}px`
        }
        this.$nextTick(() => {
          this.resetDate()
          this.$refs['time-wrapper'].$el.focus()
        })
      }
    },

    focusHandler () {
      this.isClose = false
      this.showWrapper = true
    },

    setTimeValue () {
      const { tempDate, tempDates, copyTime, copyTimes, notArrayValue } = this
      if (notArrayValue) {
        tempDate.setTime(copyTime)
      } else {
        tempDates.forEach((date, index) => date.setTime(copyTimes[index]))
      }
    },

    closeHandler () {
      this.setTimeValue()
      if (this.notArrayValue) {
        this.tempValue = ''
        this.copyTime = ''
      } else {
        this.tempValue = DEFAULT_TIME_VALUES
        this.copyTimes = DEFAULT_TIME_VALUES
      }
      this.isClose = true
      this.showWrapper = false
    },

    focusoutHandler () {
      if (this.isClose) return
      const {
        copyTime,
        copyTimes,
        tempDate,
        tempDates,
        formatter,
        notArrayValue,
        timeFormatString
      } = this
      this.setTimeValue()
      if (notArrayValue) {
        this.tempValue = new Date(copyTime)
        this.$emit('change', getTimeOption(tempDate, formatter || timeFormatString))
      } else {
        this.tempValue = copyTimes.map(time => new Date(time))
        this.$emit('change', tempDates.map(time => {
          return getTimeOption(time, formatter || timeFormatString)
        }))
      }
      this.showWrapper = false
    }
  }
}
</script>
