import React, { useEffect } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { windowScrollTo } from '../../data/utils';
import {
  FORBIDDEN_REQUEST,
  FORBIDDEN_USERNAME,
  INTERNAL_SERVER_ERROR,
  TPA_AUTHENTICATION_FAILURE,
  TPA_SESSION_EXPIRED,
} from '../data/constants';
import messages from '../messages';

const RegistrationFailureMessage = (props) => {
  const { formatMessage } = useIntl();
  const {
    context, errorCode, failureCount,
  } = props;

  useEffect(() => {
    windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [errorCode, failureCount]);

  if (!errorCode) {
    return null;
  }

  let errorMessage;
  switch (errorCode) {
    case INTERNAL_SERVER_ERROR:
      errorMessage = formatMessage(messages['registration.request.server.error']);
      break;
    case FORBIDDEN_REQUEST:
      errorMessage = formatMessage(messages['registration.rate.limit.error']);
      break;
    case TPA_AUTHENTICATION_FAILURE:
      errorMessage = formatMessage(messages['registration.tpa.authentication.failure'],
        {
          platform_name: getConfig().SITE_NAME,
          lineBreak: <br />,
          errorMessage: context.errorMessage,
        });
      break;
    case TPA_SESSION_EXPIRED:
      errorMessage = formatMessage(messages['registration.tpa.session.expired'], { provider: context.provider });
      break;
    case FORBIDDEN_USERNAME:
      errorMessage = formatMessage(messages['registration.forbidden.username']);
      break;
    default:
      errorMessage = formatMessage(messages['registration.empty.form.submission.error']);
      break;
  }

  return (
    <div id="validation-errors" className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center text-center w-full shadow-sm max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <span className="font-bold text-red-900 text-sm tracking-tight">
          {formatMessage(messages['registration.request.failure.header'])}
        </span>
      </div>
      <p className="text-sm text-red-700 leading-snug">{errorMessage}</p>
    </div>
  );
};

RegistrationFailureMessage.defaultProps = {
  context: {
    errorMessage: null,
  },
};

RegistrationFailureMessage.propTypes = {
  context: PropTypes.shape({
    provider: PropTypes.string,
    errorMessage: PropTypes.string,
  }),
  errorCode: PropTypes.string.isRequired,
  failureCount: PropTypes.number.isRequired,
};

export default RegistrationFailureMessage;
