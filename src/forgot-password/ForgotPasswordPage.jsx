import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

import { forgotPassword, setForgotPasswordFormData } from './data/actions';
import { forgotPasswordResultSelector } from './data/selectors';
import ForgotPasswordAlert from './ForgotPasswordAlert';
import messages from './messages';
import { FormGroup } from '../common-components';
import { DEFAULT_STATE, LOGIN_PAGE, VALID_EMAIL_REGEX } from '../data/constants';
import { updatePathWithQueryParams, windowScrollTo } from '../data/utils';

const ForgotPasswordPage = (props) => {
  const platformName = getConfig().SITE_NAME;
  const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
  const {
    status, submitState, emailValidationError,
  } = props;

  const { formatMessage } = useIntl();
  const [email, setEmail] = useState(props.email);
  const [bannerEmail, setBannerEmail] = useState('');
  const [formErrors, setFormErrors] = useState('');
  const [validationError, setValidationError] = useState(emailValidationError);
  const navigate = useNavigate();

  useEffect(() => {
    sendPageEvent('login_and_registration', 'reset');
    sendTrackEvent('edx.bi.password_reset_form.viewed', { category: 'user-engagement' });
  }, []);

  useEffect(() => {
    setValidationError(emailValidationError);
  }, [emailValidationError]);

  useEffect(() => {
    if (status === 'complete') {
      setEmail('');
    }
  }, [status]);

  const getValidationMessage = (value) => {
    let error = '';

    if (value === '') {
      error = formatMessage(messages['forgot.password.empty.email.field.error']);
    } else if (!emailRegex.test(value)) {
      error = formatMessage(messages['forgot.password.page.invalid.email.message']);
    }

    return error;
  };

  const handleBlur = () => {
    props.setForgotPasswordFormData({ email, emailValidationError: getValidationMessage(email) });
  };

  const handleFocus = () => props.setForgotPasswordFormData({ emailValidationError: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setBannerEmail(email);

    const error = getValidationMessage(email);
    if (error) {
      setFormErrors(error);
      props.setForgotPasswordFormData({ email, emailValidationError: error });
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    } else {
      props.forgotPassword(email);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFB] relative overflow-hidden flex flex-col items-center justify-center font-sans">
      <Helmet>
        <title>{formatMessage(messages['forgot.password.page.title'],
          { siteName: getConfig().SITE_NAME })}
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
            {formatMessage(messages['sign.in.text'])}
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mb-3">
              {formatMessage(messages['forgot.password.page.heading'])}
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              {formatMessage(messages['forgot.password.page.instructions'])}
            </p>
          </div>

          <form id="forget-password-form" name="forget-password-form" onSubmit={handleSubmit}>
            <ForgotPasswordAlert email={bannerEmail} emailError={formErrors} status={status} />

            <FormGroup
              floatingLabel={formatMessage(messages['forgot.password.page.email.field.label'])}
              name="email"
              type="email"
              value={email}
              autoComplete="email"
              errorMessage={validationError}
              handleChange={(e) => setEmail(e.target.value)}
              handleBlur={handleBlur}
              handleFocus={handleFocus}
              helpText={[formatMessage(messages['forgot.password.email.help.text'], { platformName })]}
            />

            <button
              id="submit-forget-password"
              name="submit-forget-password"
              type="submit"
              disabled={submitState === 'pending'}
              className="wuti-btn-primary w-full mt-2 mb-6"
            >
              {submitState === 'pending' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {formatMessage(messages['forgot.password.submit.pending'])}
                </span>
              ) : formatMessage(messages['forgot.password.page.submit.button'])}
            </button>

            {/* Footer Help Links */}
            <div className="mt-8 text-center pt-6 border-t border-neutral-100">
              {(getConfig().LOGIN_ISSUE_SUPPORT_LINK) && (
                <a
                  href={getConfig().LOGIN_ISSUE_SUPPORT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-4 wuti-link"
                >
                  {formatMessage(messages['need.help.sign.in.text'])}
                </a>
              )}

              <p className="text-xs text-neutral-500 leading-relaxed">
                {formatMessage(messages['additional.help.text'], { platformName })}
                {' '}
                <a href={`mailto:${getConfig().INFO_EMAIL}`} className="wuti-link">
                  {getConfig().INFO_EMAIL}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ForgotPasswordPage.propTypes = {
  email: PropTypes.string,
  emailValidationError: PropTypes.string,
  forgotPassword: PropTypes.func.isRequired,
  setForgotPasswordFormData: PropTypes.func.isRequired,
  status: PropTypes.string,
  submitState: PropTypes.string,
};

ForgotPasswordPage.defaultProps = {
  email: '',
  emailValidationError: '',
  status: null,
  submitState: DEFAULT_STATE,
};

export default connect(
  forgotPasswordResultSelector,
  {
    forgotPassword,
    setForgotPasswordFormData,
  },
)(ForgotPasswordPage);
