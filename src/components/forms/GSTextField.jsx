import React from 'react'
import TextField from '@material-ui/core/TextField'
import omit from 'lodash/omit'

import GSFormField from './GSFormField'

export default class GSTextField extends GSFormField {
  render() {
    const value = this.props.value || ''
    const cleanProps = omit(this.props, ['onChange', 'value'])
    return (
      <TextField
        type='text'
        value={value}
        onFocus={(event) => event.target.select()}
        onChange={(event) => {
          this.props.onChange(event.target.value)
        }}
        {...cleanProps}
      />
    )
  }
}
