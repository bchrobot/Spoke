import PropTypes from 'prop-types'
import React from 'react'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { StyleSheet, css } from 'aphrodite'
import { compose } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Snackbar from '@material-ui/core/Snackbar'

import { newLoadData } from './hoc/load-data'
import theme from '../styles/theme'
import Chart from '../components/Chart'
import TexterStats from '../components/TexterStats'

const inlineStyles = {
  stat: {
    margin: '10px 0',
    width: '100%',
    maxWidth: 400
  },
  count: {
    fontSize: '60px',
    paddingTop: '10px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  title: {
    textTransform: 'uppercase',
    textAlign: 'center',
    color: 'gray'
  }
}

const styles = StyleSheet.create({
  container: {
    ...theme.layouts.multiColumn.container,
    marginBottom: 40,
    justifyContent: 'space-around',
    flexWrap: 'wrap'
  },
  archivedBanner: {
    backgroundColor: '#FFFBE6',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '100%',
    padding: '15px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  header: {
    ...theme.text.header
  },
  flexColumn: {
    flex: 1,
    textAlign: 'right',
    display: 'flex'
  },
  question: {
    marginBottom: 24
  },
  rightAlign: {
    marginLeft: 'auto',
    marginRight: 0
  },
  inline: {
    display: 'inline-block',
    marginLeft: 20,
    verticalAlign: 'middle'
  },
  spacer: {
    marginRight: 20
  },
  secondaryHeader: {
    ...theme.text.secondaryHeader
  }
})

const Stat = ({ title, count }) => (
  <Card
    key={title}
    style={inlineStyles.stat}
  >
    <CardHeader
      title={count}
      titleStyle={inlineStyles.count}
    />
    <CardContent
      style={inlineStyles.title}
    >
      {title}
    </CardContent>
  </Card>
)

Stat.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number
}

class AdminCampaignStats extends React.Component {
  state = {
    exportMessageOpen: false,
    disableExportButton: false
  }

  renderSurveyStats() {
    const { interactionSteps } = this.props.data.campaign

    return interactionSteps.map((step) => {
      if (step.question === '') {
        return <div></div>
      }

      const totalResponseCount = step
        .question
        .answerOptions
        .reduce((prev, answer) => (prev + answer.responderCount), 0)
      return (
        <div key={step.id}>
          <div className={css(styles.secondaryHeader)}>{step.question.text}</div>
          {totalResponseCount > 0 ? (
            <div className={css(styles.container)}>
              <div className={css(styles.flexColumn)}>
                <Stat title='responses' count={totalResponseCount} />
              </div>
              <div className={css(styles.flexColumn)}>
                <div className={css(styles.rightAlign)}>
                  <Chart
                    data={step.question.answerOptions.map((answer) => [answer.value, answer.responderCount])}
                  />
                </div>
              </div>
            </div>
          ) : 'No responses yet'}
        </div>
      )
    })
  }

  renderCopyButton() {
    return (
      <Button
        variant='contained'
        label='Copy Campaign'
        onClick={async() => await this.props.mutations.copyCampaign(this.props.params.campaignId)}
      />
    )
  }

