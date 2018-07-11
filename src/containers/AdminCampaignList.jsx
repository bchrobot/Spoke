import PropTypes from 'prop-types'
import React from 'react'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { compose } from 'react-apollo'

import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AddIcon from '@material-ui/icons/Add'

import { hasRole } from '../lib'
import { newLoadData } from '../containers/hoc/load-data'
import theme from '../styles/theme'
import LoadingIndicator from '../components/LoadingIndicator'
import CampaignList from './CampaignList'

class AdminCampaignList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isCreating: false,
      campaignsFilter: {
        anchorEl: null,
        isArchived: false
      }
    }

    this.handleClickNewButton = this.handleClickNewButton.bind(this)
    this.handleClickFilter = this.handleClickFilter.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleCloseFilter = this.handleCloseFilter.bind(this)
  }

  handleClickNewButton = async () => {
    const { organizationId } = this.props.match.params
    this.setState({ isCreating: true })
    const campaign = {
      title: 'New Campaign',
      description: '',
      dueBy: null,
      organizationId,
      contacts: [],
      interactionSteps: {
        script: ''
      }
    }
    // Not sure if you can actually get the mutation results like this in the new version
    const newCampaign = await this.props.mutations.createCampaign({ campaign })
    if (newCampaign.errors) {
      alert('There was an error creating your campaign')
      throw new Error(newCampaign.errors)
    }

    this.props.history.push(
      `/admin/${organizationId}/campaigns/${newCampaign.data.createCampaign.id}/edit?new=true`
    )
  }

  handleClickFilter(event) {
    const { campaignsFilter } = this.state
    campaignsFilter.anchorEl = event.currentTarget
    this.setState({ campaignsFilter })
  }

  handleFilterChange = isArchived => event => {
    const campaignsFilter = {
      isArchived,
      anchorEl: null
    }
    this.setState({ campaignsFilter })
  }

  handleCloseFilter() {
    const { campaignsFilter } = this.state
    campaignsFilter.anchorEl = null
    this.setState({ campaignsFilter })
  }

  renderFilters() {
    const { campaignsFilter } = this.state
    const { anchorEl, isArchived } = campaignsFilter
    return (
      <div>
        <List component='nav'>
          <ListItem
            button
            aria-haspopup='true'
            aria-controls='campaign-state-menu'
            aria-label='Campaign state'
            onClick={this.handleClickFilter}
          >
            <ListItemText
              primary='Campaign state'
              secondary={isArchived ? 'Archived' : 'Current'}
            />
          </ListItem>
        </List>
        <Menu
          id='campaign-state-menu'
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleCloseFilter}
        >
          <MenuItem
            selected={!isArchived}
            onClick={this.handleFilterChange(false)}
          >
            Current
          </MenuItem>
          <MenuItem
            selected={isArchived}
            onClick={this.handleFilterChange(true)}
          >
            Archived
          </MenuItem>
        </Menu>
      </div>
    )
  }

  render() {
    const { adminPerms } = this.props.match.params
    const { isArchived } = this.state.campaignsFilter
    return (
      <div>
        {this.renderFilters()}
        {this.state.isCreating ? <LoadingIndicator /> : (
          <CampaignList
            campaignsFilter={{ isArchived }}
            organizationId={this.props.match.params.organizationId}
            adminPerms={adminPerms}
          />
        )}

        {adminPerms ?
         (<Button
           variant='fab'
           style={theme.components.floatingButton}
           onClick={this.handleClickNewButton}
         >
           <AddIcon />
         </Button>
         ) : null}
      </div>
    )
  }
}

AdminCampaignList.propTypes = {
  match: PropTypes.object,
  mutations: PropTypes.object,
  history: PropTypes.object
}

const mutations = {
  createCampaign: {
    gql: gql`
      mutation createBlankCampaign($campaign: CampaignInput!) {
        createCampaign(campaign: $campaign) {
          id
        }
      }
    `
  }
}

export default compose(
  newLoadData({ mutations }),
  withRouter
)(AdminCampaignList)
