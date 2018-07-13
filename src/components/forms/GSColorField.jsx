import React from 'react'
import ColorPicker from 'material-ui-color-picker'

import GSFormField from './GSFormField'

export default class GSColorField extends GSFormField {
  render() {
    return (
      <ColorPicker
        {...this.props}
        onChange={color => this.props.onChange(color)}
      />
    )
  }
}
