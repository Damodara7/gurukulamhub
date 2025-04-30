'use client'
import SingleChoiceQuestionTemplate from '@/components/quizbuilder/03_QuestionTemplates/SingleChoiceQuestionTemplate'
import TrueFalseQuestionTemplate from '@/components/quizbuilder/03_QuestionTemplates/TrueFalseQuestionTemplate'
import MultipleChoiceQuestionTemplate from '@/components/quizbuilder/03_QuestionTemplates/MultipleChoiceQuestionTemplate'
import FillInBlanksQuestionTemplate from '../03_QuestionTemplates/FillInBlanksQuestionTemplate'

const DynamicQuestionTemplate = ({
  id,
  templateId,
  data,
  primaryQuestion = null,
  mode,
  saveQuestion,
  deleteQuestion,
  validationErrors = []
}) => {
  const componentMap = {
    'single-choice': SingleChoiceQuestionTemplate,
    'true-or-false': TrueFalseQuestionTemplate,
    'fill-in-blank': FillInBlanksQuestionTemplate,
    'multiple-choice': MultipleChoiceQuestionTemplate
    // ... other components
  }
  const Component = componentMap[templateId]

  if (!Component) {
    return <div>Component not found</div>
  }

  return (
    <Component
      key={id}
      data={data}
      id={id}
      mode={mode}
      primaryQuestion={primaryQuestion}
      saveQuestion={saveQuestion}
      deleteQuestion={deleteQuestion}
      validationErrors={validationErrors}
    />
  )
}

export default DynamicQuestionTemplate
