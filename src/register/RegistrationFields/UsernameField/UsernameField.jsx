import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import validateUsername from './validator';
import { FormGroup } from '../../../common-components';
import {
  clearRegistrationBackendError,
  clearUsernameSuggestions,
  fetchRealtimeValidations,
} from '../../data/actions';
import messages from '../../messages';

/**
 * Username field wrapper. It accepts following handlers
 * - handleChange for setting value change and
 * - handleErrorChange for setting error
 *
 * It is responsible for
 * - Rendering username suggestions
 * - Setting and clearing username suggestions
 * - Performing username field validations
 * - clearing error on focus
 * - setting value on change
 */
const UsernameField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const {
    value,
    errorMessage,
    handleChange,
    handleErrorChange,
  } = props;

  let className = '';
  let suggestedUsernameDiv = null;
  let iconButton = null;
  const usernameSuggestions = useSelector(state => state.register.usernameSuggestions);
  const validationApiRateLimited = useSelector(state => state.register.validationApiRateLimited);

  /**
   * We need to remove the placeholder from the field, adding a space will do that.
   * This is needed because we are placing the username suggestions on top of the field.
   */
  useEffect(() => {
    if (usernameSuggestions.length && !value) {
      handleChange({ target: { name: 'username', value: ' ' } });
    }
  }, [handleChange, usernameSuggestions, value]);

  const handleOnBlur = (event) => {
    const { value: username } = event.target;
    const fieldError = validateUsername(username, formatMessage);
    if (fieldError) {
      handleErrorChange('username', fieldError);
    } else if (!validationApiRateLimited) {
      dispatch(fetchRealtimeValidations({ username }));
    }
  };

  const handleOnChange = (event) => {
    let username = event.target.value;
    if (username.length > 30) {
      return;
    }
    if (event.target.value.startsWith(' ')) {
      username = username.trim();
    }
    handleChange({ target: { name: 'username', value: username } });
  };

  const handleOnFocus = (event) => {
    const username = event.target.value;
    dispatch(clearUsernameSuggestions());
    // If we added a space character to username field to display the suggestion
    // remove it before user enters the input. This is to ensure user doesn't
    // have a space prefixed to the username.
    if (username === ' ') {
      handleChange({ target: { name: 'username', value: '' } });
    }
    handleErrorChange('username', '');
    dispatch(clearRegistrationBackendError('username'));
  };

  const handleSuggestionClick = (event, suggestion = '') => {
    event.preventDefault();
    handleErrorChange('username', ''); // clear error
    handleChange({ target: { name: 'username', value: suggestion } }); // to set suggestion as value
    dispatch(clearUsernameSuggestions());
  };

  const handleUsernameSuggestionClose = () => {
    handleChange({ target: { name: 'username', value: '' } }); // to remove space in field
    dispatch(clearUsernameSuggestions());
  };

  const suggestedUsernames = () => (
    <div className={className} role="listbox">
      <span className="text-gray username-suggestion--label">{formatMessage(messages['registration.username.suggestion.label'])}</span>
      <div className="username-scroll-suggested--form-field">
        {usernameSuggestions.map((username, index) => (
          <button
            type="button"
            name="username"
            className="username-suggestions--chip data-hj-suppress"
            autoComplete={props.autoComplete}
            key={`suggestion-${index.toString()}`}
            tabIndex={0}
            onClick={(e) => handleSuggestionClick(e, username)}
            role="option"
          >
            {username}
          </button>
        ))}
      </div>
      {iconButton}
    </div>
  );

  if (usernameSuggestions.length > 0 && errorMessage && value === ' ') {
    className = 'username-suggestions';
    iconButton = (
      <button
        type="button"
        aria-label={formatMessage(messages['registration.username.suggestion.close'])}
        onClick={() => handleUsernameSuggestionClose()}
        className="username-suggestions__close__button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    );
    suggestedUsernameDiv = suggestedUsernames();
  } else if (usernameSuggestions.length > 0 && value === ' ') {
    className = 'username-suggestions';
    iconButton = (
      <button
        type="button"
        aria-label={formatMessage(messages['registration.username.suggestion.close'])}
        onClick={() => handleUsernameSuggestionClose()}
        className="username-suggestions__close__button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    );
    suggestedUsernameDiv = suggestedUsernames();
  } else if (usernameSuggestions.length > 0 && errorMessage) {
    className = 'username-suggestions';
    suggestedUsernameDiv = suggestedUsernames();
  }
  return (
    <div className="username__form-group-wrapper">
      <FormGroup
        {...props}
        handleChange={handleOnChange}
        handleFocus={handleOnFocus}
        handleBlur={handleOnBlur}
      >
        {suggestedUsernameDiv}
      </FormGroup>
    </div>
  );
};

UsernameField.defaultProps = {
  errorMessage: '',
  autoComplete: null,
};

UsernameField.propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleErrorChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
};

export default UsernameField;
