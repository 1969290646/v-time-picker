<template>
  <div class="time-spinner-wrapper">
    <i class="border-bottom-1px"></i>
    <i class="border-top-1px"></i>
    <div v-if="!showTimeSelect" class="time-second-wrapper">
      <ul
        v-show="!hideHours"
        ref="hours"
        @scroll="timeScrollHandler('hours', arguments[0])">
        <li
          v-for="hour in hoursOptions"
          :key="hour.value"
          :class="{ active: hour.active }"
          :disabled="hour.disabled || disabledHours(hour.value)"
          @click="clickTimeButton(arguments[0], 'hours', hour)">
          {{ filterTime(hour.value) }}
        </li>
      </ul>
      <ul
        v-show="!hideMinutes"
        ref="minutes"
        @scroll="timeScrollHandler('minutes', arguments[0])">
        <li
          v-for="minute in minutesOptions"
          :key="minute.value"
          :class="{ active: minute.active }"
          :disabled="minute.disabled || disabledMinutes(minute.value)"
          @click="clickTimeButton(arguments[0], 'minutes', minute)">
          {{ filterTime(minute.value) }}
        </li>
      </ul>
      <ul
        v-show="!hideSeconds"
        ref="seconds"
        @scroll="timeScrollHandler('seconds', arguments[0])">
        <li
          v-for="second in secondsOptions"
          :key="second.value"
          :class="{ active: second.active }"
          :disabled="second.disabled || disabledSeconds(second.value)"
          @click="clickTimeButton(arguments[0], 'seconds', second)">
          {{ filterTime(second.value) }}
        </li>
      </ul>
    </div>
    <div v-else class="time-select-wrapper">
      <ul ref="selectTime" @scroll="selectScrollHandler('selectTime', arguments[0])">
        <li
          v-for="time in selectTimeOptions"
          :key="time.text"
          :disabled="time.disabled"
          :class="{ active: time.active }"
          @click="clickSelectButton(arguments[0], time)">
          {{ time.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  filterTime,
  createSelectTimeOption,
  getTimeOption,
  createTimeOptions
} from './util.js'
import { get as _get } from 'noshjs'
import debounce from 'lodash-es/debounce'
import { SET_TIME_MAP, GET_OPTION_MAP } from './constant.js'
import CommonPropMixin from './common-prop-mixin.js'

const ROW_HEIGHT = 35
export default {
  mixins: [CommonPropMixin],

  props: {
    time: [Number, String],
    compare: [Number, String],
    timeValue: String,
    endTime: Boolean,
    showWrapper: Boolean,
    showTimeSelect: Boolean
  },

  data () {
    return {
      date: {},
      hoursOptions: createTimeOptions(24),
      minutesOptions: createTimeOptions(60),
      secondsOptions: createTimeOptions(60),
      selectTimeOptions: []
    }
  },

  watch: {
    showWrapper (v) {
      if (v) this.initTimeButton()
    },

    selectOptions: {
      immediate: true,
      handler (v) {
        if (v) this.initSelectTimeOptions()
      }
    },

    time: {
      immediate: true,
      handler (v) {
        if (v) {
          this.date = new Date(v)
          this.setTimeDisabled()
        }
      }
    },

    compare: {
      immediate: true,
      handler (v) {
        if (v) this.setTimeDisabled()
      }
    }
  },

  methods: {
    filterTime,

    setTimeDisabled () {
      // 如果不是范围类型，不进行禁选操作
      if (!this.range) return

      const {
        date,
        compare,
        endTime,
        hideHours,
        hideMinutes,
        hideSeconds,
        hoursOptions,
        minutesOptions,
        secondsOptions,
        selectTimeOptions
      } = this

      const {
        hours: currHours,
        minutes: currMinutes,
        seconds: currSeconds
      } = getTimeOption(date)

      const {
        hours: compareHours,
        minutes: compareMinutes,
        seconds: compareSeconds
      } = getTimeOption(new Date(compare))

      if (selectTimeOptions && selectTimeOptions.length) {
        selectTimeOptions.forEach(option => {
          const disabled = endTime
            ? option.hours < compareHours || (option.hours === compareHours && option.minutes < compareMinutes)
            : option.hours > compareHours || (option.hours === compareHours && option.minutes > compareMinutes)
          option.disabled = disabled
        })
        return
      }

      if (!hideHours) {
        hoursOptions.forEach(hour => {
          hour.disabled = endTime
            ? hour.value < compareHours ||
              (hour.value === compareHours && currMinutes < compareMinutes) ||
              (hour.value === compareHours && currMinutes === compareMinutes && currSeconds < compareSeconds)
            : hour.value > compareHours ||
              (hour.value === compareHours && currMinutes > compareMinutes) ||
              (hour.value === compareHours && currMinutes === compareMinutes && currSeconds > compareSeconds)
        })
      }

      if (!hideMinutes) {
        if (endTime ? currHours > compareHours : currHours < compareHours) {
          minutesOptions.forEach(minute => { minute.disabled = false })
        } else {
          minutesOptions.forEach(minute => {
            minute.disabled = endTime
              ? minute.value < compareMinutes ||
                (minute.value === compareMinutes && currSeconds < compareSeconds)
              : minute.value > compareMinutes ||
                (minute.value === compareMinutes && currSeconds > compareSeconds)
          })
        }
      }

      if (!hideSeconds) {
        if (endTime ? currHours > compareHours || currMinutes > compareMinutes : currHours < compareHours || currMinutes < compareMinutes) {
          secondsOptions.forEach(minute => { minute.disabled = false })
        } else {
          secondsOptions.forEach(second => {
            second.disabled = endTime ? second.value < compareSeconds : second.value > compareSeconds
          })
        }
      }
    },

    initSelectTimeOptions () {
      const {
        selectOptions: {
          setp,
          endHours,
          endMinutes,
          startHours,
          startMinutes
        }
      } = this
      if (!setp || !endHours || !endMinutes || !startHours || !startMinutes) return
      const minutes = endMinutes - startMinutes
      const hours = endHours - startHours
      const totalMinutes = (hours * 60) + minutes
      const mod = totalMinutes % setp === 0 ? 0 : 1
      const len = parseInt(totalMinutes / setp)
      const result = []
      for (let i = 0; i <= len; i++) {
        result.push(createSelectTimeOption(startHours, startMinutes, i * setp, i))
      }
      if (mod) {
        result.push(createSelectTimeOption(endHours, endMinutes, 0, 0))
      }
      this.selectTimeOptions = result
    },

    initTimeButton () {
      const {
        date,
        hoursOptions,
        minutesOptions,
        secondsOptions,
        selectTimeOptions,
        $refs: {
          hours,
          minutes,
          seconds,
          selectTime
        }
      } = this

      const hourValue = date.getHours()
      const minuteValue = date.getMinutes()
      const secondValue = date.getSeconds()

      if (!selectTimeOptions.length) {
        hours.scrollTop = hourValue * ROW_HEIGHT
        minutes.scrollTop = minuteValue * ROW_HEIGHT
        seconds.scrollTop = secondValue * ROW_HEIGHT
        hoursOptions[hourValue].active = true
        minutesOptions[hourValue].active = true
        secondsOptions[hourValue].active = true
      } else {
        selectTimeOptions.forEach(select => { select.active = false })
        selectTimeOptions.some((select, index) => {
          if (select.hours === hourValue && select.minutes === minuteValue) {
            select.active = true
            selectTime.scrollTop = index * ROW_HEIGHT
            return true
          }
          return false
        })
      }
    },

    scrollHandler (target, prop) {
      const top = target.scrollTop
      const row = parseInt(top / ROW_HEIGHT)
      const endRow = Math.round((top % ROW_HEIGHT) / ROW_HEIGHT)
      const count = row + endRow
      _get(this, [GET_OPTION_MAP[prop]], []).forEach(time => { time.active = false })
      _get(this, [GET_OPTION_MAP[prop], count], {}).active = true
      this.changeTop(target, (count) * ROW_HEIGHT)
      return count
    },

    selectScrollHandler (prop, { target }) {
      const { date, selectTimeOptions, scrollHandler } = this
      const count = scrollHandler(target, prop)
      if (_get(this, [GET_OPTION_MAP[prop], count, 'disabled'])) return
      const { hours, minutes } = selectTimeOptions[count]
      date.setHours(hours)
      date.setMinutes(minutes)
      this.$emit('update:time', date.getTime())
    },

    timeScrollHandler (prop, { target }) {
      const count = this.scrollHandler(target, prop)
      if (_get(this, [GET_OPTION_MAP[prop], count, 'disabled'])) return
      this.setTime(SET_TIME_MAP[prop], count)
      this.$emit('update:time', this.date.getTime())
    },

    setTime (prop, count) {
      this.date[prop](count)
    },

    changeTop: debounce(function (target, top) {
      target.scrollTop = top
    }, 50),

    clickTimeButton ({ target }, name, { value, disabled }) {
      if (disabled) return
      target.parentNode.scrollTop = value * ROW_HEIGHT
      this.setTime(SET_TIME_MAP[name], value)
      this.$emit('update:time', this.date.getTime())
    },

    clickSelectButton ({ target }, { index, hours, minutes }) {
      target.parentNode.scrollTop = (index - 1) * ROW_HEIGHT
      this.date.setHours(hours)
      this.date.setMinutes(minutes)
      this.$emit('update:time', this.date.getTime())
    }
  }
}
</script>
