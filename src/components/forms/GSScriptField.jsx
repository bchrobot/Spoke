import React from 'react'
import omit from 'lodash/omit'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'

import { allScriptFields } from '../../lib/scripts'
import ScriptEditor from '../ScriptEditor'
import GSFormField from './GSFormField'

export default class GSScriptField extends GSFormField {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      script: props.value
    }
  }

  handleOpenDialog = (event) => {
    event.stopPropagation()
    event.preventDefault()
    this.setState({
      open: true
    }, () => this.refs.dialogScriptInput.focus())
  }

  handleCloseDialog = () => {
    this.setState({
      open: false,
      script: this.props.value
    })
  }

  handleSaveScript = () => {
    const value = this.state.script
    this.props.onChange(value)
    this.handleCloseDialog()
  }

  renderDialog() {
    const { open } = this.state
    const { customFields, sampleContact } = this.props
    const scriptFields = allScriptFields(customFields)

    return (
      <Dialog
        modal
        open={open}
        onRequestClose={this.handleCloseDialog}
      >
        <DialogContent>
          <ScriptEditor
            expandable
            ref='dialogScriptInput'
            scriptText={this.state.script}
            sampleContact={sampleContact}
            scriptFields={scriptFields}
            onChange={(val) => this.setState({ script: val })}
          />
        </DialogContent>
        <DialogActions>
          <Button
            label='Cancel'
            onClick={this.handleCloseDialog}
          />,
          <Button
            variant='contained'
            label='Done'
            onClick={this.handleSaveScript}
            primary
          />
        </DialogActions>
      </Dialog>
    )
  }

  render() {
    const cleanProps = omit(this.props, ['customFields'])
    return (
      <div>
        <TextField
          multiline
          onFocus={this.handleOpenDialog}
          onClick={event => event.stopPropagation()}
          {...cleanProps}
        />
        {this.renderDialog()}
      </div>
    )
  }
}
