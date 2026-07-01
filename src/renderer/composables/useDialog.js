import { useDialog as useNaiveDialog } from 'naive-ui'

export function useDialog() {
  const dialog = useNaiveDialog()

  const confirm = ({
    title = '',
    content = '',
    positiveText = '确定',
    negativeText = '取消',
    type = 'warning',
    closable = false,
    onPositive = () => {},
    onNegative = () => {}
  } = {}) => {
    return dialog.warning({
      title,
      content,
      positiveText,
      negativeText,
      closable,
      type,
      onPositiveClick: () => {
        onPositive()
        return true
      },
      onNegativeClick: () => {
        onNegative()
        return true
      }
    })
  }

  const info = ({
    title = '',
    content = '',
    positiveText = '确定',
    closable = true,
    onPositive = () => {}
  } = {}) => {
    return dialog.info({
      title,
      content,
      positiveText,
      closable,
      onPositiveClick: () => {
        onPositive()
        return true
      }
    })
  }

  const success = ({
    title = '',
    content = '',
    positiveText = '确定',
    closable = true,
    onPositive = () => {}
  } = {}) => {
    return dialog.success({
      title,
      content,
      positiveText,
      closable,
      onPositiveClick: () => {
        onPositive()
        return true
      }
    })
  }

  const warning = ({
    title = '',
    content = '',
    positiveText = '确定',
    negativeText = '取消',
    closable = false,
    onPositive = () => {},
    onNegative = () => {}
  } = {}) => {
    return dialog.warning({
      title,
      content,
      positiveText,
      negativeText,
      closable,
      onPositiveClick: () => {
        onPositive()
        return true
      },
      onNegativeClick: () => {
        onNegative()
        return true
      }
    })
  }

  const error = ({
    title = '',
    content = '',
    positiveText = '确定',
    closable = true,
    onPositive = () => {}
  } = {}) => {
    return dialog.error({
      title,
      content,
      positiveText,
      closable,
      onPositiveClick: () => {
        onPositive()
        return true
      }
    })
  }

  return {
    dialog,
    confirm,
    info,
    success,
    warning,
    error
  }
}