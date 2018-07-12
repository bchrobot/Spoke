import PropTypes from 'prop-types'
import React from 'react'
import { Query } from "react-apollo"
import { StyleSheet, css } from 'aphrodite'
import gql from 'graphql-tag'

import { hasRole } from '../lib'
import LoadingIndicator from '../components/LoadingIndicator'
import { CurrentUserProvider } from './lib/CurrentUserContext'
import TopNav from './TopNav'
import AdminNavigation from '../containers/AdminNavigation'
import theme from '../styles/theme'

const styles = StyleSheet.create({
  container: {
    ...theme.layouts.multiColumn.container
  },
  sideBar: {
    width: 256,
    minHeight: 'calc(100vh - 56px)'
  },
  content: {
    ...theme.layouts.multiColumn.flexColumn,
    paddingLeft: '2rem',
    paddingRight: '2rem',
    margin: '24px auto'
  }
})

const GET_USER_ROLES = gql`
  query getCurrentUserRoles($organizationId: String!) {
    currentUser {
      id
      roles(organizationId: $organizationId)
    }
  }
`

class AdminDashboard extends React.Component {
  componentWillMount() {
    this.props.onEnter()
  }

  urlFromPath(path) {
    const organizationId = this.props.match.params.organizationId
    return `/admin/${organizationId}/${path}`
  }

  renderNavigation(sections) {
    const organizationId = this.props.match.params.organizationId
    if (!organizationId) {
      return ''
    }
    return (
      <div className={css(styles.sideBar)}>
        <AdminNavigation
          organizationId={organizationId}
          sections={sections}
        />
      </div>
    )
  }

  render() {
    const organizationId = this.props.match.params.organizationId

    return (
      <Query query={GET_USER_ROLES} variables={{organizationId}}>
        {({ loading, error, data }) => {
          if (loading) return <LoadingIndicator />

          const { location, children, match } = this.props
          const { params } = match
          const { roles } = data.currentUser

          const sections = [{
            name: 'Campaigns',
            path: 'campaigns',
            role: 'SUPERVOLUNTEER'
          }, {
            name: 'People',
            path: 'people',
            role: 'ADMIN'
          }, {
            name: 'Optouts',
            path: 'optouts',
            role: 'ADMIN'
          }, {
            name: 'Incoming Messages',
            path: 'incoming',
            role: 'SUPERVOLUNTEER'
          }, {
            name: 'Settings',
            path: 'settings',
            role: 'SUPERVOLUNTEER'
          }]

          let currentSection = sections.filter(section => {
            return location.pathname.match(`/${section.path}`)
          })

          currentSection = currentSection.length > 0 ? currentSection.shift() : null
          const title = currentSection ? currentSection.name : 'Admin'
          const backToURL = currentSection &&
              location.pathname.split('/').pop() !== currentSection.path ?
                  this.urlFromPath(currentSection.path) :
                  null

          // HACK: Setting adminPerms helps us hide non-supervolunteer functionality
          const userContext = {
            user: data.currentUser,
            adminPerms: hasRole('ADMIN', data.currentUser.roles || [])
          }

          return (
            <CurrentUserProvider value={userContext}>
              <TopNav title={title} backToURL={backToURL} orgId={params.organizationId} />
              <div className={css(styles.container)}>
                {this.renderNavigation(sections.filter((s) => hasRole(s.role, roles)))}
                <div className={css(styles.content)}>
                  {children}
                </div>
              </div>
            </CurrentUserProvider>
          )
        }}
      </Query>
    )
  }
}

AdminDashboard.propTypes = {
  match: PropTypes.object,
  onEnter: PropTypes.func,
  children: PropTypes.object,
  location: PropTypes.object
}

export default AdminDashboard