  render() {
    const { data, match } = this.props
    const { params } = match
    const { organizationId, campaignId } = params
    const campaign = data.campaign
    const { adminPerms } = this.props.match.params
    const currentExportJob = this.props.data.campaign.pendingJobs.filter((job) => job.jobType === 'export')[0]
    const shouldDisableExport = this.state.disableExportButton || currentExportJob

    const exportLabel = currentExportJob ? `Exporting (${currentExportJob.status}%)` : 'Export Data'

    return (
      <div>
        <div className={css(styles.container)}>
          {campaign.isArchived ? <div className={css(styles.archivedBanner)}>
            This campaign is archived
          </div> : ''}

          <div className={css(styles.header)}>
            {campaign.title}
            <br />
            Campaign ID: {campaign.id}
          </div>
          <div className={css(styles.flexColumn)}>
            <div className={css(styles.rightAlign)}>
              <div className={css(styles.inline)}>
                <div className={css(styles.inline)}>
                  {!campaign.isArchived ?
                    ( // edit
                    <Button
                      variant='contained'
                      onClick={() => this.props.history.push(`/admin/${organizationId}/campaigns/${campaignId}/edit`)}
                      label='Edit'
                    />
                  ) : null}
                  {adminPerms ?
                    [ // Buttons for Admins (and not Supervolunteers)
                      ( // export
                      <Button
                        variant='contained'
                        onClick={async () => {
                          this.setState({
                            exportMessageOpen: true,
                            disableExportButton: true
                          }, () => {
                            this.setState({
                              exportMessageOpen: true,
                              disableExportButton: false
                            })
                          })
                          await this.props.mutations.exportCampaign(campaignId)
                        }}
                        label={exportLabel}
                        disabled={shouldDisableExport}
                      />),
                      ( // unarchive
                      campaign.isArchived ?
                        <Button
                          variant='contained'
                          onClick={async () => await this.props.mutations.unarchiveCampaign(campaignId)}
                          label='Unarchive'
                        /> : null),
                      ( // archive
                      !campaign.isArchived ?
                        <Button
                          variant='contained'
                          onClick={async () => await this.props.mutations.archiveCampaign(campaignId)}
                          label='Archive'
                        /> : null),
                      ( // copy
                      <Button
                        variant='contained'
                        label='Copy Campaign'
                        onClick={async() => await this.props.mutations.copyCampaign(this.props.match.params.campaignId)}
                      />)
                    ] : null}
                </div>
              </div>
            </div>
          </div>

        </div>
        <div className={css(styles.container)}>
          <div className={css(styles.flexColumn, styles.spacer)}>
            <Stat title='Contacts' count={campaign.contactsCount} />
          </div>
          <div className={css(styles.flexColumn, styles.spacer)}>
            <Stat title='Texters' count={campaign.assignments.length} />
          </div>
          <div className={css(styles.flexColumn, styles.spacer)}>
            <Stat title='Sent' count={campaign.stats.sentMessagesCount} />
          </div>
          <div className={css(styles.flexColumn, styles.spacer)}>
            <Stat title='Replies' count={campaign.stats.receivedMessagesCount} />
          </div>
          <div className={css(styles.flexColumn)}>
            <Stat title='Opt-outs' count={campaign.stats.optOutsCount} />
          </div>
        </div>
        <div className={css(styles.header)}>Survey Questions</div>
        {this.renderSurveyStats()}

        <div className={css(styles.header)}>Texter stats</div>
        <div className={css(styles.secondaryHeader)}>% of first texts sent</div>
        <TexterStats
          campaign={campaign}
        />
        <Snackbar
          open={this.state.exportMessageOpen}
          message="Export started - we'll e-mail you when it's done"
          autoHideDuration={5000}
          onClose={() => {
            this.setState({ exportMessageOpen: false })
          }}
        />
      </div>
    )
  }
}

AdminCampaignStats.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  getCampaign: PropTypes.object,
  mutations: PropTypes.object
}

const queries = {
  getCampaign: {
    gql: gql`
      query getCampaign($campaignId: String!, $contactsFilter: ContactsFilter!) {
        campaign(id: $campaignId) {
          id
          title
          isArchived
          useDynamicAssignment
          assignments {
            id
            texter {
              id
              firstName
              lastName
            }
            unmessagedCount: contactsCount(contactsFilter:$contactsFilter)
            contactsCount
          }
          pendingJobs {
            id
            jobType
            assigned
            status
          }
          interactionSteps {
            id
            question {
              text
              answerOptions {
                value
                responderCount
              }
            }
          }
          contactsCount
          stats {
            sentMessagesCount
            receivedMessagesCount
            optOutsCount
          }
        }
      }
    `,
    options: (props) => ({
      variables: {
        campaignId: props.params.campaignId,
        contactsFilter: {
          messageStatus: 'needsMessage'
        }
      },
      pollInterval: 5000
    })
  }
}

const mutations = {
  archiveCampaign: {
    gql: gql`
      mutation archiveCampaign($campaignId: String!) {
        archiveCampaign(id: $campaignId) {
          id
          isArchived
        }
      }
    `
  },
  unarchiveCampaign: {
    gql: gql`
      mutation unarchiveCampaign($campaignId: String!) {
        unarchiveCampaign(id: $campaignId) {
          id
          isArchived
        }
      }
    `
  },
  exportCampaign: {
    gql: gql`
      mutation exportCampaign($campaignId: String!) {
        exportCampaign(id: $campaignId) {
          id
        }
      }
    `
  },
  copyCampaign: {
    gql: gql`
      mutation copyCampaign($campaignId: String!) {
        copyCampaign(id: $campaignId) {
          id
        }
      }
    `
  }
}

export default compose(
  newLoadData({ queries, mutations }),
  withRouter
)(AdminCampaignStats)
