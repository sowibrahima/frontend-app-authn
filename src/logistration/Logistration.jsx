import { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthService } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';

import BaseContainer from '../base-container';
import { ThirdPartyAuthProvider, useThirdPartyAuthContext } from '../common-components/components/ThirdPartyAuthContext';
import messages from '../common-components/messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import {
  getTpaHint, getTpaProvider, updatePathWithQueryParams,
} from '../data/utils';
import { LoginProvider } from '../login/components/LoginContext';
import LoginComponentSlot from '../plugin-slots/LoginComponentSlot';
import { RegistrationPage } from '../register';
import { RegisterProvider } from '../register/components/RegisterContext';

const LogistrationPageInner = ({
  selectedPage,
}) => {
  const tpaHint = getTpaHint();
  const {
    thirdPartyAuthContext,
    clearThirdPartyAuthErrorMessage,
  } = useThirdPartyAuthContext();

  const {
    providers,
    secondaryProviders,
  } = thirdPartyAuthContext;

  const { formatMessage } = useIntl();
  const [institutionLogin, setInstitutionLogin] = useState(false);
  const [key, setKey] = useState('');
  const navigate = useNavigate();
  const disablePublicAccountCreation = getConfig().ALLOW_PUBLIC_ACCOUNT_CREATION === false;
  const hideRegistrationLink = getConfig().SHOW_REGISTRATION_LINKS === false;

  useEffect(() => {
    const authService = getAuthService();
    if (authService) {
      authService.getCsrfTokenService()
        .getCsrfToken(getConfig().LMS_BASE_URL);
    }
  }, []);

  useEffect(() => {
    if (disablePublicAccountCreation) {
      navigate(updatePathWithQueryParams(LOGIN_PAGE));
    }
  }, [navigate, disablePublicAccountCreation]);

  const handleInstitutionLogin = (e) => {
    sendTrackEvent('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    if (typeof e === 'string') {
      sendPageEvent('login_and_registration', e === '/login' ? 'login' : 'register');
    } else {
      sendPageEvent('login_and_registration', e.target.dataset.eventName);
    }
    setInstitutionLogin(!institutionLogin);
  };

  const handleOnSelect = (tabKey, currentTab) => {
    if (tabKey === currentTab) {
      return;
    }
    sendTrackEvent(`edx.bi.${tabKey.replace('/', '')}_form.toggled`, { category: 'user-engagement' });
    clearThirdPartyAuthErrorMessage();
    setKey(tabKey);
  };

  const isValidTpaHint = () => {
    const { provider } = getTpaProvider(tpaHint, providers, secondaryProviders);
    return !!provider;
  };

  return (
    <BaseContainer>
      <div className="w-full flex-grow flex flex-col items-center justify-center">
        {key && (
          <Navigate to={updatePathWithQueryParams(key)} replace />
        )}
        <div id="main-content" className="w-full relative z-10 flex justify-center">
          {selectedPage === LOGIN_PAGE
            ? (
              <LoginComponentSlot
                institutionLogin={institutionLogin}
                handleInstitutionLogin={handleInstitutionLogin}
              />
            )
            : (
              <RegistrationPage
                institutionLogin={institutionLogin}
                handleInstitutionLogin={handleInstitutionLogin}
              />
            )}
        </div>
      </div>
    </BaseContainer>
  );
};

LogistrationPageInner.propTypes = {
  selectedPage: PropTypes.string.isRequired,
};

/**
 * Main Logistration Page component wrapped with providers
 */
const LogistrationPage = (props) => (
  <ThirdPartyAuthProvider>
    <RegisterProvider>
      <LoginProvider>
        <LogistrationPageInner {...props} />
      </LoginProvider>
    </RegisterProvider>
  </ThirdPartyAuthProvider>
);

export default LogistrationPage;
