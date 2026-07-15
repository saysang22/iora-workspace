import { useRef, useState, type FormEvent } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiKakaotalk, SiNaver } from 'react-icons/si';
import { Button } from '../button/Button';
import { CheckBox } from '../checkBox/CheckBox';
import { Input } from '../input/Input';
import styles from './Login.module.scss';

type LoginSubmitValues = {
  email: string;
  password: string;
  remember: boolean;
};

type SocialProvider = 'google' | 'kakao' | 'naver';

type LoginProps = {
  title?: string;
  submitLabel?: string;
  loading?: boolean;
  errorMessage?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  rememberLabel?: string;
  socialTitle?: string;
  socialDividerLabel?: string;
  defaultRemember?: boolean;
  formBackground?: string;
  formBorderColor?: string;
  titleColor?: string;
  labelColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  buttonHoverBackground?: string;
  inputBackground?: string;
  inputTextColor?: string;
  inputFocusBorderColor?: string;
  rememberBackground?: string;
  rememberBorderColor?: string;
  rememberCheckColor?: string;
  rememberCheckedBackground?: string;
  rememberCheckedBorderColor?: string;
  rememberTextColor?: string;
  socialTitleColor?: string;
  errorColor?: string;
  helperLinkColor?: string;
  googleAuthPath?: string;
  kakaoAuthPath?: string;
  naverAuthPath?: string;
  forgotPasswordHref?: string;
  forgotPasswordLabel?: string;
  signUpHref?: string;
  signUpLabel?: string;
  signUpPrompt?: string;
  onSocialLogin?: (provider: SocialProvider) => boolean | void | Promise<boolean | void>;
  onSubmit?: (values: LoginSubmitValues) => void | Promise<void>;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function Login({
  title = 'Login',
  submitLabel = '로그인',
  loading = false,
  errorMessage,
  emailPlaceholder = 'you@example.com',
  passwordPlaceholder = '비밀번호를 입력해 주세요',
  rememberLabel = '로그인 상태 유지',
  socialTitle = '간편 로그인',
  socialDividerLabel = '또는',
  defaultRemember = false,
  formBackground = '#f8fafc',
  formBorderColor = '#e5e7eb',
  titleColor = '#0f172a',
  labelColor = '#334155',
  buttonBackground = '#2563eb',
  buttonTextColor = '#ffffff',
  buttonHoverBackground = '#1d4ed8',
  inputBackground = '#ffffff',
  inputTextColor = '#111827',
  inputFocusBorderColor = '#2563eb',
  rememberBackground = '#ffffff',
  rememberBorderColor = '#94a3b8',
  rememberCheckColor = '#ffffff',
  rememberCheckedBackground = '#2563eb',
  rememberCheckedBorderColor = '#2563eb',
  rememberTextColor = '#334155',
  socialTitleColor = '#64748b',
  errorColor = '#b91c1c',
  helperLinkColor = '#c8f135',
  googleAuthPath = '/auth/google',
  kakaoAuthPath = '/auth/kakao',
  naverAuthPath = '/auth/naver',
  forgotPasswordHref = '/forgot-password',
  forgotPasswordLabel = '비밀번호 찾기',
  signUpHref = '/signup',
  signUpLabel = '회원가입',
  signUpPrompt = '아직 계정이 없으신가요?',
  onSocialLogin,
  onSubmit,
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(defaultRemember);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const updateFieldError = (field: 'email' | 'password') => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmail = emailInputRef.current?.value ?? email;
    const nextPassword = passwordInputRef.current?.value ?? password;

    const nextErrors: Partial<Record<'email' | 'password', string>> = {};

    if (!nextEmail.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.';
    } else if (!isValidEmail(nextEmail.trim())) {
      nextErrors.email = '올바른 이메일 형식으로 입력해 주세요.';
    }

    if (!nextPassword.trim()) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    }

    setFieldErrors(nextErrors);

    if (nextErrors.email) {
      emailInputRef.current?.focus();
      return;
    }

    if (nextErrors.password) {
      passwordInputRef.current?.focus();
      return;
    }

    await onSubmit?.({
      email: nextEmail.trim(),
      password: nextPassword,
      remember,
    });
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    const shouldContinue = await onSocialLogin?.(provider);

    if (shouldContinue === false) {
      return;
    }

    const authPathByProvider: Record<SocialProvider, string> = {
      google: googleAuthPath,
      kakao: kakaoAuthPath,
      naver: naverAuthPath,
    };

    const targetPath = authPathByProvider[provider];
    if (typeof window !== 'undefined' && targetPath) {
      window.location.href = targetPath;
    }
  };

  return (
    <form
      className={styles.form}
      style={{ background: formBackground, borderColor: formBorderColor }}
      noValidate
      onSubmit={handleSubmit}
    >
      {title ? (
        <h2 className={styles.title} style={{ color: titleColor }}>
          {title}
        </h2>
      ) : null}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="login-email" style={{ color: labelColor }}>
          이메일
        </label>
        <Input
          id="login-email"
          ref={emailInputRef}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            updateFieldError('email');
          }}
          placeholder={emailPlaceholder}
          width="100%"
          round="10px"
          padding="10px 12px"
          background={inputBackground}
          textColor={inputTextColor}
          focusBorderColor={inputFocusBorderColor}
          required
        />
        {fieldErrors.email ? (
          <p className={styles.fieldError} style={{ color: errorColor }}>
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="login-password" style={{ color: labelColor }}>
          비밀번호
        </label>
        <Input
          id="login-password"
          ref={passwordInputRef}
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            updateFieldError('password');
          }}
          placeholder={passwordPlaceholder}
          width="100%"
          round="10px"
          padding="10px 12px"
          background={inputBackground}
          textColor={inputTextColor}
          focusBorderColor={inputFocusBorderColor}
          required
        />
        {fieldErrors.password ? (
          <p className={styles.fieldError} style={{ color: errorColor }}>
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <label className={styles.rememberRow} htmlFor="login-remember" style={{ color: rememberTextColor }}>
        <CheckBox
          id="login-remember"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          size="18px"
          round="4px"
          background={rememberBackground}
          borderColor={rememberBorderColor}
          checkColor={rememberCheckColor}
          checkedBackground={rememberCheckedBackground}
          checkedBorderColor={rememberCheckedBorderColor}
          aria-label={rememberLabel}
        />
        <span>{rememberLabel}</span>
      </label>

      {errorMessage ? (
        <p className={styles.error} style={{ color: errorColor }}>
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        size="14px"
        background={buttonBackground}
        borderColor={buttonBackground}
        hoverBackground={buttonHoverBackground}
        textColor={buttonTextColor}
        hoverTextColor={buttonTextColor}
        hoverBorderColor={buttonHoverBackground}
        round="10px"
        padding="10px 14px"
      >
        {loading ? '처리 중...' : submitLabel}
      </Button>

      <div className={styles.helperLinks}>
        <a className={styles.helperLink} href={forgotPasswordHref} style={{ color: helperLinkColor }}>
          {forgotPasswordLabel}
        </a>
        <span className={styles.helperDivider} aria-hidden="true">
          /
        </span>
        <span className={styles.helperPrompt}>{signUpPrompt}</span>
        <a className={styles.helperLink} href={signUpHref} style={{ color: helperLinkColor }}>
          {signUpLabel}
        </a>
      </div>

      <div className={styles.socialDivider} aria-hidden="true">
        <span className={styles.socialDividerLine} />
        <span className={styles.socialDividerText} style={{ color: socialTitleColor }}>
          {socialDividerLabel}
        </span>
        <span className={styles.socialDividerLine} />
      </div>

      <div className={styles.socialSection}>
        <p className={styles.socialTitle} style={{ color: socialTitleColor }}>
          {socialTitle}
        </p>
        <div className={styles.socialButtons}>
          <button type="button" className={styles.socialGoogle} onClick={() => void handleSocialLogin('google')}>
            <FcGoogle size={18} aria-hidden />
            <span>구글로 로그인</span>
          </button>
          <button type="button" className={styles.socialKakao} onClick={() => void handleSocialLogin('kakao')}>
            <SiKakaotalk size={18} aria-hidden />
            <span>카카오톡으로 로그인</span>
          </button>
          <button type="button" className={styles.socialNaver} onClick={() => void handleSocialLogin('naver')}>
            <SiNaver size={18} aria-hidden />
            <span>네이버로 로그인</span>
          </button>
        </div>
      </div>
    </form>
  );
}
