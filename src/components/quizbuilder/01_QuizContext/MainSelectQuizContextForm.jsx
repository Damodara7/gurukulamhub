// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Input,
  Card,
  Typography,
  CardContent
} from '@mui/material'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

import CustomInputVertical from '@core/components/custom-inputs/Vertical'
import SquizMeLogoHead from '../../layout/shared/SquizMeLogoHead'
import SocioConclaveLogo from '../../layout/shared/SocioConclaveLogo'
import NalandaLMSLogo from '../../layout/shared/NalandaLMSLogo'

import TagInput from '../../TagInput'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useUUID from '../../../app/hooks/useUUID'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

import QuizDetails from '../02_QuestionBuilder/QuizDetails'
import ViewQuiz from './ViewQuiz'
import CreateQuizForm from './CreateQuizForm'
import theme from '@/@core/theme'

const data = [
  {
    value: 'select-quiz',
    isActive: true,
    title: 'View & Edit Your Quizzes ',
    isSelected: true,
    content: 'View Quizzes created by you and edit them accordingly, add new language secondary question etc.'
  },
  {
    value: 'custom-quiz',
    isActive: true,
    title: 'Create New Quiz ',
    content:
      'Create a new quiz on your choice of subject. You are free to add to the Question bank of SquizMe, and publish to other users'
  },
  {
    value: 'clone-quiz',
    title: 'Clone a Existing Quiz',
    isActive: true,
    content:
      'Create by cloning existing quiz. You are free to add to the Question bank of SquizMe, and publish to users'
  },
  {
    value: 'custom-poll',
    title: 'Create a Poll',
    isActive: true,
    content:
      'Engage users from your own database, Social Conclave users, has Quizes and Questions categorized  on various subjects and sub subjects.'
  },
  {
    value: 'clone-poll',
    title: 'Clone a Poll',
    isActive: false,
    content:
      'Engage users from your own database, Social Conclave users, has Quizes and Questions categorized  on various subjects and sub subjects.'
  },
  {
    value: 'random-survey',
    title: 'Create a Survey ',
    isActive: false,
    content:
      'Nalandas e-learning course id, program id, where you can create granular questions on various levels, chapter,lesson,section. '
  },

  {
    value: 'nalanda-book',
    title: 'e-Book from Nalanda LMS',
    isSelected: false,
    isActive: false,
    content: 'Any Digital book, which exists in Nalanda LMS, or any book which is onboarded to Nalanda.'
  },
  {
    value: 'nalanda-course',
    title: 'e-learning from Nalanda LMS',
    isActive: false,
    content:
      'Nalandas e-learning course id, program id, where you can create granular questions on various levels, chapter,lesson,section. '
  },
  {
    value: 'squizme-subjects',
    title: 'e-Learning  from Youtube',
    isActive: false,
    content: 'Youtube backed learning, Cherish the world, share the knowledge'
  }
]

