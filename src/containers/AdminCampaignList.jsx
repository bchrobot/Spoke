import PropTypes from 'prop-types'
import React from 'react'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { compose } from 'react-apollo'

import Button from '@material-ui/core/Button'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
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
        isArchived: false
      }
    }

    this.handleClickNewButton = this.handleClickNewButton.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
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

  handleSelectChange = event => {
    const campaignsFilter = {
      isArchived: event.target.value === 'archived'
    }
    this.setState({ campaignsFilter })
  }

  renderFilters() {
    const { campaignsFilter } = this.state
    const { anchorEl, isArchived } = campaignsFilter
    return (
      <FormControl>
        <InputLabel htmlFor='campaign-filter'>Campaign State</InputLabel>
        <Select
          value={this.state.campaignsFilter.isArchived ? 'archived' : 'current'}
          onChange={this.handleSelectChange}
          inputProps={{
            name: 'campaign-filter',
            id: 'campaign-filter',
          }}
        >
          <MenuItem value='current'>Current</MenuItem>
          <MenuItem value='archived'>Archived</MenuItem>
        </Select>
      </FormControl>
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
