import PropTypes from 'prop-types'
import React from 'react'
import { newLoadData } from './hoc/load-data'
import gql from 'graphql-tag'

import GSForm from '../components/forms/GSForm'
import GSSubmitButton from '../components/forms/GSSubmitButton'
import Form from 'react-formal'
import yup from 'yup'

const editUserVars = (props, userData) => ({
  userId: props.userId,
  organizationId: props.organizationId,
  userData
})

class UserEdit extends React.Component {

  constructor(props) {
    super(props)
    this.handleSave = this.handleSave.bind(this)
  }

  state = {
    finished: false,
    stepIndex: 0
  };

  async componentWillMount() {
    const user = await this.props.mutations.editUser(editUserVars(this.props, null))
  }

  async handleSave(formData) {
    const result = await this.props.mutations.editUser(editUserVars(this.props, formData))
    if (this.props.onRequestClose) {
      this.props.onRequestClose()
    }
  }

  render() {
    const user = this.props.editUser.editUser
    const formSchema = yup.object({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      cell: yup.string().required(),
      email: yup.string().email()
    })
    return (
      <GSForm
        schema={formSchema}
        onSubmit={this.handleSave}
        defaultValue={user}
      >
        <Form.Field label='First name' name='firstName' />
        <Form.Field label='Last name' name='lastName' />
        <Form.Field label='Email' name='email' />
        <Form.Field label='Cell Number' name='cell' />
        <Form.Button type='submit'>{this.props.saveLabel || 'Save'}</Form.Button>
      </GSForm>
    )
  }
}

UserEdit.propTypes = {
  mutations: PropTypes.object,
  history: PropTypes.object,
  userId: PropTypes.string,
  organizationId: PropTypes.string,
  onRequestClose: PropTypes.func,
  saveLabel: PropTypes.string
}

const mutations = {
  editUser: {
    gql: gql`
      mutation editUser($organizationId: String!, $userId: Int!, $userData: UserInput) {
        editUser(organizationId: $organizationId, userId: $userId, userData: $userData) {
          id,
          firstName,
          lastName,
          cell,
          email
        }
      }
    `
  }
}

export default newLoadData({ mutations })(UserEdit)