const ComingSoon = () => {
  return (
    <svg
      width='128'
      style={{ position: 'absolute', top: 80, opacity: 0.2 }}
      height='128'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g class='layer'>
        <title>Coming soon</title>
        <path
          d='m24.18,102.16l-1.04,-0.53c-0.88,-0.46 -2.08,-1.74 -1.56,-3.21c0.46,-1.3 1.92,-1.75 4.05,-1.32c1.78,0.36 3.14,1.09 3.96,1.52l0.34,0.02l0.24,-0.23l1.79,-4.37l-0.14,-0.49c-1.44,-1.04 -5.3,-2.65 -9.42,-2.19c-2.79,0.31 -5.59,1.12 -7.13,4.88c-0.96,2.32 -0.96,4.96 0,6.85c1.03,2.07 2.71,3 4.84,4.17l0.29,0.16c1.51,0.82 3.26,1.69 4.6,2.37c1.81,0.94 2.47,2.64 2.05,3.66c-0.67,1.63 -2.12,1.99 -4.65,1.2c-2.25,-0.66 -4.31,-2.53 -4.88,-3.08l-0.34,-0.11l-0.3,0.2l-2.77,4.61l0.06,0.5c1.44,1.5 2.61,2.38 4.64,3.46c1.37,0.73 3.37,1.17 5.36,1.17c2.07,0 7.14,-0.52 9.36,-5.33c1.4,-3.05 0.88,-6.28 -1.45,-8.87c-2.08,-2.11 -5.58,-3.88 -7.9,-5.04m89.12,-9.39l-5.18,0c-0.33,0 -0.59,0.27 -0.59,0.6l0,16.67l-9.61,-16.97c-0.1,-0.19 -0.3,-0.3 -0.52,-0.3l-5.18,0c-0.33,0 -0.59,0.27 -0.59,0.6l0,26.9c0,0.33 0.27,0.6 0.59,0.6l5.18,0c0.33,0 0.59,-0.27 0.59,-0.6l0,-16.67l9.61,16.97c0.11,0.19 0.3,0.3 0.52,0.3l5.18,0c0.33,0 0.6,-0.27 0.6,-0.6l0,-26.9c0,-0.33 -0.27,-0.6 -0.6,-0.6m-36.95,-0.6c-8.08,0 -13.13,6.42 -13.13,14.34c0,7.93 5.05,14.35 13.13,14.35c8.08,0 13.13,-6.42 13.13,-14.35c0,-7.91 -5.05,-14.34 -13.13,-14.34m0,21.93c-4.2,0 -6.82,-3.4 -6.82,-7.59c0,-4.18 2.62,-7.58 6.82,-7.58s6.82,3.4 6.82,7.58c0,4.2 -2.62,7.59 -6.82,7.59m-27.85,-21.93c-8.08,0 -13.13,6.42 -13.13,14.34c0,7.93 5.05,14.35 13.13,14.35c8.08,0 13.13,-6.42 13.13,-14.35c0,-7.91 -5.05,-14.34 -13.13,-14.34m0,21.93c-4.19,0 -6.82,-3.4 -6.82,-7.59c0,-4.18 2.63,-7.58 6.82,-7.58c4.2,0 6.82,3.4 6.82,7.58c0,4.2 -2.62,7.59 -6.82,7.59'
          fill='#7f00ff'
          id='svg_1'
        />
        <path
          d='m102.68,60.86l-38.86538,26.31l0,-16.41165l-41.49461,0l0,-19.63328l41.49461,0l0,-16.57507l38.86538,26.31z'
          fill='#ed6c30'
          id='svg_2'
        />
        <text
          fill='#7f00ff'
          font-family='serif'
          font-size='24'
          id='svg_6'
          strokeWidth='0'
          text-anchor='middle'
          transform='matrix(1 0 0 1 0 0) matrix(1.27349 0 0 1.11473 0.3694 -17.2399)'
          x='50.58472'
          y='41.19645'
        >
          COMING
        </text>
      </g>
    </svg>
  )
}

