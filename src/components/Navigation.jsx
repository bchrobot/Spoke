import PropTypes from 'prop-types'
import React from 'react'
import Paper from 'material-ui/Paper'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import { withRouter } from 'react-router'

const Navigation = function Navigation(props) {
  const { sections, switchListItem } = props

  return (
    <Paper
      rounded={false}
      zDepth={2}
      style={{
        height: '100%'
      }}
    >
      <List>
        {sections.map((section) => (
          <ListItem
            key={section.name}
            primaryText={section.name}
            onClick={() => props.history.push(section.url)}
          />
        ))}
        <Divider />
        {switchListItem}
      </List>
    </Paper>
  )
}

Navigation.propTypes = {
  sections: PropTypes.array,
  switchListItem: PropTypes.object,
  history: PropTypes.object
}

export default withRouter(Navigation)
