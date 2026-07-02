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
    maskClosable = false,
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
      maskClosable,
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
    maskClosable = false,
    onPositive = () => {}
  } = {}) => {
    return dialog.info({
      title,
      content,
      positiveText,
      closable,
      maskClosable,
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
    maskClosable = false,
    onPositive = () => {}
  } = {}) => {
    return dialog.success({
      title,
      content,
      positiveText,
      closable,
      maskClosable,
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
    maskClosable = false,
    onPositive = () => {},
    onNegative = () => {}
  } = {}) => {
    return dialog.warning({
      title,
      content,
      positiveText,
      negativeText,
      closable,
      maskClosable,
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
    maskClosable = false,
    onPositive = () => {}
  } = {}) => {
    return dialog.error({
      title,
      content,
      positiveText,
      closable,
      maskClosable,
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