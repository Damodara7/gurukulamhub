'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DoNotDisturbOnRoundedIcon from '@mui/icons-material/DoNotDisturbOnRounded'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import {
  SingleChoiceTemplate,
  MultipleChoiceTemplate,
  TrueOrFalseTemplate,
  FillInTheBlanksTemplate
} from '@/components/quizbuilder/Templates'
import DynamicQuestionTemplate from '@/components/quizbuilder/02_QuestionBuilder/DynamicQuestionTemplate'
import { validateQuizQuestions } from '@/views/quiz-builder/validateQuizQuestions'

function renderRealTemplate(question, hideHeader = false) {
  if (!question) return null
  switch (question.templateId) {
    case 'single-choice':
      return <SingleChoiceTemplate question={question} hideHeader={hideHeader} />
    case 'multiple-choice':
      return <MultipleChoiceTemplate question={question} hideHeader={hideHeader} />
    case 'true-or-false':
      return <TrueOrFalseTemplate question={question} hideHeader={hideHeader} />
    case 'fill-in-blank':
      return <FillInTheBlanksTemplate question={question} hideHeader={hideHeader} />
    default:
      return null
  }
}

/** Friendly label for question media type (e.g. 'text-image' → 'Text + Image'). */
function humanizeMediaType(t) {
  if (!t) return ''
  return t
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' + ')
}

function humanizeTemplate(id) {
  if (!id) return 'Question'
  return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Section title for read & edit layouts */
function SectionLabel({ children, sx = {} }) {
  return (
    <Typography
      variant='overline'
      sx={{
        display: 'block',
        letterSpacing: '0.12em',
        fontWeight: 700,
        color: 'text.secondary',
        fontSize: '0.68rem',
        mb: 1,
        ...sx
      }}
    >
      {children}
    </Typography>
  )
}

/** Compact ON/OFF badge — green when ON, red when OFF. */
function OnOffBadge({ active, theme, label }) {
  const tone = active ? 'success' : 'error'
  const main = theme.palette[tone].main
  return (
    <Tooltip title={label ? `${label}: ${active ? 'ON' : 'OFF'}` : active ? 'Enabled' : 'Disabled'}>
      <Box
        component='span'
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.35,
          px: 0.85,
          py: 0.2,
          borderRadius: 999,
          bgcolor: main,
          color: theme.palette.getContrastText(main),
          fontWeight: 800,
          fontSize: '0.62rem',
          letterSpacing: '0.08em',
          lineHeight: 1.4
        }}
      >
        {active ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />
        ) : (
          <DoNotDisturbOnRoundedIcon sx={{ fontSize: 13 }} />
        )}
        {active ? 'ON' : 'OFF'}
      </Box>
    </Tooltip>
  )
}

/** KPI-style metric card with optional top-right badge and footer note. */
function MetricCard({ icon, label, value, theme, accent, badge, footer, dim }) {
  const main = theme.palette[accent]?.main || theme.palette.primary.main
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        height: '100%',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        background:
          theme.palette.mode === 'dark'
            ? `linear-gradient(145deg, ${alpha(main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
            : `linear-gradient(145deg, ${alpha(main, 0.06)} 0%, ${theme.palette.background.paper} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        opacity: dim ? 0.7 : 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: main
        }
      }}
    >
      <Stack direction='row' alignItems='flex-start' spacing={1.25}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(main, theme.palette.mode === 'dark' ? 0.22 : 0.14),
            color: main,
            flexShrink: 0
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600, display: 'block' }}>
              {label}
            </Typography>
            {badge}
          </Stack>
          <Typography
            variant='h5'
            fontWeight={800}
            sx={{
              lineHeight: 1.2,
              color: dim ? 'text.disabled' : 'text.primary',
              mt: 0.25,
              textDecoration: dim ? 'line-through' : 'none'
            }}
          >
            {value}
          </Typography>
          {footer ? (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25 }}>
              {footer}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  )
}

