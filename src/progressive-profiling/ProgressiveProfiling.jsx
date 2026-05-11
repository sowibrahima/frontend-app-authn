import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { identifyAuthenticatedUser, sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  AxiosJwtAuthService,
  configure as configureAuth,
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getLoggingService } from '@edx/frontend-platform/logging';
import {
  Alert,
  Form,
  Hyperlink,
  Spinner,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

import { saveUserProfile } from './data/actions';
import { welcomePageContextSelector } from './data/selectors';
import messages from './messages';
import BaseContainer from '../base-container';
import { RedirectLogistration } from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import {
  COMPLETE_STATE,
  DEFAULT_REDIRECT_URL,
  DEFAULT_STATE,
  FAILURE_STATE,
  PENDING_STATE,
} from '../data/constants';
import isOneTrustFunctionalCookieEnabled from '../data/oneTrust';
import { getAllPossibleQueryParams, isHostAvailableInQueryParams } from '../data/utils';
import { FormFieldRenderer } from '../field-renderer';

const ProgressiveProfiling = (props) => {
  const { formatMessage } = useIntl();
  const {
    getFieldDataFromBackend,
    submitState,
    showError,
    welcomePageContext,
    welcomePageContextApiStatus,
  } = props;
  const location = useLocation();
  const registrationEmbedded = isHostAvailableInQueryParams();

  const queryParams = getAllPossibleQueryParams();
  const authenticatedUser = getAuthenticatedUser() || location.state?.authenticatedUser;
  const functionalCookiesConsent = isOneTrustFunctionalCookieEnabled();
  const enablePostRegistrationRecommendations = (
    getConfig().ENABLE_POST_REGISTRATION_RECOMMENDATIONS && functionalCookiesConsent
  );

  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [formFieldData, setFormFieldData] = useState({ fields: {}, extendedProfile: [] });
  const [values, setValues] = useState({});
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [showRecommendationsPage, setShowRecommendationsPage] = useState(false);

  useEffect(() => {
    if (registrationEmbedded) {
      getFieldDataFromBackend({ is_welcome_page: true, next: queryParams?.next });
    } else {
      configureAuth(AxiosJwtAuthService, { loggingService: getLoggingService(), config: getConfig() });
    }
  }, [registrationEmbedded, getFieldDataFromBackend, queryParams?.next]);

  useEffect(() => {
    const registrationResponse = location.state?.registrationResult;
    if (registrationResponse) {
      setRegistrationResult(registrationResponse);
      setFormFieldData({
        fields: location.state?.optionalFields.fields,
        extendedProfile: location.state?.optionalFields.extended_profile,
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (registrationEmbedded && Object.keys(welcomePageContext).includes('fields')) {
      setFormFieldData({
        fields: welcomePageContext.fields,
        extendedProfile: welcomePageContext.extended_profile,
      });
      const nextUrl = welcomePageContext.nextUrl ? welcomePageContext.nextUrl : getConfig().SEARCH_CATALOG_URL;
      setRegistrationResult({ redirectUrl: nextUrl });
    }
  }, [registrationEmbedded, welcomePageContext]);

  useEffect(() => {
    if (authenticatedUser?.userId) {
      identifyAuthenticatedUser(authenticatedUser.userId);
      sendPageEvent('login_and_registration', 'welcome');
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (!enablePostRegistrationRecommendations) {
      sendTrackEvent(
        'edx.bi.user.recommendations.not.enabled',
        { functionalCookiesConsent, page: 'authn_recommendations' },
      );
      return;
    }

    if (registrationResult.redirectUrl && authenticatedUser?.userId) {
      const redirectQueryParams = getAllPossibleQueryParams(registrationResult.redirectUrl);
      if (!('enrollment_action' in redirectQueryParams || queryParams?.next)) {
        setShowRecommendationsPage(true);
      }
    }
  }, [
    authenticatedUser,
    enablePostRegistrationRecommendations,
    functionalCookiesConsent,
    registrationResult.redirectUrl,
    queryParams?.next,
  ]);

  if (
    !authenticatedUser
    || !(location.state?.registrationResult || registrationEmbedded)
    || welcomePageContextApiStatus === FAILURE_STATE
    || (welcomePageContextApiStatus === COMPLETE_STATE && !Object.keys(welcomePageContext).includes('fields'))
  ) {
    const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  const handleSubmit = (e, submittedValues = values) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    const payload = { ...submittedValues, extendedProfile: [] };
    if (Object.keys(formFieldData.extendedProfile).length > 0) {
      formFieldData.extendedProfile.forEach(fieldName => {
        if (submittedValues[fieldName]) {
          payload.extendedProfile.push({ fieldName, fieldValue: submittedValues[fieldName] });
        }
        delete payload[fieldName];
      });
    }
    props.saveUserProfile(authenticatedUser.username, snakeCaseObject(payload));

    sendTrackEvent(
      'edx.bi.welcome.page.submit.clicked',
      {
        isGenderSelected: !!values.gender,
        isYearOfBirthSelected: !!values.year_of_birth,
        isLevelOfEducationSelected: !!values.level_of_education,
        isWorkExperienceSelected: !!values.work_experience,
        host: queryParams?.host || '',
      },
    );
  };

  const handleSkip = (e) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    const nextValues = { ...values };
    if (activeFieldData?.name) {
      delete nextValues[activeFieldData.name];
    }
    setValues(nextValues);
    sendTrackEvent(
      'edx.bi.welcome.page.skip.link.clicked',
      {
        host: queryParams?.host || '',
      },
    );
    if (!isLastField) {
      setActiveFieldIndex(prevIndex => Math.min(prevIndex + 1, fieldSteps.length - 1));
      return;
    }
    handleSubmit(e, nextValues);
  };

  const onChangeHandler = (e) => {
    if (e.target.type === 'checkbox') {
      setValues({ ...values, [e.target.name]: e.target.checked });
    } else {
      setValues({ ...values, [e.target.name]: e.target.value });
    }
  };

  const fieldSteps = Object.keys(formFieldData.fields).map(fieldName => formFieldData.fields[fieldName]);
  const boundedFieldIndex = Math.min(activeFieldIndex, Math.max(fieldSteps.length - 1, 0));
  const activeFieldData = fieldSteps[boundedFieldIndex];
  const isLastField = boundedFieldIndex >= fieldSteps.length - 1;
  const progressPercent = fieldSteps.length ? ((boundedFieldIndex + 1) / fieldSteps.length) * 100 : 0;
  const finalPrimaryButtonLabel = showRecommendationsPage
    ? formatMessage(messages['optional.fields.next.button'])
    : formatMessage(messages['optional.fields.submit.button']);
  const primaryButtonLabel = isLastField
    ? finalPrimaryButtonLabel
    : formatMessage(messages['optional.fields.next.button']);

  const handlePrimaryAction = (e) => {
    e.preventDefault();
    if (!isLastField) {
      setActiveFieldIndex(prevIndex => Math.min(prevIndex + 1, fieldSteps.length - 1));
      return;
    }
    handleSubmit(e);
  };

  const handlePreviousQuestion = () => {
    setActiveFieldIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };

  return (
    <BaseContainer showWelcomeBanner fullName={authenticatedUser?.fullName || authenticatedUser?.name}>
      <Helmet>
        <title>{formatMessage(messages['progressive.profiling.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      {(props.shouldRedirect && welcomePageContext.nextUrl) && (
        <RedirectLogistration
          success
          redirectUrl={registrationResult.redirectUrl}
        />
      )}
      {props.shouldRedirect && (
        <RedirectLogistration
          success
          redirectUrl={registrationResult.redirectUrl}
          redirectToRecommendationsPage={showRecommendationsPage}
          educationLevel={values?.level_of_education}
          userId={authenticatedUser?.userId}
        />
      )}
      <div className="mw-xs m-4 pp-page-content wuti-auth-card p-5 sm:p-6">
        {registrationEmbedded && welcomePageContextApiStatus === PENDING_STATE ? (
          <Spinner animation="border" variant="primary" id="tpa-spinner" />
        ) : (
          <>
            <div>
              <h2 className="pp-page__heading text-primary">{formatMessage(messages['progressive.profiling.page.heading'])}</h2>
            </div><hr className="border-light-700 mb-4" />
            {showError ? (
              <Alert id="pp-page-errors" className="mb-3" variant="danger" icon={Error}>
                <Alert.Heading>{formatMessage(messages['welcome.page.error.heading'])}</Alert.Heading>
                <p>{formatMessage(messages['welcome.page.error.message'])}</p>
              </Alert>
            ) : null}
            <Form onSubmit={handlePrimaryAction}>
              <div className="pp-page__wizard">
                {fieldSteps.length > 1 && (
                  <div className="pp-page__progress" aria-hidden="true">
                    <div className="pp-page__progress-track">
                      <div
                        className="pp-page__progress-bar"
                        style={{ transform: `scaleX(${progressPercent / 100})` }}
                      />
                    </div>
                    <span className="pp-page__progress-count">
                      {formatMessage(messages['optional.fields.progress.label'], {
                        current: boundedFieldIndex + 1,
                        total: fieldSteps.length,
                      })}
                    </span>
                  </div>
                )}
                {activeFieldData && (
                  <div className="pp-page__field-step" key={activeFieldData.name}>
                    <FormFieldRenderer
                      fieldData={activeFieldData}
                      value={values[activeFieldData.name]}
                      onChangeHandler={onChangeHandler}
                    />
                  </div>
                )}
              </div>
              {(getConfig().AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK) && (
                <span className="pp-page__support-link">
                  <Hyperlink
                    isInline
                    variant="muted"
                    destination={getConfig().AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK}
                    target="_blank"
                    showLaunchIcon={false}
                    onClick={() => (sendTrackEvent('edx.bi.welcome.page.support.link.clicked'))}
                  >
                    {formatMessage(messages['optional.fields.information.link'])}
                  </Hyperlink>
                </span>
              )}
              <div className="pp-page__actions">
                {boundedFieldIndex > 0 && (
                  <button
                    className="pp-page__secondary-button"
                    type="button"
                    onClick={handlePreviousQuestion}
                  >
                    {formatMessage(messages['optional.fields.previous.question.button'])}
                  </button>
                )}
                <button
                  id="pp-submit"
                  type="submit"
                  className="wuti-btn-primary pp-page__primary-button"
                  disabled={submitState === PENDING_STATE}
                >
                  {submitState === PENDING_STATE ? '' : primaryButtonLabel}
                </button>
                <button
                  className="pp-page__skip-button"
                  type="button"
                  onClick={handleSkip}
                >
                  {formatMessage(messages['optional.fields.skip.button'])}
                </button>
              </div>
            </Form>
          </>
        )}

      </div>
    </BaseContainer>
  );
};

ProgressiveProfiling.propTypes = {
  authenticatedUser: PropTypes.shape({
    username: PropTypes.string,
    userId: PropTypes.number,
    fullName: PropTypes.string,
  }),
  showError: PropTypes.bool,
  shouldRedirect: PropTypes.bool,
  submitState: PropTypes.string,
  welcomePageContext: PropTypes.shape({
    extended_profile: PropTypes.arrayOf(PropTypes.string),
    fields: PropTypes.shape({}),
    nextUrl: PropTypes.string,
  }),
  welcomePageContextApiStatus: PropTypes.string,
  // Actions
  getFieldDataFromBackend: PropTypes.func.isRequired,
  saveUserProfile: PropTypes.func.isRequired,
};

ProgressiveProfiling.defaultProps = {
  authenticatedUser: {},
  shouldRedirect: false,
  showError: false,
  submitState: DEFAULT_STATE,
  welcomePageContext: {},
  welcomePageContextApiStatus: PENDING_STATE,
};

const mapStateToProps = state => {
  const welcomePageStore = state.welcomePage;

  return {
    shouldRedirect: welcomePageStore.success,
    showError: welcomePageStore.showError,
    submitState: welcomePageStore.submitState,
    welcomePageContext: welcomePageContextSelector(state),
    welcomePageContextApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
  };
};

export default connect(
  mapStateToProps,
  {
    saveUserProfile,
    getFieldDataFromBackend: getThirdPartyAuthContext,
  },
)(ProgressiveProfiling);
