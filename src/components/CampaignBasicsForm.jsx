import PropTypes from 'prop-types'
import React from 'react'
import Form from 'react-formal'
import moment from 'moment'
import yup from 'yup'

import CampaignFormSectionHeading from './CampaignFormSectionHeading'
import GSForm from './forms/GSForm'

const FormSchema = {
  title: yup.string(),
  description: yup.string(),
  dueBy: yup.mixed(),
  logoImageUrl: yup.string().url().transform(value => !value ? '' : value).nullable(),
  primaryColor: yup.string().nullable(),
  introHtml: yup.string().nullable()
}

const EnsureCompletedFormSchema = {
  title: yup.string().required(),
  description: yup.string().required(),
  dueBy: yup.mixed().required(),
  logoImageUrl: yup.string().transform(value => !value ? '' : value).url().nullable(),
  primaryColor: yup.string().transform(value => !value ? '' : value).nullable(),
  introHtml: yup.string().transform(value => !value ? '' : value).nullable()
}

export default class CampaignBasicsForm extends React.Component {
  formValues() {
    return {
      ...this.props.formValues,
      dueBy: this.props.formValues.dueBy
    }
  }

  formSchema() {
    if (!this.props.ensureComplete) {
      return yup.object(FormSchema)
    }
    return yup.object(EnsureCompletedFormSchema)
  }

  render() {
    return (
      <div>
        <CampaignFormSectionHeading
          title="What's your campaign about?"
        />
        <GSForm
          schema={this.formSchema()}
          value={this.formValues()}
          onChange={this.props.onChange}
          onSubmit={this.props.onSubmit}
        >
          <Form.Field
            name='title'
            label='Title'
            placeholder='e.g. Election Day 2016'
            fullWidth
          />
          <Form.Field
            name='description'
            label='Description'
            placeholder='Get out the vote'
            fullWidth
          />
          <Form.Field
            name='dueBy'
            label='Due date'
            type='date'
            locale='en-US'
            shouldDisableDate={(date) => moment(date).diff(moment()) < 0}
            autoOk
            fullWidth
            utcOffset={0}
          />
          <Form.Field
            name='introHtml'
            label='Intro HTML'
            multiline
            fullWidth
          />
          <Form.Field
            name='logoImageUrl'
            label='Logo Image URL'
            placeholder='https://www.mysite.com/images/logo.png'
            fullWidth
          />
          <Form.Field
            name='primaryColor'
            label='Primary color'
            defaultValue={this.props.formValues.primaryColor || '#ffffff'}
            type='color'
          />
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
}

CampaignBasicsForm.propTypes = {
  formValues: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    dueBy: PropTypes.any,
    logoImageUrl: PropTypes.string,
    primaryColor: PropTypes.string,
    introHtml: PropTypes.string
  }),
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  saveLabel: PropTypes.string,
  saveDisabled: PropTypes.bool,
  ensureComplete: PropTypes.bool
}
