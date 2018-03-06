const DEFUALT_DISABLE_OPTION = {
  type: Function,
  default () {
    return false
  }
}

export default {
  props: {
    range: Boolean,
    hideHours: Boolean,
    hideMinutes: Boolean,
    hideSeconds: Boolean,
    disabledHours: DEFUALT_DISABLE_OPTION,
    disabledMinutes: DEFUALT_DISABLE_OPTION,
    disabledSeconds: DEFUALT_DISABLE_OPTION,
    selectOptions: {
      type: Object,
      default () {
        return {
          setp: 0,
          startHours: 0,
          startMinutes: 0,
          endHours: 0,
          endMinutes: 0
        }
      }
    }
  }
}
