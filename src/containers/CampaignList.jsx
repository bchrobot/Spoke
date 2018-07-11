import PropTypes from 'prop-types'
import React from 'react'
import { withRouter } from 'react-router'
import moment from 'moment'
import gql from 'graphql-tag'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import WarningIcon from '@material-ui/icons/Warning'
import ArchiveIcon from '@material-ui/icons/Archive'
import UnarchiveIcon from '@material-ui/icons/Unarchive'
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes'

import { newLoadData } from './hoc/load-data'
import theme from '../styles/theme'
import Chip from '../components/Chip'
import Empty from '../components/Empty'
import { compose } from 'react-apollo'


const campaignInfoFragment = `
  id
  title
  isStarted
  isArchived
  hasUnassignedContacts
  description
  dueBy
`

const inlineStyles = {
  past: {
    opacity: 0.6
  },
  warn: {
    color: theme.colors.orange
  },
  good: {
    color: theme.colors.green
  }
}

class CampaignList extends React.Component {
  renderRow(campaign) {
    const { isStarted, isArchived, hasUnassignedContacts } = campaign
    const { adminPerms } = this.props

    let listItemStyle = {}
    let leftIcon = ''
    if (isArchived) {
      listItemStyle = inlineStyles.past
    } else if (!isStarted || hasUnassignedContacts) {
      listItemStyle = inlineStyles.warn
      leftIcon = <WarningIcon />
    } else {
      listItemStyle = inlineStyles.good
    }

    const dueByMoment = moment(campaign.dueBy)
    const tags = []
    if (!isStarted) {
      tags.push('Not started')
    }

    if (hasUnassignedContacts) {
      tags.push('Unassigned contacts')
    }

    const primaryText = (
      <div>
        {campaign.title}
        {tags.map((tag) => <Chip key={tag} text={tag} />)}
      </div>
    )
    const secondaryText = (
      <span>
        <span>
          Campaign ID: {campaign.id}
          <br />
          {campaign.description}
          <br />
          {dueByMoment.isValid() ?
           dueByMoment.format('MMM D, YYYY') :
           'No due date set'}
        </span>
      </span>
    )


    const campaignUrl = `/admin/${this.props.organizationId}/campaigns/${campaign.id}`
    return (
      <ListItem
        style={listItemStyle}
        key={campaign.id}
        onClick={() => (!isStarted ?
          this.props.history.push(`${campaignUrl}/edit`) :
          this.props.history.push(campaignUrl))}
      >
        <ListItemIcon>
          {leftIcon}
        </ListItemIcon>
        <ListItemText primary={primaryText} secondary={secondaryText} />
        <ListItemSecondaryAction>
          {adminPerms ? (
            campaign.isArchived ? (
              <IconButton
                tooltip='Unarchive'
                onClick={async () => this.props.mutations.unarchiveCampaign({ campaignId: campaign.id })}
              >
                <UnarchiveIcon />
              </IconButton>
            ) : (
              <IconButton
                tooltip='Archive'
                onClick={async () => this.props.mutations.archiveCampaign({ campaignId: campaign.id })}
              >
                <ArchiveIcon />
              </IconButton>
            )
          ) : null}
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  render() {
    const { campaigns } = this.props.data.organization
    return campaigns.length === 0 ? (
      <Empty
        title='No campaigns'
        icon={<SpeakerNotesIcon />}
      />
    ) : (
      <List>
        {campaigns.map((campaign) => this.renderRow(campaign))}
      </List>
    )
  }
}

CampaignList.propTypes = {
  campaigns: PropTypes.arrayOf(
    PropTypes.shape({
      dueBy: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string
    })
  ),
  history: PropTypes.object,
  adminPerms: PropTypes.bool,
  organizationId: PropTypes.string,
  data: PropTypes.object,
  mutations: PropTypes.object
}

const queries = {
  data: {
    gql: gql`
      query adminGetCampaigns($organizationId: String!, $campaignsFilter: CampaignsFilter) {
        organization(id: $organizationId) {
          id
          campaigns(campaignsFilter: $campaignsFilter) {
            ${campaignInfoFragment}
          }
        }
      }
    `,
    options: (props) => ({
      fetchPolicy: 'network-only',
      variables: {
        organizationId: props.organizationId,
        campaignsFilter: props.campaignsFilter
      }
    })
  }
}

const mutations = {
  archiveCampaign: {
    gql: gql`
      mutation archiveCampaign($campaignId: String!) {
        archiveCampaign(id: $campaignId) {
          ${campaignInfoFragment}
        }
      }
    `
  },
  unarchiveCampaign: {
    gql: gql`
      mutation unarchiveCampaign($campaignId: String!) {
        unarchiveCampaign(id: $campaignId) {
          ${campaignInfoFragment}
        }
      }
    `
  }
}

export default compose(
  newLoadData({ queries, mutations }),
  withRouter
)(CampaignList)
