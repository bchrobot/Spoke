import PropTypes from 'prop-types'
import React from 'react'
import { hot } from 'react-hot-loader'
import theme from '../styles/theme'
import { StyleSheet, css } from 'aphrodite'
import Form from 'react-formal'
import GSTextField from './forms/GSTextField'
import GSDateField from './forms/GSDateField'
import GSScriptField from './forms/GSScriptField'
import GSSelectField from './forms/GSSelectField'

Form.addInputTypes({
  string: GSTextField,
  number: GSTextField,
  date: GSDateField,
  email: GSTextField,
  script: GSScriptField,
  select: GSSelectField
})

const styles = StyleSheet.create({
  root: {
    ...theme.text.body,
    height: '100%'
  }
})

const App = ({ children }) => (
  <div className={css(styles.root)}>
    {children}
  </div>
)

App.propTypes = {
  children: PropTypes.object
}

export default hot(module)(App)
