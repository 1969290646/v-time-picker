import dateFormat from 'dateformat'
import { DEFAULT_TIME_FORMAT_STRING } from './constant.js'

export function filterTime (time) {
  return time >= 10 ? time : `0${time}`
}

export function createSelectTimeOption (hours, minutes, setp, index) {
  hours = parseInt((minutes + setp) / 60) + hours
  minutes = (setp + minutes) % 60
  return {
    index,
    hours,
    minutes,
    active: false,
    disabled: false,
    text: `${filterTime(hours)}:${filterTime(minutes)}`
  }
}

// 或参考元素第一个可滚动的元素
export function getScrollContainer (el) {
  if (!el) return ROOT
  let parent = el.parentNode
  while (parent && parent !== ROOT) {
    if (checkScrollable(parent)) {
      return parent
    }
    parent = parent.parentNode
  }
  return ROOT
}

export function createTimeOptions (len) {
  const options = []
  for (let i = 0; i < len; i++) {
    options.push({
      value: i,
      active: false,
      disabled: false
    })
  }
  return options
}

export function getTimeOption (date, formatter = DEFAULT_TIME_FORMAT_STRING) {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    text: dateFormat(date, formatter)
  }
}