const SVGs = [
  {
    asset: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SquizMeLogoHead />
        <svg xmlns='http://www.w3.org/2000/svg' width='2.2rem' height='2.2rem' viewBox='0 0 48 48'>
          <path
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M25.394 2.546A21.147 21.147 0 0 0 7.98 9.864a21.35 21.35 0 0 0 7.005 33.24a21.11 21.11 0 0 0 18.872-.406a.588.588 0 0 1 .3-.064a.582.582 0 0 1 .291.097a16.376 16.376 0 0 0 9.312 2.768a.593.593 0 0 0 .593-.595V37.67a.598.598 0 0 0-.137-.389a.586.586 0 0 0-.355-.206a8.395 8.395 0 0 1-1.982-.571a.59.59 0 0 1-.327-.375a.617.617 0 0 1-.018-.255a.603.603 0 0 1 .09-.24a21.366 21.366 0 0 0-5.857-29.56A21.124 21.124 0 0 0 25.37 2.533ZM11.177 23.819a12.909 12.909 0 0 1 7.92-11.937a12.797 12.797 0 0 1 14 2.792a12.944 12.944 0 0 1-1.949 19.865a12.804 12.804 0 0 1-16.213-1.604a12.942 12.942 0 0 1-3.767-9.118Z'
          ></path>
        </svg>
      </div>
    )
  },
  {
    asset: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SquizMeLogoHead />
        <svg xmlns='http://www.w3.org/2000/svg' width='2.2rem' height='2.2rem' viewBox='0 0 48 48'>
          <path
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M25.394 2.546A21.147 21.147 0 0 0 7.98 9.864a21.35 21.35 0 0 0 7.005 33.24a21.11 21.11 0 0 0 18.872-.406a.588.588 0 0 1 .3-.064a.582.582 0 0 1 .291.097a16.376 16.376 0 0 0 9.312 2.768a.593.593 0 0 0 .593-.595V37.67a.598.598 0 0 0-.137-.389a.586.586 0 0 0-.355-.206a8.395 8.395 0 0 1-1.982-.571a.59.59 0 0 1-.327-.375a.617.617 0 0 1-.018-.255a.603.603 0 0 1 .09-.24a21.366 21.366 0 0 0-5.857-29.56A21.124 21.124 0 0 0 25.37 2.533ZM11.177 23.819a12.909 12.909 0 0 1 7.92-11.937a12.797 12.797 0 0 1 14 2.792a12.944 12.944 0 0 1-1.949 19.865a12.804 12.804 0 0 1-16.213-1.604a12.942 12.942 0 0 1-3.767-9.118Z'
          ></path>
        </svg>
      </div>
    )
  },
  {
    asset: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SquizMeLogoHead />
        <svg xmlns='http://www.w3.org/2000/svg' width='2.2rem' height='2.2rem' viewBox='0 0 48 48'>
          <path
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M25.394 2.546A21.147 21.147 0 0 0 7.98 9.864a21.35 21.35 0 0 0 7.005 33.24a21.11 21.11 0 0 0 18.872-.406a.588.588 0 0 1 .3-.064a.582.582 0 0 1 .291.097a16.376 16.376 0 0 0 9.312 2.768a.593.593 0 0 0 .593-.595V37.67a.598.598 0 0 0-.137-.389a.586.586 0 0 0-.355-.206a8.395 8.395 0 0 1-1.982-.571a.59.59 0 0 1-.327-.375a.617.617 0 0 1-.018-.255a.603.603 0 0 1 .09-.24a21.366 21.366 0 0 0-5.857-29.56A21.124 21.124 0 0 0 25.37 2.533ZM11.177 23.819a12.909 12.909 0 0 1 7.92-11.937a12.797 12.797 0 0 1 14 2.792a12.944 12.944 0 0 1-1.949 19.865a12.804 12.804 0 0 1-16.213-1.604a12.942 12.942 0 0 1-3.767-9.118Z'
          ></path>
        </svg>
      </div>
    )
  },

  {
    asset: (
      <div style={{ display: 'flex', gap: 14 }}>
        <SocioConclaveLogo />
        <svg xmlns='http://www.w3.org/2000/svg' width='2.2rem' height='2.2rem' viewBox='0 0 512 512'>
          <path
            fill='currentColor'
            d='M494 21.621c-14.947 8.43-29.566 17.581-43.67 29.227l7.318 38.547C471.923 93.66 483.583 95.26 494 95.36zm-98.982 24.512c-15.283-.085-32.48 2.596-53.832 6.834l-.22.043l-.22.033c-14.77 2.177-40.794 12.065-66.465 38.867l44.27 11.766c.972-1.493 5.936-9.004 6.88-10.555c5.124 3.123 10.248 6.244 15.372 9.365c-12.475 20.475-26.742 35.556-43.934 54.522c-2.123 4.718.977 8.199 4.36 10.14c5.22 2.931 14.1 3.09 16.437 2.102c23.932-15.768 40.819-35.928 55.963-56.271l5.469.964c11.501 2.031 26.47 1.058 38.707-2.853c11.098-3.548 19.272-9.357 22.662-15.688L432.54 53.65c-12.044-5.214-24.039-7.442-37.523-7.517zM227.932 98.717l-29.436 115.986l9.643.297H311.27l.9-.209l6.804-27.092c-8.86 1.9-18.296-.217-26.557-4.855c-5.188-2.913-10.024-7.24-12.621-13.434c-7.797-19.938 15.857-37.297 28.724-52.75l-80.59-17.943zM69.562 201l-23 46h418.875l-23-46H334.195l-3.517 14H352v18H160v-18h19.852l3.552-14H69.563zM41 265v222h430V265zm14 14h402v194H55zm18 18v118.238l34.502-74.994l73.36 31.762l66.652-45.84l37.513 57.273l50.11-4.595l31.3-39.332L439 394.627V297zm169.543 54.43l-90.63 62.33l27.01 41.24h95.606l19.666-24.71zm-126.045 12.326L74.521 455h82.885l-30.193-46.098l36.144-24.857l-46.859-20.29zm253.065.732L297.533 455h140.54l.927-1.166v-36.602zm-49.944 33.854l-23.426 2.148l9.805 14.969z'
          ></path>
        </svg>
      </div>
    )
  },

  {
    asset: (
      <div style={{ display: 'flex', gap: 14 }}>
        <SocioConclaveLogo />
        <svg xmlns='http://www.w3.org/2000/svg' width='2.2rem' height='2.2rem' viewBox='0 0 24 24'>
          <path
            fill='currentColor'
            d='M20 17c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H9.5c.3.6.5 1.3.5 2h10v11h-9v2m4-10v2H9v13H7v-6H5v6H3v-8H1.5V9c0-1.1.9-2 2-2zM8 4c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2m9 2h2v8h-2zm-3 4h2v4h-2zm-3 0h2v4h-2z'
          ></path>
        </svg>
      </div>
    )
  },
  {
    asset: (
      <div style={{ display: 'flex', gap: 14 }}>
        <SocioConclaveLogo />
        <svg xmlns='http://www.w3.org/2000/svg' width='2.2rem' height='2.2rem' viewBox='0 0 512 512'>
          <path
            fill='currentColor'
            d='M494 21.621c-14.947 8.43-29.566 17.581-43.67 29.227l7.318 38.547C471.923 93.66 483.583 95.26 494 95.36zm-98.982 24.512c-15.283-.085-32.48 2.596-53.832 6.834l-.22.043l-.22.033c-14.77 2.177-40.794 12.065-66.465 38.867l44.27 11.766c.972-1.493 5.936-9.004 6.88-10.555c5.124 3.123 10.248 6.244 15.372 9.365c-12.475 20.475-26.742 35.556-43.934 54.522c-2.123 4.718.977 8.199 4.36 10.14c5.22 2.931 14.1 3.09 16.437 2.102c23.932-15.768 40.819-35.928 55.963-56.271l5.469.964c11.501 2.031 26.47 1.058 38.707-2.853c11.098-3.548 19.272-9.357 22.662-15.688L432.54 53.65c-12.044-5.214-24.039-7.442-37.523-7.517zM227.932 98.717l-29.436 115.986l9.643.297H311.27l.9-.209l6.804-27.092c-8.86 1.9-18.296-.217-26.557-4.855c-5.188-2.913-10.024-7.24-12.621-13.434c-7.797-19.938 15.857-37.297 28.724-52.75l-80.59-17.943zM69.562 201l-23 46h418.875l-23-46H334.195l-3.517 14H352v18H160v-18h19.852l3.552-14H69.563zM41 265v222h430V265zm14 14h402v194H55zm18 18v118.238l34.502-74.994l73.36 31.762l66.652-45.84l37.513 57.273l50.11-4.595l31.3-39.332L439 394.627V297zm169.543 54.43l-90.63 62.33l27.01 41.24h95.606l19.666-24.71zm-126.045 12.326L74.521 455h82.885l-30.193-46.098l36.144-24.857l-46.859-20.29zm253.065.732L297.533 455h140.54l.927-1.166v-36.602zm-49.944 33.854l-23.426 2.148l9.805 14.969z'
          ></path>
        </svg>
      </div>
    )
  },
  {
    asset: (
      <>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <NalandaLMSLogo />
          <svg xmlns='http://www.w3.org/2000/svg' width='2.33rem' height='2.2rem' viewBox='0 0 1696 1536'>
            <path
              fill='currentColor'
              d='M1671 350q40 57 18 129l-275 906q-19 64-76.5 107.5T1215 1536H292q-77 0-148.5-53.5T44 1351q-24-67-2-127q0-4 3-27t4-37q1-8-3-21.5t-3-19.5q2-11 8-21t16.5-23.5T84 1051q23-38 45-91.5t30-91.5q3-10 .5-30t-.5-28q3-11 17-28t17-23q21-36 42-92t25-90q1-9-2.5-32t.5-28q4-13 22-30.5t22-22.5q19-26 42.5-84.5T372 283q1-8-3-25.5t-2-26.5q2-8 9-18t18-23t17-21q8-12 16.5-30.5t15-35t16-36t19.5-32T504.5 12t36-11.5T588 6l-1 3q38-9 51-9h761q74 0 114 56t18 130l-274 906q-36 119-71.5 153.5T1057 1280H188q-27 0-38 15q-11 16-1 43q24 70 144 70h923q29 0 56-15.5t35-41.5l300-987q7-22 5-57q38 15 59 43m-1064 2q-4 13 2 22.5t20 9.5h608q13 0 25.5-9.5T1279 352l21-64q4-13-2-22.5t-20-9.5H670q-13 0-25.5 9.5T628 288zm-83 256q-4 13 2 22.5t20 9.5h608q13 0 25.5-9.5T1196 608l21-64q4-13-2-22.5t-20-9.5H587q-13 0-25.5 9.5T545 544z'
            ></path>
          </svg>
        </div>
        <ComingSoon />
      </>
    )
  },
  {
    asset: (
      <>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <NalandaLMSLogo />
          <i className='fluent-learning-app-24-regular' width='2.2rem' height='2.2rem' style={{ color: '#4364ea' }} />
        </div>
        <ComingSoon />
      </>
    )
  },
  {
    asset: (
      <>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <NalandaLMSLogo />
          <i className='fa:youtube-square' width='2.2rem' height='2.2rem' style={{ color: '#fe1010' }} />
        </div>
        <ComingSoon />
      </>
    )
  }
]

