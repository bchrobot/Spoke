// Based on react-spoke integration: https://material-ui.com/demos/autocomplete/#downshift

import React from 'react'
import PropTypes from 'prop-types'
import Downshift from 'downshift'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
        },
        ...InputProps,
      }}
      {...other}
    />
  )
}

function renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }) {
  const isHighlighted = highlightedIndex === index
  const isSelected = (selectedItem || '').indexOf(suggestion.value) > -1

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.value}
      selected={isHighlighted}
      component='div'
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.label}
    </MenuItem>
  )
}
renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.number,
  index: PropTypes.number,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string,
  suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired
}

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative'
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  inputRoot: {
    flexWrap: 'wrap'
  }
})

const getSuggestions = (options, inputValue) => {
  let count = 0

  return options.filter(suggestion => {
    const keep =
      (!inputValue || suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1) &&
      count < 5

    if (keep) {
      count += 1
    }

    return keep
  })
}

const IntegrationReactSelect = (props) => {
  const { classes, options, placeholder, handleChange, otherProps } = props

  return (
    <Downshift
      onChange={option => handleChange(option.value)}
      itemToString={item => (item ? item.label : '')}
      {...otherProps}
    >
      {({ getInputProps, getItemProps, isOpen, inputValue, selectedItem, highlightedIndex }) => (
        <div className={classes.container}>
          {renderInput({
            fullWidth: true,
            classes,
            InputProps: getInputProps({
              placeholder: placeholder,
              id: 'react-select-single',
            }),
          })}
          {isOpen ? (
            <Paper className={classes.paper} square>
              {getSuggestions(options, inputValue).map((suggestion, index) =>
                renderSuggestion({
                  suggestion,
                  index,
                  itemProps: getItemProps({ item: suggestion }),
                  highlightedIndex,
                  selectedItem,
                }),
              )}
            </Paper>
          ) : null}
        </div>
      )}
    </Downshift>
  )
}

IntegrationReactSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.array.isRequired,
  handleChange: PropTypes.func
};

export default withStyles(styles)(IntegrationReactSelect);
