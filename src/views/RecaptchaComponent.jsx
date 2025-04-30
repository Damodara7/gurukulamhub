import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

function RecaptchaComponent({recaptchaRef,handleCaptchaChange}) {
  return (
    <ReCAPTCHA  ref={recaptchaRef} sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} onChange={handleCaptchaChange} />
  )
}

export default RecaptchaComponent
