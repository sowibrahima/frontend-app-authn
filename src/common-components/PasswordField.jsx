import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from './messages';
import { LETTER_REGEX, NUMBER_REGEX } from '../data/constants';
import { clearRegistrationBackendError, fetchRealtimeValidations } from '../register/data/actions';
import { validatePasswordField } from '../register/data/utils';

const PasswordField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const validationApiRateLimited = useSelector(state => state.register.validationApiRateLimited);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const setHiddenTrue = () => setIsPasswordHidden(true);
  const setHiddenFalse = () => setIsPasswordHidden(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === props.name && e.relatedTarget?.name === 'passwordIcon') {
      return; // Do not run validations on password icon click
    }

    let passwordValue = value;
    if (name === 'passwordIcon') {
      // To validate actual password value when onBlur is triggered by focusing out the password icon
      passwordValue = props.value;
    }

    if (props.handleBlur) {
      props.handleBlur({
        target: {
          name: props.name,
          value: passwordValue,
        },
      });
    }

    setShowTooltip(props.showRequirements && false);
    if (props.handleErrorChange) { // If rendering from register page
      const fieldError = validatePasswordField(passwordValue, formatMessage);
      if (fieldError) {
        props.handleErrorChange('password', fieldError);
      } else if (!validationApiRateLimited) {
        dispatch(fetchRealtimeValidations({ password: passwordValue }));
      }
    }
  };

  const handleFocus = (e) => {
    if (e.target?.name === 'passwordIcon') {
      return; // Do not clear error on password icon focus
    }

    if (props.handleFocus) {
      props.handleFocus(e);
    }
    if (props.handleErrorChange) {
      props.handleErrorChange('password', '');
      dispatch(clearRegistrationBackendError('password'));
    }
    setTimeout(() => setShowTooltip(props.showRequirements && true), 150);
  };

  return (
    <div className={`relative ${props.className || 'mb-5'}`}>
      {/* Label */}
      <label
        htmlFor={props.name}
        className="block wuti-label mb-1.5"
      >
        {props.floatingLabel}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        <input
          id={props.name}
          className={`wuti-input wuti-input-password ${props.errorMessage ? 'wuti-input-error' : ''} ${props.borderClass}`}
          type={isPasswordHidden ? 'password' : 'text'}
          name={props.name}
          value={props.value}
          autoComplete={props.autoComplete}
          placeholder={props.placeholder}
          aria-invalid={props.errorMessage !== ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={props.handleChange}
          readOnly={props.readOnly}
        />

        {/* Password toggle icon */}
        <button
          type="button"
          name="passwordIcon"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={isPasswordHidden ? setHiddenFalse : setHiddenTrue}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors focus:outline-none"
          aria-label={isPasswordHidden ? formatMessage(messages['show.password']) : formatMessage(messages['hide.password'])}
        >
          {isPasswordHidden ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
          )}
        </button>
      </div>

      {/* Password requirements and error messages with reserved space to prevent layout shift */}
      <div className="mt-1 min-h-[20px] mb-2">
        {props.errorMessage ? (
          <p className="text-xs font-semibold text-red-600 tracking-wide animate-[fadeIn_0.2s_ease-out]">
            {props.errorMessage}
            {props.showScreenReaderText && <span className="sr-only">{formatMessage(messages['password.sr.only.helping.text'])}</span>}
          </p>
        ) : showTooltip && props.showRequirements ? (
          <div className="bg-white border border-neutral-100 shadow-sm rounded-lg p-3 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center text-sm mb-1.5">
              <span className={`mr-2 flex-shrink-0 ${LETTER_REGEX.test(props.value) ? 'text-green-500' : 'text-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              <span className="text-gray-600">{formatMessage(messages['one.letter'])}</span>
            </div>
            <div className="flex items-center text-sm mb-1.5">
              <span className={`mr-2 flex-shrink-0 ${NUMBER_REGEX.test(props.value) ? 'text-green-500' : 'text-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              <span className="text-gray-600">{formatMessage(messages['one.number'])}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className={`mr-2 flex-shrink-0 ${props.value.length >= 8 ? 'text-green-500' : 'text-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              <span className="text-gray-600">{formatMessage(messages['eight.characters'])}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

PasswordField.defaultProps = {
  borderClass: '',
  errorMessage: '',
  handleBlur: null,
  handleFocus: null,
  handleChange: () => { },
  handleErrorChange: null,
  showRequirements: true,
  showScreenReaderText: true,
  autoComplete: null,
  placeholder: null,
};

PasswordField.propTypes = {
  borderClass: PropTypes.string,
  errorMessage: PropTypes.string,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleFocus: PropTypes.func,
  handleChange: PropTypes.func,
  handleErrorChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  showRequirements: PropTypes.bool,
  value: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
  showScreenReaderText: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default PasswordField;
