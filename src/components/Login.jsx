import PropTypes from 'prop-types'
import React from 'react'
import { isClient } from '../lib'

class Login extends React.Component {
  componentDidMount() {
    const { location } = this.props
    if (isClient()) {
      window.AuthService.login(location.query.nextUrl)
    }
  }

  render() {
    const wrapperStyle = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
    const imageSource = 'https://zephyrforny.com/wp-content/themes/virgo_middleseat/img/logo-footer.svg'
    return (
      <div style={wrapperStyle}>
        <div style={{padding: '1em 1em'}}>
          <img src={imageSource} />
          <h3>Thanks for helping text for Zephyr!</h3>
          <ol>
            <li><a href="https://docs.google.com/document/d/120NEPXpGvPSxjxVQdOdN1kwzXc0JlJNbEaBd0otUeu8/edit" target="_blank">Review the How-To Guide Here</a></li>
            <li>
              Join our texting group chat to ask questions and request new assignments
              <ol>
                <li>Download WhatsApp for Mobile and Desktop and make an account</li>
                <li>Texting Support and Questions: <a href="http://bit.ly/ZephyrQandA" target="_blank">http://bit.ly/ZephyrQandA</a></li>
                <li>Texting Assignments: <a href="http://bit.ly/ZephyrAsk4Txts" target="_blank">http://bit.ly/ZephyrAsk4Txts</a></li>
              </ol>
            </li>
          </ol>
          <b style={{textAlign: 'center'}}>Feel free to text Adin at (802) 595 0286 with any pressing questions.</b>
        </div>
        <div id='login-wrapper'></div>
      </div>
    )
  }
}

Login.propTypes = {
  location: PropTypes.object
}

export default Login
