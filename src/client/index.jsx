import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import MomentUtils from 'material-ui-pickers/utils/moment-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'
import { StyleSheet } from 'aphrodite'
import errorCatcher from './error-catcher'
import makeRoutes from '../routes'
import { ApolloProvider } from 'react-apollo'
import ApolloClientSingleton from '../network/apollo-client-singleton'
import { login, logout } from './auth-service'
import App from '../components/App'

window.onerror = (msg, file, line, col, error) => { errorCatcher(error) }
window.addEventListener('unhandledrejection', (event) => { errorCatcher(event.reason) })
window.AuthService = {
  login,
  logout
}

StyleSheet.rehydrate(window.RENDERED_CLASS_NAMES)

ReactDOM.render(
  <ApolloProvider client={ApolloClientSingleton}>
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <App>
        <BrowserRouter>
          {makeRoutes()}
        </BrowserRouter>
      </App>
    </MuiPickersUtilsProvider>
  </ApolloProvider>,
  document.getElementById('mount')
)
