import type from 'prop-types'
import React from 'react'
import Form from 'react-formal'
import yup from 'yup'
import { StyleSheet, css } from 'aphrodite'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import CheckIcon from '@material-ui/icons/Check'
import WarningIcon from '@material-ui/icons/Warning'
import ErrorIcon from '@material-ui/icons/Error'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import { parseCSV } from '../lib'
import theme from '../styles/theme'
import GSForm from '../components/forms/GSForm'
import CampaignFormSectionHeading from './CampaignFormSectionHeading'

const StyledCheckIcon = (props) => <CheckIcon {...props} style={{ fill: theme.colors.green }} />
const StyledWarningIcon = (props) => <WarningIcon {...props} style={{ fill: theme.colors.orange }} />
const StyledErrorIcon = (props) => <ErrorIcon {...props} style={{ fill: theme.colors.red }} />

const innerStyles = {
  button: {
    margin: '24px 5px 24px 0',
    fontSize: '10px'
  },
  nestedItem: {
    marginLeft: '12px'
  },
  nestedItemText: {
    fontSize: '12px'
  }
}

const styles = StyleSheet.create({
  csvHeader: {
    fontFamily: 'Courier',
    backgroundColor: theme.colors.lightGray,
    padding: 3
  },
  exampleImageInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0
  }
})

export default class CampaignContactsForm extends React.Component {
  state = {
    uploading: false,
    validationStats: null,
    contactUploadError: null,
    customFieldsOpen: false
  }

  validateSql = (sql) => {
    let errors = []
    if (!sql.startsWith('SELECT')) {
      errors.push('Must start with "SELECT"')
    }
    const requiredFields = ['first_name', 'last_name', 'cell']
    requiredFields.forEach((f) => {
      if (sql.indexOf(f) == -1) {
        errors.push('"' + f + '" is a required column')
      }
    })
    if (sql.indexOf(';') >= 0) {
      errors.push('Do not include a trailing (or any) ";"')
    }
    if (!errors.length) {
      this.setState({ contactSqlError: null })
    } else {
      this.setState({ contactSqlError: errors.join(', ') })
    }
  }

