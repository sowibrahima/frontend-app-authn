import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import gsap from 'gsap';
import { ArrowRight, Award } from 'lucide-react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { Link, useNavigate } from 'react-router-dom';

import {
  InstitutionLogistration,
  RedirectLogistration,
  ThirdPartyAuthAlert,
} from '../common-components';
import AccountActivationMessage from './AccountActivationMessage';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import ThirdPartyAuth from '../common-components/ThirdPartyAuth';
import { PENDING_STATE, REGISTER_PAGE, RESET_PAGE } from '../data/constants';
import {
  getActivationStatus,
  getAllPossibleQueryParams,
  getTpaHint,
  getTpaProvider,
  updatePathWithQueryParams,
} from '../data/utils';
import ResetPasswordSuccess from '../reset-password/ResetPasswordSuccess';
import { backupLoginFormBegin, dismissPasswordResetBanner, loginRequest } from './data/actions';
import { INVALID_FORM, TPA_AUTHENTICATION_FAILURE } from './data/constants';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';

const LoginPage = ({
  institutionLogin,
  handleInstitutionLogin,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backupFormState = useCallback((data) => dispatch(backupLoginFormBegin(data)), [dispatch]);
  const getTPADataFromBackend = useCallback(() => dispatch(getThirdPartyAuthContext()), [dispatch]);
  const {
    backedUpFormData,
    loginErrorCode,
    loginErrorContext,
    loginResult,
    shouldBackupState,
    showResetPasswordSuccessBanner,
    submitState,
    thirdPartyAuthContext,
    thirdPartyAuthApiStatus,
  } = useSelector((state) => ({
    backedUpFormData: state.login.loginFormData,
    loginErrorCode: state.login.loginErrorCode,
    loginErrorContext: state.login.loginErrorContext,
    loginResult: state.login.loginResult,
    shouldBackupState: state.login.shouldBackupState,
    showResetPasswordSuccessBanner: state.login.showResetPasswordSuccessBanner,
    submitState: state.login.submitState,
    thirdPartyAuthContext: thirdPartyAuthContextSelector(state),
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
  }));
  const {
    providers,
    currentProvider,
    secondaryProviders,
    finishAuthUrl,
    platformName,
    errorMessage: thirdPartyErrorMessage,
  } = thirdPartyAuthContext;
  const { formatMessage } = useIntl();
  const activationMsgType = getActivationStatus();
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [errorCode, setErrorCode] = useState({
    type: '',
    count: 0,
    context: {},
  });
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });
  const tpaHint = getTpaHint();
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.auth-element', {
        y: 15,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.1,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    sendPageEvent('login_and_registration', 'login');
  }, []);

  useEffect(() => {
    const payload = { ...queryParams };
    if (tpaHint) {
      payload.tpa_hint = tpaHint;
    }
    getTPADataFromBackend(payload);
  }, [queryParams, tpaHint, getTPADataFromBackend]);
  /**
   * Backup the login form in redux when login page is toggled.
   */
  useEffect(() => {
    if (shouldBackupState) {
      backupFormState({
        formFields: { ...formFields },
        errors: { ...errors },
      });
    }
  }, [backupFormState, shouldBackupState, formFields, errors]);

  useEffect(() => {
    if (loginErrorCode) {
      setErrorCode(prevState => ({
        type: loginErrorCode,
        count: prevState.count + 1,
        context: { ...loginErrorContext },
      }));
    }
  }, [loginErrorCode, loginErrorContext]);

  useEffect(() => {
    if (thirdPartyErrorMessage) {
      setErrorCode((prevState) => ({
        type: TPA_AUTHENTICATION_FAILURE,
        count: prevState.count + 1,
        context: {
          errorMessage: thirdPartyErrorMessage,
        },
      }));
    }
  }, [thirdPartyErrorMessage]);

  const validateFormFields = (payload) => {
    const {
      emailOrUsername,
      password,
    } = payload;
    const fieldErrors = { ...errors };

    if (emailOrUsername === '') {
      fieldErrors.emailOrUsername = formatMessage(messages['email.validation.message']);
    } else if (emailOrUsername.length < 2) {
      fieldErrors.emailOrUsername = formatMessage(messages['username.or.email.format.validation.less.chars.message']);
    }
    if (password === '') {
      fieldErrors.password = formatMessage(messages['password.validation.message']);
    }

    return { ...fieldErrors };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitState === PENDING_STATE) { return; }

    if (showResetPasswordSuccessBanner) {
      dispatch(dismissPasswordResetBanner());
    }

    const formData = { ...formFields };
    const validationErrors = validateFormFields(formData);
    if (validationErrors.emailOrUsername || validationErrors.password) {
      setErrors({ ...validationErrors });
      setErrorCode(prevState => ({
        type: INVALID_FORM,
        count: prevState.count + 1,
        context: {},
      }));
      return;
    }

    // add query params to the payload
    const payload = {
      email_or_username: formData.emailOrUsername,
      password: formData.password,
      ...queryParams,
    };
    dispatch(loginRequest(payload));
  };

  const handleOnChange = (event) => {
    const {
      name,
      value,
    } = event.target;
    setFormFields(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOnFocus = (event) => {
    const { name } = event.target;
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: '',
    }));
  };
  const trackForgotPasswordLinkClick = () => {
    sendTrackEvent('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
  };

  const {
    provider,
    skipHintedLogin,
  } = getTpaProvider(tpaHint, providers, secondaryProviders);

  if (tpaHint) {
    if (thirdPartyAuthApiStatus === PENDING_STATE) {
      return <Skeleton height={36} />;
    }

    if (skipHintedLogin) {
      window.location.href = getConfig().LMS_BASE_URL + provider.loginUrl;
      return null;
    }

    if (provider) {
      return <EnterpriseSSO provider={provider} />;
    }
  }

  if (institutionLogin) {
    return (
      <InstitutionLogistration
        secondaryProviders={secondaryProviders}
        headingTitle={formatMessage(messages['institution.login.page.title'])}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['login.page.title'], { siteName: getConfig().SITE_NAME })}</title>
      </Helmet>
      <RedirectLogistration
        success={loginResult.success}
        redirectUrl={loginResult.redirectUrl}
        finishAuthUrl={finishAuthUrl}
      />

      <div ref={containerRef} className="w-full flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">

        <div className="auth-card w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <a href={getConfig().LMS_BASE_URL} className="flex items-center gap-2 group">
              <Award className="w-10 h-10 text-brand group-hover:rotate-12 transition-transform duration-500 ease-out" />
              <span className="text-2xl font-bold text-neutral-900 tracking-tight">{getConfig().SITE_NAME}</span>
            </a>
          </div>

          {/* Error and Alert Messages */}
          <div className="mb-4">
            <LoginFailureMessage
              errorCode={errorCode.type}
              errorCount={errorCode.count}
              context={errorCode.context}
            />
            <ThirdPartyAuthAlert
              currentProvider={currentProvider}
              platformName={platformName}
            />
            <AccountActivationMessage
              messageType={activationMsgType}
            />
            {showResetPasswordSuccessBanner && <ResetPasswordSuccess />}
          </div>

          {/* Form Container */}
          <div className="wuti-auth-card px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="auth-element text-3xl font-bold text-neutral-900 tracking-tight mb-2">
                Bon retour !
              </h2>
              <p className="auth-element text-sm font-mono text-neutral-500">
                Connectez-vous pour accéder à vos formations.
              </p>
            </div>

            <form className="space-y-6" id="sign-in-form" name="sign-in-form" onSubmit={handleSubmit}>
              {/* Email field */}
              <div className="auth-element space-y-2">
                <label className="wuti-label">Adresse e-mail</label>
                <input
                  type="text"
                  name="emailOrUsername"
                  value={formFields.emailOrUsername}
                  autoComplete="on"
                  onChange={handleOnChange}
                  onFocus={handleOnFocus}
                  placeholder="prénom.nom@exemple.com"
                  className={`wuti-input ${errors.emailOrUsername ? 'wuti-input-error' : ''}`}
                />
                {errors.emailOrUsername && <span className="text-xs text-red-500 mt-1 block">{errors.emailOrUsername}</span>}
              </div>

              {/* Password field */}
              <div className="auth-element space-y-2">
                <div className="flex items-center justify-between">
                  <label className="wuti-label mb-0">Mot de passe</label>
                  <Link
                    id="forgot-password"
                    name="forgot-password"
                    to={updatePathWithQueryParams(RESET_PAGE)}
                    onClick={trackForgotPasswordLinkClick}
                    className="wuti-link"
                  >
                    Oublié ?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formFields.password}
                  autoComplete="off"
                  onChange={handleOnChange}
                  onFocus={handleOnFocus}
                  placeholder="••••••••"
                  className={`wuti-input wuti-input-password ${errors.password ? 'wuti-input-error' : ''}`}
                />
                {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
              </div>

              {/* Submit Button */}
              <div className="auth-element pt-4">
                <button
                  id="sign-in"
                  name="sign-in"
                  type="submit"
                  onMouseDown={(event) => event.preventDefault()}
                  disabled={submitState === PENDING_STATE}
                  className="wuti-btn-primary"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {submitState === PENDING_STATE ? 'Connexion en cours...' : 'Se connecter'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="auth-element wuti-divider">
              <hr className="wuti-divider-line" />
              <span className="wuti-divider-text">Ou continuer avec</span>
            </div>

            {/* Third party auth */}
            <div className="auth-element mt-8">
              <ThirdPartyAuth
                currentProvider={currentProvider}
                providers={providers}
                secondaryProviders={secondaryProviders}
                handleInstitutionLogin={handleInstitutionLogin}
                thirdPartyAuthApiStatus={thirdPartyAuthApiStatus}
                isLoginPage
              />
            </div>

            <p className="auth-element mt-10 text-center text-sm text-neutral-500 font-medium">
              Vous n'avez pas de compte ?&nbsp;
              <button
                onClick={() => navigate(updatePathWithQueryParams(REGISTER_PAGE))}
                className="wuti-link bg-transparent border-none p-0 inline"
              >
                S'inscrire
              </button>
            </p>
          </div>

          {/* Footer text */}
          <div className="mt-8 text-center px-4">
            <p className="wuti-footer-text">
              En continuant, vous acceptez nos <a href={`${getConfig().LMS_BASE_URL}/tos`} className="wuti-link-muted">Conditions d'utilisation</a><br className="hidden sm:block" /> et notre <a href={`${getConfig().LMS_BASE_URL}/privacy`} className="wuti-link-muted">Politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

LoginPage.propTypes = {
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
};

export default LoginPage;