const MainSelectQuizContextForm = ({ user, setSelectedQuiz, setIsMinimizedBool }) => {
  const { uuid, regenerateUUID, getUUID } = useUUID()
  const initialSelected = data.filter(item => item.isSelected)[data.filter(item => item.isSelected).length - 1].value
  // States
  const [selected, setSelected] = useState(initialSelected)
  const [submittedData, setSubmittedData] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const handleChange = prop => {
    if (typeof prop === 'string') {
      //console.log("Selected prop:" + prop)
      setSelected(prop)
      setIsPopupOpen(true)
    } else {
      //console.log("Selected prop:" + prop.target.value)
      setSelected(prop.target.value)
    }
  }

  /* POPUP RELATED */

  const handleOpenPopup = () => {
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
  }

  /* END OF POPUP */

  return (
    <Card>
      <CardContent>
        <Typography className='mb-3'>
          Create a Quiz, attach the subjects or context(s) to the quiz, it could be a random subject , book or course
          from Nalanda LMS. You can also create a survey or poll.
        </Typography>
        <Grid container spacing={4}>
          {data.map((item, index) => {
            if (item.isActive)
              return (
                <CustomInputVertical
                  type='radio'
                  key={index}
                  data={{ ...item, asset: SVGs[index].asset }}
                  selected={selected}
                  name='custom-radios-icons'
                  handleChange={handleChange}
                  gridProps={{ sm: 4, xs: 12 }}
                  shadow='0px 2px 4px rgba(0, 0, 0, 0.2)'
                  bgcolor='white'
                />
              )
          })}
        </Grid>
        <PopupWindow
          formTitle={selected}
          setSelectedQuiz={setSelectedQuiz}
          setIsMinimizedBool={setIsMinimizedBool}
          formName={selected} // Change this to the desired form name
          isOpen={selected && isPopupOpen}
          onClose={handleClosePopup}
          regenerateUUID={regenerateUUID}
          getUUID={getUUID}
          user={user}
          setIsPopupOpen={setIsPopupOpen}
        />
      </CardContent>
    </Card>
  )
}

