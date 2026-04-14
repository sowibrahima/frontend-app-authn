import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';

import { resetPassword, validateToken } from './data/actions';
import {
  FORM_SUBMISSION_ERROR, PASSWORD_RESET_ERROR, PASSWORD_VALIDATION_ERROR, TOKEN_STATE,
} from './data/constants';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import messages from './messages';
import ResetPasswordFailure from './ResetPasswordFailure';

import { PasswordField } from '../common-components';
import {
  LETTER_REGEX, LOGIN_PAGE, NUMBER_REGEX, RESET_PAGE,
} from '../data/constants';
import { getAllPossibleQueryParams, updatePathWithQueryParams, windowScrollTo } from '../data/utils';

const ResetPasswordPage = (props) => {
  const { formatMessage } = useIntl();
  const newPasswordError = formatMessage(messages['password.validation.message']);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [errorCode, setErrorCode] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (props.status !== TOKEN_STATE.PENDING && props.status !== PASSWORD_RESET_ERROR) {
      setErrorCode(props.status);
    }
    if (props.status === PASSWORD_VALIDATION_ERROR) {
      setFormErrors({ newPassword: newPasswordError });
    }
  }, [props.status, newPasswordError]);

  const validatePasswordFromBackend = async (password) => {
    let errorMessage = '';
    try {
      const payload = {
        reset_password_page: true,
        password,
      };
      errorMessage = await validatePassword(payload);
    } catch (err) {
      errorMessage = '';
    }
    setFormErrors({ ...formErrors, newPassword: errorMessage });
  };

  const validateInput = (name, value) => {
    switch (name) {
      case 'newPassword':
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          formErrors.newPassword = formatMessage(messages['password.validation.message']);
        } else {
          validatePasswordFromBackend(value);
        }
        break;
      case 'confirmPassword':
        if (!value) {
          formErrors.confirmPassword = formatMessage(messages['confirm.your.password']);
        } else if (value !== newPassword) {
          formErrors.confirmPassword = formatMessage(messages['passwords.do.not.match']);
        } else {
          formErrors.confirmPassword = '';
        }
        break;
      default:
        break;
    }
    setFormErrors({ ...formErrors });
    return !Object.values(formErrors).some(x => (x !== ''));
  };

  const handleOnBlur = (event) => {
    const { name, value } = event.target;
    validateInput(name, value);
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;

    setConfirmPassword(value);
    validateInput('confirmPassword', value);
  };

  const handleOnFocus = (e) => {
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isPasswordValid = validateInput('newPassword', newPassword);
    const isPasswordConfirmed = validateInput('confirmPassword', confirmPassword);

    if (isPasswordValid && isPasswordConfirmed) {
      const formPayload = {
        new_password1: newPassword,
        new_password2: confirmPassword,
      };
      const params = getAllPossibleQueryParams();
      props.resetPassword(formPayload, props.token, params);
    } else {
      setErrorCode(FORM_SUBMISSION_ERROR);
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };



  if (props.status === TOKEN_STATE.PENDING) {
    if (token) {
      props.validateToken(token);
      return (
        <div className="w-full min-h-screen bg-[#FDFDFB] flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      );
    }
  } else if (props.status === PASSWORD_RESET_ERROR) {
    navigate(updatePathWithQueryParams(RESET_PAGE));
  } else if (props.status === 'success') {
    navigate(updatePathWithQueryParams(LOGIN_PAGE));
  } else {
    return (
      <div className="w-full min-h-screen bg-[#FDFDFB] relative overflow-hidden flex flex-col items-center justify-center font-sans">
        <Helmet>
          <title>
            {formatMessage(messages['reset.password.page.title'], { siteName: getConfig().SITE_NAME })}
          </title>
        </Helmet>

        {/* Background design elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 z-0" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-action-gold/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 z-0" />

        <div className="auth-card w-full max-w-[550px] mx-auto relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <a href={getConfig().LMS_BASE_URL} className="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="wuti-text-brand group-hover:rotate-12 transition-transform duration-500 ease-out"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
              <span className="text-2xl font-bold text-neutral-900 tracking-tight">{getConfig().SITE_NAME}</span>
            </a>
          </div>

          <div className="wuti-auth-card p-8 sm:p-10">
            {/* Back link */}
            <button
              type="button"
              onClick={() => navigate(updatePathWithQueryParams(LOGIN_PAGE))}
              className="group flex items-center mb-6 wuti-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
              {formatMessage(messages['sign.in'])}
            </button>

            <ResetPasswordFailure errorCode={errorCode} errorMsg={props.errorMsg} />

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mb-3">
                {formatMessage(messages['reset.password'])}
              </h2>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                {formatMessage(messages['reset.password.page.instructions'])}
              </p>
            </div>

            <form id="set-reset-password-form" name="set-reset-password-form" onSubmit={handleSubmit}>
              <PasswordField
                name="newPassword"
                value={newPassword}
                handleChange={(e) => setNewPassword(e.target.value)}
                handleBlur={handleOnBlur}
                handleFocus={handleOnFocus}
                errorMessage={formErrors.newPassword}
                floatingLabel={formatMessage(messages['new.password.label'])}
              />

              <PasswordField
                name="confirmPassword"
                value={confirmPassword}
                handleChange={handleConfirmPasswordChange}
                handleFocus={handleOnFocus}
                errorMessage={formErrors.confirmPassword}
                showRequirements={false}
                floatingLabel={formatMessage(messages['confirm.password.label'])}
              />

              <button
                id="submit-new-password"
                name="submit-new-password"
                type="submit"
                disabled={props.status === 'pending'}
                className="wuti-btn-primary w-full mt-2"
              >
                {props.status === 'pending' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Traitement...
                  </span>
                ) : formatMessage(messages['reset.password'])}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

ResetPasswordPage.defaultProps = {
  status: null,
  token: null,
  errorMsg: null,
};

ResetPasswordPage.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  validateToken: PropTypes.func.isRequired,
  token: PropTypes.string,
  status: PropTypes.string,
  errorMsg: PropTypes.string,
};

export default connect(
  resetPasswordResultSelector,
  {
    resetPassword,
    validateToken,
  },
)(ResetPasswordPage);