  handleUpload = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    this.setState({ uploading: true }, () => {
      parseCSV(file, this.props.optOuts, ({ contacts, customFields, validationStats, error }) => {
        if (error) {
          this.handleUploadError(error)
        } else if (contacts.length === 0) {
          this.handleUploadError('Upload at least one contact')
        } else if (contacts.length > 0) {
          this.handleUploadSuccess(validationStats, contacts, customFields)
        }
      })
    })
  }

  handleUploadError(error) {
    this.setState({
      validationStats: null,
      uploading: false,
      contactUploadError: error,
      contacts: null
    })
  }

  handleUploadSuccess(validationStats, contacts, customFields) {
    this.setState({
      validationStats,
      uploading: false,
      contactUploadError: null
    })
    const contactCollection = {
      contactsCount: contacts.length,
      contactSql: null,
      customFields,
      contacts
    }
    this.props.onChange(contactCollection)
  }

  renderContactStats() {
    const { customFields, contactsCount } = this.props.formValues

    if (contactsCount === 0) {
      return ''
    }

    return (
      <List>
        <ListSubheader component='div'>Uploaded</ListSubheader>
        <ListItem>
          {/* ListItemIcon is throwing a fit here for some reason */}
          {/* <ListItemIcon>
            <StyledCheckIcon />
          </ListItemIcon> */}
          <ListItemText primary={`${contactsCount} contacts`} />
        </ListItem>
        <ListItem
          button
          onClick={event => this.setState({ customFieldsOpen: !this.state.customFieldsOpen })}
        >
          {/* ListItemIcon is throwing a fit here for some reason */}
          {/* <ListItemIcon>
            <StyledCheckIcon />
          </ListItemIcon> */}
          <ListItemText primary={`${customFields.length} custom fields`} />
          {this.state.open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.state.customFieldsOpen} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            {customFields.map((field) => (
              <ListItem key={field} style={innerStyles.nestedItem}>
                <ListItemText primary={<span style={innerStyles.nestedItemText}>{field}</span>} />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    )
  }

  renderValidationStats() {
    if (!this.state.validationStats) {
      return ''
    }

    const { dupeCount, missingCellCount, invalidCellCount, optOutCount } = this.state.validationStats

    let stats = [
      [dupeCount, 'duplicates'],
      [missingCellCount, 'rows with missing numbers'],
      [invalidCellCount, 'rows with invalid numbers'],
      [optOutCount, 'opt-outs']
    ]
    stats = stats
      .filter(([count]) => count > 0)
      .map(([count, text]) => `${count} ${text} removed`)
    return (
      <List>
        <Divider />
        {stats.map((stat) => (
          <ListItem innerDivStyle={innerStyles.nestedItem}>
            <ListItemIcon>
              <StyledWarningIcon />
            </ListItemIcon>
            <ListItemText primary={stat} />
          </ListItem>
        ))}
      </List>
    )
  }

  renderUploadButton() {
    const { uploading } = this.state
    return (
      <div>
        <Button
          variant='contained'
          color='primary'
          disabled={uploading}
          onClick={() => document.querySelector('#contact-upload').click()}
        >
          {uploading ? 'Uploading...' : 'Upload contacts'}
        </Button>
        <input
          id='contact-upload'
          type='file'
          className={css(styles.exampleImageInput)}
          onChange={this.handleUpload}
          style={{ display: 'none' }}
        />
      </div>
    )
  }

  renderForm() {
    const { contactUploadError, contactSqlError } = this.state
    return (
      <div>
        {!this.props.jobResultMessage ? '' : (
            <div>
              <CampaignFormSectionHeading title='Job Outcome' />
              <div>{this.props.jobResultMessage}</div>
            </div>
        )}
        <GSForm
          schema={yup.object({
            contactSql: yup.string()
          })}
          onSubmit={(formValues) => {
            // sets values locally
            this.setState({ ...formValues })
            // triggers the parent to update values
            this.props.onChange({ ...formValues })
            // and now do whatever happens when clicking 'Next'
            this.props.onSubmit()
          }}
        >
          {this.renderUploadButton()}
          {!this.props.datawarehouseAvailable ? '' : (
            <div>
              <div>
              Instead of uploading contacts, as a super-admin, you can also create a SQL query directly from the
              data warehouse that will load in contacts.  The SQL requires some constraints:
              <ul>
                <li>Start the query with "SELECT"</li>
                <li>Do not include a trailing (or any) semicolon</li>
                <li>Three columns are necessary:
                    <span className={css(styles.csvHeader)}>first_name</span>,
                    <span className={css(styles.csvHeader)}>last_name</span>,
                    <span className={css(styles.csvHeader)}>cell</span>,
                </li>
                <li>Optional fields are:
                    <span className={css(styles.csvHeader)}>zip</span>,
                    <span className={css(styles.csvHeader)}>external_id</span>
                </li>
                <li>Make sure you make those names exactly possibly requiring an
                    <span className={css(styles.csvHeader)}>as field_name</span> sometimes.
                </li>
                <li>Other columns will be added to the customFields</li>
              </ul>
              </div>
              <Form.Field
                name='contactSql'
                type='textarea'
                rows='5'
                onChange={this.validateSql}
              />
              {contactSqlError ? (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <StyledErrorIcon />
                    </ListItemIcon>
                    <ListItemText primary={contactSqlError} />
                  </ListItem>
                </List>
               ) : ''}

            </div>
          )}
          {this.renderContactStats()}
          {this.renderValidationStats()}
          {contactUploadError ? (
            <List>
              <ListItem>
                <ListItemIcon>
                  <StyledErrorIcon />
                </ListItemIcon>
                <ListItemText primary={contactUploadError} />
              </ListItem>
            </List>
          ) : ''}
          <Form.Button
            type='submit'
            disabled={this.props.saveDisabled}
          >
            {this.props.saveLabel}
          </Form.Button>
        </GSForm>
      </div>
    )
  }

  render() {
    let subtitle = (
      <span>
        Your upload file should be in CSV format with column headings in
        the first row. You must include <span className={css(styles.csvHeader)}>firstName</span>,
        <span className={css(styles.csvHeader)}>lastName</span>, and
        <span className={css(styles.csvHeader)}>cell</span> columns.
        If you include a <span className={css(styles.csvHeader)}>zip</span> column,
        we'll use the zip to guess the contact's timezone for enforcing texting hours.
        An optional column to map the contact to a CRM is <span className={css(styles.csvHeader)}>external_id</span>
        Any additional columns in your file will be available as custom fields to use in your texting scripts.
      </span>
    )

    return (
      <div>
        <CampaignFormSectionHeading
          title='Who are you contacting?'
          subtitle={subtitle}
        />
        {this.renderForm()}
      </div>
    )
  }
}

CampaignContactsForm.propTypes = {
  datawarehouseAvailable: type.bool,
  onChange: type.func,
  optOuts: type.array,
  formValues: type.object,
  ensureComplete: type.bool,
  onSubmit: type.func,
  saveDisabled: type.bool,
  saveLabel: type.string,
  jobResultMessage: type.string
}
