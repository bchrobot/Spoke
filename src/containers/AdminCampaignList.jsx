import PropTypes from 'prop-types'
import React from 'react'
import CampaignList from './CampaignList'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import { newLoadData } from '../containers/hoc/load-data'
import { hasRole } from '../lib'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { compose } from 'react-apollo'
import theme from '../styles/theme'
import LoadingIndicator from '../components/LoadingIndicator'
import wrapMutations from './hoc/wrap-mutations'
import DropDownMenu from 'material-ui/DropDownMenu'
import { MenuItem } from 'material-ui/Menu'

class AdminCampaignList extends React.Component {
  state = {
    isCreating: false,
    campaignsFilter: {
      isArchived: false
    }
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

  handleFilterChange = (event, index, value) => {
    this.setState({
      campaignsFilter: {
        isArchived: value
      }
    })
  }

  renderFilters() {
    return (
      <DropDownMenu value={this.state.campaignsFilter.isArchived} onChange={this.handleFilterChange}>
        <MenuItem value={false} primaryText='Current' />
        <MenuItem value primaryText='Archived' />
      </DropDownMenu>
    )
  }
  render() {
    const { adminPerms } = this.props.match.params
    return (
      <div>
        {this.renderFilters()}
        {this.state.isCreating ? <LoadingIndicator /> : (
          <CampaignList
            campaignsFilter={this.state.campaignsFilter}
            organizationId={this.props.match.params.organizationId}
            adminPerms={adminPerms}
          />
        )}

        {adminPerms ?
         (<FloatingActionButton
           style={theme.components.floatingButton}
           onClick={this.handleClickNewButton}
         >
           <ContentAdd />
         </FloatingActionButton>
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
