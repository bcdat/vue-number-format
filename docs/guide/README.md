# Introduction

Vue Currency Input allows an easy input of currency formatted numbers based on the [ECMAScript Internationalization API (ECMA-402)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat).

Built on top of the [Vue Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html), it provides the function `useCurrencyInput` (a so called *Vue composable*) for decorating input components with currency format capabilities. Thanks to [Vue Demi](https://github.com/vueuse/vue-demi), it supports both Vue 2 and Vue 3.

## Installation
Install the npm package:

```bash
npm install vue-currency-input
```

For usage with Vue 2 you have to install also the [Vue Composition API plugin](https://github.com/vuejs/composition-api):

```bash
npm install @vue/composition-api
```

## Usage
Vue Currency Input does not provide a ready-to-use component, instead it enables you to create your own based on your favorite input component (for example [Quasar](examples#usage-with-quasar-veevalidate) or [Element Plus](examples#usage-with-element-plus)).

::: warning Code examples
The following code examples are for Vue 3. Deviations for Vue 2 are noted as inline code comments.
:::

### Creating a custom component
The following example component `<currency-input>` uses a simple HTML input element. 

The component must provide props for the `v-model` value binding and the options (see [Config Reference](config)). Make also sure, that the input element has type `text` (or omit the type since it's the default).

```vue
<template>
  <input 
    ref="inputRef"
    type="text"
    :value="formattedValue"
  >
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input'

export default {
  name: 'CurrencyInput',
  props: {
    modelValue: Number, // Vue 2: value
    options: Object
  },
  setup (props) {
    const { formattedValue, inputRef } = useCurrencyInput(props.options)

    return { inputRef, formattedValue }
  }
}
</script>
```

### Use the custom component
Now you can use the created `<currency-input>` component in your app:
```vue
<template>
  <currency-input 
    v-model="value" 
    :options="{ currency: 'EUR' }"
  />
</template>

<script>
import CurrencyInput from './CurrencyInput'

export default {
  name: 'App',
  components: { CurrencyInput },
  data: () => ({ value: 1234 })
}
</script> 
```

See the final result in the [examples](examples#simple-html-input-element).

## Lazy value binding
Sometimes you might want to update the bound value only when the input loses its focus. In this case, use `v-model.lazy` for Vue 3:

```vue
<currency-input
  v-model.lazy="value"
  :options="{ currency: 'EUR' }"
/>
```
For Vue 2 listen to the `change` event instead of using `v-model`, since the `lazy` modifier is not supported when using `v-model` on custom components:
```vue
<currency-input
  :value="value"
  :options="{ currency: 'EUR' }"
  @change="value = $event"
/>
```

## External props changes
If the value of the input is changed externally (and not only by user input) you need to use the `setValue` function returned by `useCurrencyInput` within a watcher.

The same applies for the options of your currency input component. Use the `setOptions` function in a watcher in order to make the options reactive for changes after the component has been mounted (like in the [Playground](playground)).

```vue
<template>
  <input 
    ref="inputRef" 
    :value="formattedValue"
  >
</template>

<script>
import { watch } from 'vue' // Vue 2: import { watch } from '@vue/composition-api' 
import { useCurrencyInput } from 'vue-currency-input'

export default {
  name: 'CurrencyInput',
  props: {
    modelValue: Number, // Vue 2: value
    options: Object
  },
  setup (props) {
    const {
      inputRef,
      formattedValue,
      setOptions,
      setValue
    } = useCurrencyInput(props.options)

    watch(() => props.modelValue, (value) => { // Vue 2: props.value
      setValue(value)
    })

    watch(() => props.options, (options) => {
      setOptions(options)
    })

    return { inputRef, formattedValue }
  }
}
</script>
```
