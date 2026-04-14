import React, { useEffect } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { getAuthService } from '@edx/frontend-platform/auth';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import ChangePasswordPrompt from './ChangePasswordPrompt';
import {
  ACCOUNT_LOCKED_OUT,
  ALLOWED_DOMAIN_LOGIN_ERROR,
  FAILED_LOGIN_ATTEMPT,
  FORBIDDEN_REQUEST,
  INACTIVE_USER,
  INCORRECT_EMAIL_PASSWORD,
  INTERNAL_SERVER_ERROR,
  INVALID_FORM,
  NON_COMPLIANT_PASSWORD_EXCEPTION,
  NUDGE_PASSWORD_CHANGE,
  REQUIRE_PASSWORD_CHANGE,
  TPA_AUTHENTICATION_FAILURE,
} from './data/constants';
import messages from './messages';
import { windowScrollTo } from '../data/utils';

const LoginFailureMessage = (props) => {
  const { formatMessage } = useIntl();
  const authService = getAuthService();
  const {
    context,
    errorCode,
    errorCount, // This is used to trigger the useEffect, facilitating the scrolling to the top.
  } = props;

  useEffect(() => {
    windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [errorCode, errorCount]);

  if (!errorCode) {
    return null;
  }

  const linkStyles = 'text-brand hover:text-brand-burgundy underline decoration-brand/30 transition-colors font-medium';

  let resetLink = (
    <a href="/reset" className={linkStyles}>
      {formatMessage(messages['login.incorrect.credentials.error.reset.link.text'])}
    </a>
  );

  let errorMessage;
  switch (errorCode) {
    case NON_COMPLIANT_PASSWORD_EXCEPTION: {
      errorMessage = (
        <>
          <strong className="block mb-1">{formatMessage(messages['non.compliant.password.title'])}</strong>
          <p>{formatMessage(messages['non.compliant.password.message'])}</p>
        </>
      );
      break;
    }
    case FORBIDDEN_REQUEST:
      errorMessage = <p>{formatMessage(messages['login.rate.limit.reached.message'])}</p>;
      break;
    case INACTIVE_USER: {
      const supportLink = (
        <a href={context.supportLink} className={linkStyles}>
          {formatMessage(messages['contact.support.link'], { platformName: context.platformName })}
        </a>
      );
      errorMessage = (
        <p>
          <FormattedMessage
            id="login.inactive.user.error"
            defaultMessage="In order to sign in, you need to activate your account.{lineBreak}
            {lineBreak}We just sent an activation link to {email}. If you do not receive an email,
            check your spam folders or {supportLink}."
            values={{
              lineBreak: <br />,
              email: <strong>{context.email}</strong>,
              supportLink,
            }}
          />
        </p>
      );
      break;
    }
    case ALLOWED_DOMAIN_LOGIN_ERROR: {
      const url = `${getConfig().LMS_BASE_URL}/dashboard/?tpa_hint=${context.tpaHint}`;
      const tpaLink = (
        <a href={url} className={linkStyles}>
          {formatMessage(messages['tpa.account.link'], { provider: context.provider })}
        </a>
      );
      errorMessage = (
        <p>
          <FormattedMessage
            id="allowed.domain.login.error"
            description="Display this error message when staff user try to login through password"
            defaultMessage="As {allowedDomain} user, You must login with your {allowedDomain} {tpaLink}."
            values={{ allowedDomain: context.allowedDomain, tpaLink }}
          />
        </p>
      );
      break;
    }
    case INVALID_FORM:
      errorMessage = <p>{formatMessage(messages['login.form.invalid.error.message'])}</p>;
      break;
    case FAILED_LOGIN_ATTEMPT: {
      resetLink = (
        <a href="/reset" className={linkStyles}>
          {formatMessage(messages['login.incorrect.credentials.error.before.account.blocked.text'])}
        </a>
      );
      errorMessage = (
        <div className="space-y-2">
          <p>
            <FormattedMessage
              id="login.incorrect.credentials.error.attempts.text.1"
              description="Error message for incorrect email or password"
              defaultMessage="The username, email or password you entered is incorrect. You have {remainingAttempts} more sign in
                attempts before your account is temporarily locked."
              values={{ remainingAttempts: context.remainingAttempts }}
            />
          </p>
          <p>
            <FormattedMessage
              id="login.incorrect.credentials.error.attempts.text.2"
              description="Part of error message for incorrect email or password"
              defaultMessage="If you've forgotten your password, {resetLink}"
              values={{ resetLink }}
            />
          </p>
        </div>
      );
      break;
    }
    case ACCOUNT_LOCKED_OUT: {
      errorMessage = (
        <div className="space-y-2">
          <p>{formatMessage(messages['account.locked.out.message.1'])}</p>
          <p>
            <FormattedMessage
              id="account.locked.out.message.2"
              description="Part of message for when user account has been locked out after multiple failed login attempts"
              defaultMessage="To be on the safe side, you can {resetLink} before trying again."
              values={{ resetLink }}
            />
          </p>
        </div>
      );
      break;
    }
    case INCORRECT_EMAIL_PASSWORD:
      if (context.failureCount <= 1) {
        errorMessage = <p>{formatMessage(messages['login.incorrect.credentials.error'])}</p>;
      } else if (context.failureCount === 2) {
        errorMessage = (
          <p>
            <FormattedMessage
              id="login.incorrect.credentials.error.with.reset.link"
              defaultMessage="The username, email, or password you entered is incorrect. Please try again or {resetLink}."
              values={{ resetLink }}
            />
          </p>
        );
      }
      break;
    case NUDGE_PASSWORD_CHANGE:
      // Need to clear the CSRF token here to fetch a new one because token is already rotated after successful login.
      if (authService) {
        authService.getCsrfTokenService().clearCsrfTokenCache();
      }
      return (
        <ChangePasswordPrompt
          redirectUrl={context.redirectUrl}
          variant="nudge"
        />
      );
    case REQUIRE_PASSWORD_CHANGE:
      return <ChangePasswordPrompt />;
    case TPA_AUTHENTICATION_FAILURE:
      errorMessage = (
        <p>
          {formatMessage(messages['login.tpa.authentication.failure'], {
            platform_name: getConfig().SITE_NAME,
            lineBreak: <br />,
            errorMessage: context.errorMessage,
          })}
        </p>
      );
      break;
    case INTERNAL_SERVER_ERROR:
    default:
      errorMessage = <p>{formatMessage(messages['internal.server.error.message'])}</p>;
      break;
  }

  return (
    <div id="login-failure-alert" className="mb-5 w-full bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 font-sans text-sm">
      <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h4 className="font-bold mb-1">{formatMessage(messages['login.failure.header.title'])}</h4>
        <div className="text-red-700/90 leading-relaxed">
          {errorMessage}
        </div>
      </div>
    </div>
  );
};

LoginFailureMessage.defaultProps = {
  context: {},
};

LoginFailureMessage.propTypes = {
  context: PropTypes.shape({
    supportLink: PropTypes.string,
    platformName: PropTypes.string,
    tpaHint: PropTypes.string,
    provider: PropTypes.string,
    allowedDomain: PropTypes.string,
    remainingAttempts: PropTypes.number,
    failureCount: PropTypes.number,
    errorMessage: PropTypes.string,
    email: PropTypes.string,
    redirectUrl: PropTypes.string,
  }),
  errorCode: PropTypes.string.isRequired,
  errorCount: PropTypes.number.isRequired,
};

export default LoginFailureMessage;
