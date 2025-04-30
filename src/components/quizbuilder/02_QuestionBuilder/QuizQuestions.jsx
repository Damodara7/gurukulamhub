import { Fab, Box, Tooltip, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import IconButtonTooltip from '@/components/IconButtonTooltip'

const templateIdsInfoObj = {
  "single-choice": { name: "Single choice", icon: <i className="ri-radio-button-line" /> },
  "multiple-choice": { name: "Multiple choice", icon: <i className="ri-checkbox-line" /> },
  "true-or-false": { name: "True or false", icon: <ToggleOnIcon /> },
  "fill-in-blank": { name: "Fill in blanks", icon: <i className="ri-input-field" /> },
};

const SortableItem = ({ question, selectedQuestion, handleQuestionClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const style = {
    padding: 16,
    border: "1px solid",
    borderColor: theme.palette.primary.main,
    backgroundColor: selectedQuestion?.id === question.id ? theme.palette.primary.dark : "transparent",
    cursor: "grab",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    minWidth: isMdUp ? "100px" : "auto",
    color: selectedQuestion?.id === question.id ? "white" : theme.palette.primary.dark,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {/* Drag Handle */}
        <IconButtonTooltip title='Drag' {...attributes} {...listeners} sx={{ cursor: "grab", color: "gray" }}>
          <DragIndicatorIcon />
        </IconButtonTooltip>

        {/* Question Button */}
        <Fab
          style={{
            color: selectedQuestion?.id === question.id ? theme.palette.primary.main : "white",
            backgroundColor: selectedQuestion?.id === question.id ? "white" : theme.palette.primary.main,
          }}
          onClick={() => handleQuestionClick(question)}
        >
          Q{question.order}
        </Fab>
      </Box>

      {/* Tooltip for question type */}
      <Tooltip title={templateIdsInfoObj[question.templateId].name}>
        {templateIdsInfoObj[question.templateId].icon}
      </Tooltip>
    </motion.div>
  );
};

const QuizQuestions = ({ setShowAddQuestion, selectedQuestion, setSelectedQuestion, questions, setQuestions, showAddQuestion }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const handleAddQuestionClick = () => {
    setShowAddQuestion(true);
    setSelectedQuestion(null);
  };

  const handleQuestionClick = (question) => {
    setShowAddQuestion(false);
    setSelectedQuestion(question);
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setQuestions((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === active.id);
      const newIndex = prev.findIndex((q) => q.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <Box sx={{ display: "flex", gap: "15px" }}>
      {/* Add New Question Button */}
      <Box
        sx={{
          p: 2,
          border: "1px dashed",
          borderColor: showAddQuestion ? theme.palette.error.main : theme.palette.primary.main,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: isMdUp ? "100px" : "auto",
        }}
      >
        <Fab
          style={{ backgroundColor: "white" }}
          onClick={() => (showAddQuestion ? setShowAddQuestion(false) : handleAddQuestionClick())}
        >
          {showAddQuestion ? "Cancel" : "Add New"}
        </Fab>
      </Box>

      {/* Drag and Drop Context */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            <div style={{ display: "flex", gap: "15px", alignItems: "center", overflowX: "auto" }}>
              {questions.map((question) => (
                <SortableItem
                  key={question.id}
                  question={question}
                  selectedQuestion={selectedQuestion}
                  handleQuestionClick={handleQuestionClick}
                />
              ))}
            </div>
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default QuizQuestions;
