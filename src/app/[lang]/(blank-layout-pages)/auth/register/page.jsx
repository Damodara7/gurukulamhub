// Component Imports
import RegisterMultiSteps from '@views/pages/auth/register-multi-steps'

const RegisterMultiStepsPage = ({ searchParams }) => {
  return (
    <RegisterMultiSteps
      gamePin={searchParams.gamePin}
      intialSearchParams={searchParams}
      referralToken={searchParams.ref}
    />
  )
}

export default RegisterMultiStepsPage
