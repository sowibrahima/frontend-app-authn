import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from './messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';

const ThirdPartyAuthAlert = (props) => {
  const { formatMessage } = useIntl();
  const { currentProvider, referrer } = props;
  const platformName = getConfig().SITE_NAME;
  let message;

  if (referrer === LOGIN_PAGE) {
    message = formatMessage(messages['login.third.party.auth.account.not.linked'], { currentProvider, platformName });
  } else {
    message = formatMessage(messages['register.third.party.auth.account.not.linked'], { currentProvider, platformName });
  }

  if (!currentProvider) {
    return null;
  }

  const isSuccess = referrer === REGISTER_PAGE;
  const alertStyles = isSuccess
    ? 'bg-green-50 border-green-200 text-green-800'
    : 'bg-yellow-50 border-yellow-200 text-yellow-800';

  return (
    <>
      <div id="tpa-alert" className={`w-full p-4 mb-5 border rounded-xl font-sans text-sm ${alertStyles}`}>
        {isSuccess ? (
          <h4 className="font-bold mb-1">{formatMessage(messages['tpa.alert.heading'])}</h4>
        ) : null}
        <p>{message}</p>
      </div>
      {isSuccess ? (
        <h4 className="mt-4 mb-4 font-bold text-neutral-900">{formatMessage(messages['registration.using.tpa.form.heading'])}</h4>
      ) : null}
    </>
  );
};

ThirdPartyAuthAlert.defaultProps = {
  currentProvider: '',
  referrer: LOGIN_PAGE,
};

ThirdPartyAuthAlert.propTypes = {
  currentProvider: PropTypes.string,
  referrer: PropTypes.string,
};

export default ThirdPartyAuthAlert;
