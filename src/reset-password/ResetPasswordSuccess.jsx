import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const ResetPasswordSuccess = () => {
  const { formatMessage } = useIntl();

  return (
    <div id="reset-password-success" className="mb-5 w-full bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3 font-sans text-sm">
      <svg className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h4 className="font-bold mb-1">
          {formatMessage(messages['reset.password.success.heading'])}
        </h4>
        <p className="leading-relaxed opacity-90">
          {formatMessage(messages['reset.password.success'])}
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordSuccess;