function PopupWindow({
  formName,
  isOpen,
  setIsPopupOpen,
  onClose,
  regenerateUUID,
  getUUID,
  user,
  setSelectedQuiz,
  setIsMinimizedBool
}) {
  const formLookup = { 'custom-quiz': 'Custom Quiz', 'clone-quiz': 'Clone Quiz' } // Your lookup table
  // const [quizId, setQuizId] = useState(regenerateUUID('QZ_'));

  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)

  const handleInputChange = event => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  // Define a yup schema for form validation
  const createQuizSchema = yup.object().shape({
    //quizId: yup.string().min(3).max(10).notRequired(),
    title: yup.string().min(3).max(50).required(),
    details: yup.string().min(10).max(200).required()
    // Add more fields and validation rules as needed
  })

  const createQuizDefaultValues = {
    details: 'test details',
    syllabus: '',
    documents: [{ id: 0, description: '', document: null }],
    courseLinks: [{ id: 0, mediaType: 'video', link: '' }],
    id: getUUID('QZ_'),
    title: 'My Quiz',
    tags: [],
    owner: user?.email,
    privacy: 'PUBLIC',
    createdBy: user?.email,
    contextIds: [],
    nodeType: 'QUIZ',
    status: 'active',
    thumbnail: '',
    language: { code: 'en', name: 'English' },
    remarks: []
  }

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    defaultValues: { ...createQuizDefaultValues },
    resolver: yupResolver(createQuizSchema)
  })

  const onSubmit = async () => {
    //onSubmit(formData);
    const formValues = getValues()
    console.log(formValues) // Access form values here

    const result = await RestApi.post(ApiUrls.v0.USERS_QUIZ, formValues)
    if (result?.status === 'success') {
      console.log('Quiz Added result', result)
      // toast.success('Quiz Added Successfully .')
      setLoading(false)
      onClose()
      //setIsPopupOpen(false)
    } else {
      // toast.error('Error:' + result.message)
      reset()
      setLoading(false)
      //setIsPopupOpen(false)
      //setData(result.result);
    }

    //onClose();
  }

  function handleSelectQuiz(quiz) {
    setSelectedQuiz(quiz)
    setIsMinimizedBool(false)
    onClose()
  }

  const renderForm = () => {
    switch (formName) {
      case 'custom-quiz':
        return (
          <CreateQuizForm
            regenerateUUID={regenerateUUID}
            user={user}
            control={control}
            errors={errors}
            setValue={setValue}
          />
        )
        break
      case 'select-quiz':
        return (
          <div style={{ height: '100%' }}>
            <ViewQuiz theme={theme} onSelectQuiz={handleSelectQuiz} />
          </div>
        )

      case 'Form2':
        return (
          <form>
            <input type='text' name='field3' onChange={handleInputChange} />
            <input type='text' name='field4' onChange={handleInputChange} />
          </form>
        )

      // Add more cases for different forms as needed
      default:
        return null
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '95vh',
          maxHeight: '95vh',
          minWidth: '95vw',
          maxWidth: '95vw',
          overflow: 'auto'
        }
      }}
    >
      <DialogTitle>{formLookup[formName]}</DialogTitle>
      <DialogContent>{renderForm()}</DialogContent>
      {formName !== 'select-quiz' && (
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={onSubmit}>Submit</Button>
        </DialogActions>
      )}
      {formName === 'select-quiz' && (
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default MainSelectQuizContextForm
