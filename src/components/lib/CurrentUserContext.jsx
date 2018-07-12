import React from 'react'

const CurrentUserContext = React.createContext({
  user: {},
  adminPerms: false
})

const { Provider, Consumer } = CurrentUserContext

export const CurrentUserProvider = Provider
export const CurrentUserConsumer = Consumer

export const withCurrentUser = (WrappedComponent) => {
  class HOC extends React.Component {
    render() {
      return (
        <CurrentUserConsumer>
          {currentUser => <WrappedComponent {...this.props} currentUser={currentUser} />}
        </CurrentUserConsumer>
      )
    }
  }
  
  return HOC
}