function ReadView({ question, theme }) {
  const data = question?.data
  const marks = data?.marks != null && data?.marks !== '' ? data.marks : '—'
  const timer =
    data?.timerSeconds != null && data?.timerSeconds !== '' ? `${data.timerSeconds}` : '—'
  const timerUnit = timer !== '—' ? ' sec' : ''
  const hintMarks = data?.hintMarks != null && data?.hintMarks !== '' ? data.hintMarks : '—'
  const hint = data?.hint || ''
  const addHint = Boolean(data?.addHint)
  const skippable = Boolean(data?.skippable)

  return (
    <Stack spacing={3}>
      {/* Question + answer choices: rendered using the same templates as the quiz view.
          The template's internal header is hidden — the chips and Edit button live in
          the panel's top header above to avoid overlap. */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper
        }}
      >
        {renderRealTemplate(question, true) || (
          <Box sx={{ p: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
              No template renderer available for this question.
            </Typography>
          </Box>
        )}
      </Paper>

      <Divider sx={{ opacity: 0.6 }} />

      <Box>
        <SectionLabel>Parameters</SectionLabel>
        <Stack spacing={2}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={4}>
              <MetricCard
                icon={<EmojiEventsOutlinedIcon />}
                label='Marks'
                value={marks}
                theme={theme}
                accent='primary'
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard
                icon={<TimerOutlinedIcon />}
                label='Time limit'
                value={timer === '—' ? '—' : `${timer}${timerUnit}`}
                theme={theme}
                accent='warning'
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard
                icon={<LightbulbOutlinedIcon />}
                label='Hint penalty'
                value={addHint ? hintMarks : '—'}
                theme={theme}
                accent='info'
                badge={<OnOffBadge active={addHint} theme={theme} label='Hint' />}
                footer={addHint ? 'Applied if hint is used' : 'Hints disabled for this question'}
                dim={!addHint}
              />
            </Grid>
          </Grid>

          <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1} sx={{ rowGap: 1 }}>
            <Chip
              size='small'
              icon={<SkipNextOutlinedIcon sx={{ fontSize: '16px !important' }} />}
              label={skippable ? 'Skippable' : 'Must answer'}
              color={skippable ? 'success' : 'default'}
              variant={skippable ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, borderRadius: 2 }}
            />
            {/* {status ? (
              <Chip
                size='small'
                icon={<LabelOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                label={status}
                variant='outlined'
                sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'capitalize' }}
              />
            ) : null} */}
          </Stack>

          {(hint || addHint) && (
            <Box>
              <SectionLabel>Hint</SectionLabel>
              {hint ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
                    bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.1 : 0.04),
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start'
                  }}
                >
                  <LightbulbOutlinedIcon sx={{ color: 'info.main', fontSize: 22, mt: 0.15, flexShrink: 0 }} />
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, color: 'text.primary' }}>
                    {hint}
                  </Typography>
                </Paper>
              ) : (
                <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                  {addHint ? 'No hint text saved yet.' : 'Hints are turned off for this question.'}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

/** Parse the partial payload emitted by DynamicQuestionTemplate's saveQuestion callback.
 *  Primary mode returns an object; secondary mode returns a JSON string.
 */
function parsePartial(partial) {
  return typeof partial === 'string' ? JSON.parse(partial) : partial
}

/** Convert template-state hintMarks (positive, as shown in the UI) to the DB-canonical
 *  form (negative). This mirrors QuestionBuilderArea.onSaveQuestion so saved/validated
 *  data here is byte-identical to the regular create/edit flow.
 */
function normalizeDataForServer(data = {}) {
  const out = { ...data }
  if (out.hintMarks !== undefined && out.hintMarks !== null && out.hintMarks !== '') {
    const n = Number(out.hintMarks)
    out.hintMarks = Number.isFinite(n) ? -1 * n : 0
  } else {
    out.hintMarks = 0
  }
  return out
}

/** Build the API payload (canonical / DB-shaped) from the partial template result. */
function buildSavePayload(question, partial) {
  const parsed = parsePartial(partial)
  const mergedData = { ...(question.data || {}), ...(parsed?.data || {}) }
  return {
    _id: question._id,
    id: question.id,
    quizId: question.quizId,
    templateId: question.templateId,
    isPrimary: question.isPrimary,
    primaryQuestionId: question.primaryQuestionId,
    language: question.language,
    languageCode: question.languageCode,
    languageName: question.languageName,
    createdBy: question.createdBy,
    approvalState: question.approvalState,
    status: question.status,
    schemaVersion: question.schemaVersion,
    tags: question.tags,
    data: normalizeDataForServer(mergedData)
  }
}

/** Build the question shape expected by validateQuizQuestions, applying the same
 *  hintMarks normalization the server uses so the validator sees DB-canonical data.
 */
function buildValidationShape(question, partial) {
  const parsed = parsePartial(partial)
  const mergedData = { ...(question.data || {}), ...(parsed?.data || {}) }
  return {
    _id: question._id,
    id: question.id,
    templateId: question.templateId,
    data: normalizeDataForServer(mergedData)
  }
}

export default function ViewQuizQuestionParametersPanel({
  question,
  canEdit,
  onSaved,
  /** When set with onEditingChange, edit mode is controlled by the parent (e.g. sidebar Edit on selected question). */
  editing: editingProp,
  onEditingChange
}) {
  const theme = useTheme()
  const [internalEditing, setInternalEditing] = useState(false)
  const isControlled = editingProp !== undefined && typeof onEditingChange === 'function'
  const isEditing = isControlled ? Boolean(editingProp) : internalEditing

  const enterEdit = () => {
    if (isControlled) onEditingChange(true)
    else setInternalEditing(true)
  }
  const exitEdit = () => {
    if (isControlled) onEditingChange(false)
    else setInternalEditing(false)
  }

  // Validation errors emitted by validateQuizQuestions for THIS question only.
  const [validationErrors, setValidationErrors] = useState([])

  // Reset editing/errors whenever a different question is shown (or its data changes from the server).
  const serverDataSnapshot = useMemo(
    () => JSON.stringify(question?.data ?? {}),
    [question?._id, question?.data]
  )

  useEffect(() => {
    setValidationErrors([])
    if (!isControlled) setInternalEditing(false)
  }, [question?._id, serverDataSnapshot, isControlled])

  // When parent toggles edit off, clear errors so we re-enter clean next time.
  useEffect(() => {
    if (isControlled && editingProp === false) {
      setValidationErrors([])
    }
  }, [isControlled, editingProp])

  const templateId = question?.templateId || ''
  const editorMode = question?.isPrimary === false ? 'secondary' : 'primary'

  const handleSaveValidatedQuestion = async partial => {
    if (!question?._id) return
    // Run the SAME validation rules used during quiz creation/editing.
    const shape = buildValidationShape(question, partial)
    const validation = validateQuizQuestions([shape])
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      const count = validation.errors.length
      toast.error(
        `${count} validation issue${count > 1 ? 's' : ''} found. Please fix the highlighted fields.`
      )
      return
    }

    try {
      setValidationErrors([])
      const payload = buildSavePayload(question, partial)
      const result = await RestApi.put(API_URLS.v0.USERS_QUIZ_QUESTION, payload)
      if (result?.status === 'success') {
        toast.success('Question updated')
        exitEdit()
        onSaved?.()
      } else {
        toast.error(result?.message || 'Could not save question')
      }
    } catch (e) {
      console.error('Error saving question', e)
      toast.error('Could not save question')
    }
  }

  const handleDeleteQuestion = async id => {
    if (!id) return
    try {
      const result = await RestApi.del(`${API_URLS.v0.USERS_QUIZ_QUESTION}?id=${id}`)
      if (result?.status === 'success') {
        toast.success('Question deleted')
        exitEdit()
        onSaved?.()
      } else {
        toast.error(result?.message || 'Could not delete question')
      }
    } catch (e) {
      console.error('Error deleting question', e)
      toast.error('Could not delete question')
    }
  }

  if (!question) return null

  const primary = theme.palette.primary.main
  const paperBg = theme.palette.background.paper

  return (
    <Box
      sx={{
        mt: 2,
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.18 : 0.1)}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 4px 24px ${alpha('#000', 0.35)}`
            : `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}, 0 0 0 1px ${alpha(theme.palette.divider, 0.04)}`,
        bgcolor: paperBg
      }}
    >
      {/* Accent bar */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${primary} 0%, ${alpha(theme.palette.secondary?.main || primary, 0.85)} 100%)`
        }}
      />

      <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent='space-between'
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap' useFlexGap>
            <Typography variant='h6' fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              Question
            </Typography>
            {templateId && (
              <Chip
                size='small'
                label={humanizeTemplate(templateId)}
                sx={{
                  fontWeight: 700,
                  height: 26,
                  bgcolor: alpha(primary, 0.12),
                  color: primary,
                  border: 'none'
                }}
              />
            )}
            {question?.data?.question?.mediaType && (
              <Chip
                size='small'
                label={humanizeMediaType(question.data.question.mediaType)}
                sx={{
                  fontWeight: 700,
                  height: 26,
                  bgcolor: alpha(theme.palette.secondary?.main || primary, 0.14),
                  color: theme.palette.secondary?.main || primary,
                  border: 'none',
                  textTransform: 'capitalize'
                }}
              />
            )}
            {question?.language && (
              <Chip
                size='small'
                icon={<TranslateOutlinedIcon sx={{ fontSize: '16px !important', ml: '4px !important' }} />}
                label={question.language}
                variant='outlined'
                color='primary'
                sx={{ fontWeight: 600, height: 26 }}
              />
            )}
            {!canEdit && (
              <Chip size='small' label='View only' variant='outlined' color='default' sx={{ fontWeight: 600 }} />
            )}
          </Stack>

          {/* Edit button lives in the header so it can never overlap the template body. */}
          {canEdit && !isEditing && (
            <Tooltip title='Edit question & parameters'>
              <Button
                size='small'
                variant='contained'
                color='primary'
                component="label"
                onClick={enterEdit}
                startIcon={<EditOutlinedIcon fontSize='small' />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  color: 'common.white',
                  alignSelf: { xs: 'flex-end', sm: 'center' },
                  flexShrink: 0,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': { boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.4)}` }
                }}
              >
                Edit
              </Button>
            </Tooltip>
          )}
        </Stack>

        <Divider sx={{ mb: { xs: 2, sm: 2.5 }, opacity: 0.85 }} />

        {!isEditing ? (
          <ReadView question={question} theme={theme} />
        ) : (
          <Box>
            {/* Edit-mode top bar with a Cancel control. The template renders its
                own Save / Delete buttons with full validation feedback. */}
            <Stack
              direction='row'
              spacing={1.5}
              alignItems='center'
              justifyContent='space-between'
              sx={{
                mb: 2,
                p: 1.25,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.35)}`
              }}
            >
              <Stack direction='row' spacing={1} alignItems='center'>
                <EditOutlinedIcon fontSize='small' color='primary' />
                <Typography variant='body2' fontWeight={700} color='primary.main'>
                  Editing question — make your changes, then click Save Question.
                </Typography>
              </Stack>
              <Button
                size='small'
                variant='outlined'
                color='inherit'
                startIcon={<CloseIcon fontSize='small' />}
                onClick={() => {
                  setValidationErrors([])
                  exitEdit()
                }}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Cancel
              </Button>
            </Stack>

            {validationErrors.length > 0 && (
              <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>
                  {validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''} found
                </AlertTitle>
                Please fix the highlighted fields below before saving.
              </Alert>
            )}

            <DynamicQuestionTemplate
              key={question._id}
              id={question.id}
              templateId={templateId}
              data={question}
              mode={editorMode}
              saveQuestion={handleSaveValidatedQuestion}
              deleteQuestion={handleDeleteQuestion}
              validationErrors={validationErrors}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}
