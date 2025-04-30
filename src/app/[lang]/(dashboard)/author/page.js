'use client'
import React, { useEffect, useState } from 'react';
// Create a context for data access client
import QuizAuthoringDashboard from '@/components/quizbuilder/00_Main/QuizAuthoringDashboard'
import { redirect, useRouter } from 'next/navigation'
import EmailForm from "@/components/EmailForm"
function Page() {
  const router = useRouter()

  const [user, setUser] = useState({
    username: "",
    email: "",
    userId: "",
    phone: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false)


  return <>
    {isError ? <h4>Login info not found - Cant view this page. </h4> :
      !isError && isLoading ? "Loading Data..." : <QuizAuthoringDashboard user={user} />
    }
    <EmailForm></EmailForm>
  </>
}

export default Page
