import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { ACCOUNT_ACTIVATION_MESSAGE } from './data/constants';
import messages from './messages';

const AccountActivationMessage = ({ messageType }) => {
  const { formatMessage } = useIntl();

  if (!messageType) {
    return null;
  }

  const activationOrConfirmation = getConfig().MARKETING_EMAILS_OPT_IN ? 'confirmation' : 'activation';

  let activationMessage;
  let heading;
  let alertStyles = '';
  let IconSVG;

  switch (messageType) {
    case ACCOUNT_ACTIVATION_MESSAGE.SUCCESS: {
      heading = formatMessage(messages[`account.${activationOrConfirmation}.success.message.title`]);
      activationMessage = <span>{formatMessage(messages[`account.${activationOrConfirmation}.success.message`])}</span>;
      alertStyles = 'bg-green-50 border-green-200 text-green-800';
      IconSVG = (
        <svg className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.INFO: {
      activationMessage = formatMessage(messages[`account.${activationOrConfirmation}.info.message`]);
      alertStyles = 'bg-blue-50 border-blue-200 text-blue-800';
      IconSVG = (
        <svg className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.ERROR: {
      const supportLink = (
        <a
          href={getConfig().ACTIVATION_EMAIL_SUPPORT_LINK}
          className="underline decoration-red-300 hover:text-red-900 transition-colors font-medium"
        >
          {formatMessage(messages['account.activation.support.link'])}
        </a>
      );

      heading = formatMessage(messages[`account.${activationOrConfirmation}.error.message.title`]);
      activationMessage = (
        <FormattedMessage
          id="account.activation.error.message"
          defaultMessage="Something went wrong, please {supportLink} to resolve this issue."
          description="Account activation error message"
          values={{ supportLink }}
        />
      );
      alertStyles = 'bg-red-50 border-red-200 text-red-800';
      IconSVG = (
        <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    }
    default:
      break;
  }

  return activationMessage ? (
    <div id="account-activation-message" className={`mb-5 w-full p-4 border rounded-xl flex items-start gap-3 font-sans text-sm ${alertStyles}`}>
      {IconSVG}
      <div>
        {heading && <h4 className="font-bold mb-1">{heading}</h4>}
        <div className="leading-relaxed opacity-90">
          {activationMessage}
        </div>
      </div>
    </div>
  ) : null;
};

AccountActivationMessage.propTypes = {
  messageType: PropTypes.string,
};

AccountActivationMessage.defaultProps = {
  messageType: null,
};

export default AccountActivationMessage;
