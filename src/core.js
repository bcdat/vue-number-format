import NumberFormat from './number-format'

export const CONFIG_KEY = '__input-facade__'

/**
 * Creates a CustomEvent('input') with detail = { facade: true }
 * used as a way to identify our own input event
 */
export function FacadeInputEvent() {
  return new CustomEvent('input', {
    bubbles: true,
    cancelable: true,
    detail: { facade: true }
  })
}

/**
 * ensure that the element we're attaching to is an input element
 * if not try to find an input element in this elements childrens
 *
 * @param {HTMLInputElement} el
 */
export function getInputElement(el) {
  const inputElement = el instanceof HTMLInputElement ? el : el.querySelector('input')

  /* istanbul ignore next */
  if (!inputElement) {
    throw new Error('facade directive requires an input element')
  }

  return inputElement
}

/**
 * Updates the cursor position to the right place after the masking rule was applied
 * @param {HTMLElement} el
 * @param {Number} position
 */
export function updateCursor(el, position) {
  const setSelectionRange = () => { el.setSelectionRange(position, position) }
  setSelectionRange()
  // Android Fix
  setTimeout(setSelectionRange(), 1)
}

/**
 * Updates the element's value and unmasked value based on the masking config rules
 *
 * @param {HTMLInputElement} el The input element to update
 * @param {object} [options]
 * @param {Boolean} options.emit Wether to dispatch a new InputEvent or not
 * @param {Boolean} options.force Forces the update even if the old value and the new value are the same
 */
export function updateValue(el, vnode, { emit = true, force = false, clean = false } = {}) {
  const { config } = el[CONFIG_KEY]
  let { oldValue } = el[CONFIG_KEY]
  let currentValue = vnode && vnode.props ? vnode.props.value : el.value

  oldValue = oldValue || ''
  currentValue = currentValue || ''

  const number = new NumberFormat(config).clean(clean && !config.reverseFill)
  let masked = number.format(currentValue)
  let unmasked = number.clean(!config.reverseFill).unformat(currentValue)

  // check value with in range max and min value
  if (clean) {
    if (config.max && unmasked > config.max) {
      masked = number.format(config.max)
      unmasked = number.unformat(config.max)
    } else if (config.min && unmasked < config.min) {
      masked = number.format(config.min)
      unmasked = number.unformat(config.min)
    }
  }

  if (force || oldValue !== currentValue) {
    el[CONFIG_KEY].oldValue = masked
    el.unmaskedValue = unmasked
    // safari makes the cursor jump to the end if el.value gets assign even if to the same value
    if (el.value !== masked) {
      el.value = masked
    }

    // this part needs to be outside the above IF statement for vuetify in firefox
    // drawback is that we endup with two's input events in firefox
    return emit && el.dispatchEvent(FacadeInputEvent())
  }
}

/**
 * Input event handler
 *
 * @param {Event} event The event object
 */
export function inputHandler(event) {
  const { target, detail } = event
  // We dont need to run this method on the event we emit (prevent event loop)
  if (detail && detail.facade) {
    return false
  }

  // since we will be emitting our own custom input event
  // we can stop propagation of this native event
  event.stopPropagation()

  let positionFromEnd = target.value.length - target.selectionEnd
  const { oldValue, config } = target[CONFIG_KEY]

  updateValue(target, null, { emit: false }, event)
  // updated cursor position
  positionFromEnd = Math.max(positionFromEnd, config.suffix.length)
  positionFromEnd = target.value.length - positionFromEnd
  positionFromEnd = Math.max(positionFromEnd, config.prefix.length + 1)
  updateCursor(target, positionFromEnd)

  if (oldValue !== target.value) {
    target.dispatchEvent(FacadeInputEvent())
  }
}

/**
 * Blur event handler
 *
 * @param {Event} event The event object
 */
export function blurHandler(event) {
  const { target, detail } = event
  // We dont need to run this method on the event we emit (prevent event loop)
  if (detail && detail.facade) {
    return false
  }

  const { oldValue } = target[CONFIG_KEY]

  updateValue(target, null, { force: true, clean: true }, event)

  if (oldValue !== target.value) {
    target.dispatchEvent(FacadeInputEvent())
  }
}
