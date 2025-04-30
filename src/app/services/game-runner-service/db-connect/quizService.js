
const Quizzes = require("./quiz.model");
const QuestionsModel = require("./question.model")

// Get quiz details by quiz ID
async function getQuizDetailsById(quizId) {
  try {
    const quiz = await Quizzes.findOne({ _id: quizId }); // Find quiz by ID

    if (!quiz) {
      return {
        success: false,
        result: null,
        message: `No quiz found with ID: ${quizId}`,
      };
    }

    var quizLanguages =
      [
        {
          language: quiz.language,
          isPrimaryLanguage: true
        },
        ...quiz.secondaryLanguages.map(lang => ({ ...lang, isPrimaryLanguage: false }))
      ] || []


    // Extract languages and format them as a comma-separated string
    const languagesList = quiz.secondaryLanguages.map(lang => lang.name).join(', ');
    const languagesCodes = quiz.secondaryLanguages.map(lang => lang.code).join(', ');

    console.log("##################### Quiz languages", languagesCodes)

    // Prepare quiz details to return
    const quizDetails = {
      quizId: quiz._id,
      _id: quiz._id,
      title: quiz.title,
      description: quiz.details,
      primaryLanguage: quiz.language.name,
      primaryLanguageCode: quiz.language.code,
      secondaryLanguagesCount: quiz.secondaryLanguages.length,
      secondaryLanguagesList: languagesList, // Comma-separated language names
      secondaryLanguagesCodes: languagesCodes,
    };

    return {
      success: true,
      result: quizDetails,
      message: 'Quiz details retrieved successfully',
    };

    // Display quiz details (modify fields as per your schema)
    //console.log(`Quiz ID: ${quiz._id}, Title: ${quiz.title}, Description: ${quiz.description}, Total Questions: ${quiz.questions.length}`);
  } catch (error) {
    return {
      success: false,
      result: null,
      message: `Error retrieving quiz with ID ${quizId}: ${error.message}`,
    };
  }
}

// Get quiz details by quiz ID
async function getQuizDetailsByQuizId(quizId) {
  try {
    const quiz = await Quizzes.findOne({ id: quizId }); // Find quiz by ID

    if (!quiz) {
      return {
        success: false,
        result: null,
        message: `No quiz found with ID: ${quizId}`,
      };
    }

    var quizLanguages =
      [
        {
          language: quiz.language,
          isPrimaryLanguage: true
        },
        ...quiz.secondaryLanguages.map(lang => ({ ...lang, isPrimaryLanguage: false }))
      ] || []

    console.log("##################### Quiz languages", quizLanguages)
    // Extract languages and format them as a comma-separated string
    const languagesList = quiz.secondaryLanguages.map(lang => lang.code + "|" + lang.name).join(', ');

    // Prepare quiz details to return
    const quizDetails = {
      _id: quiz._id,
      quizId: quiz.id,
      title: quiz.title,
      description: quiz.details,
      primaryLanguage: quiz.language.name,
      //totalQuestions: quiz.questions.length, // Assuming questions is an array
      secondaryLanguagesCount: quiz.secondaryLanguages.length,
      secondaryLanguagesList: languagesList, // Comma-separated language names
    };

    return {
      success: true,
      result: quizDetails,
      message: 'Quiz details retrieved successfully',
    };

    // Display quiz details (modify fields as per your schema)
    //console.log(`Quiz ID: ${quiz._id}, Title: ${quiz.title}, Description: ${quiz.description}, Total Questions: ${quiz.questions.length}`);
  } catch (error) {
    return {
      success: false,
      result: null,
      message: `Error retrieving quiz with ID ${quizId}: ${error.message}`,
    };
  }
}

async function getQuestionsByQuizIdAndLanguageCode(quizId, languageCode) {
  try {
    // Query to find questions with matching quizId and language code (before the pipe '|')
    // const languagePattern = new RegExp(`^${languageCode}\\|`); // Match the languageCode followed by a pipe
    // console.log("languagePattern",languagePattern)
    // const questions = await QuestionsModel.find({
    //   _id: quizId,
    //   language: { $regex: languagePattern }
    // });
   console.log("QuizId and language code are",quizId,languageCode);
    // Fetch questions based on the quizId and language code
    const questions = await QuestionsModel.find({
      quizId: quizId,
      'data.language': new RegExp(`^${languageCode}`, 'i'), // Match the language code (case insensitive)
      status: 'active', // Ensure the status is active
  });

    if (questions.length > 0) {
      return {
        success: true,
        result: questions,
        message: `${questions.length} questions found for quizId: ${quizId} in language: ${languageCode}`
      };
    } else {
      return {
        success: false,
        result: [],
        message: `No questions found for quizId: ${quizId} in language: ${languageCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      result: [],
      message: `Error fetching questions: ${error.message}`
    };
  }
}

async function getGroupedQuestionsByQuizIdAndLanguageCode(quizId, languageCode = 'en') {
  try {
    // Regular expression to match the language code followed by a pipe '|'
    const languagePattern = new RegExp(`^${languageCode}\\|`);

    // Aggregation pipeline to group questions by primaryQuestionId
    const groupedQuestions = await QuestionsModel.aggregate([
      {
        $match: {
          quizId,
          //language: { $regex: languagePattern }
        }
      },
      {
        $group: {
          _id: "$primaryQuestionId",
          questions: { $push: "$$ROOT" }  // Push all matching questions into the "questions" array
        }
      },
      // {
      //   $sort: { "_id.primaryQuestionId": 1 } // Sort by primaryQuestionId (optional)
      // }
    ]);
    if (groupedQuestions.length > 0) {
      // Map the questions for better readability
      const result = groupedQuestions.map(group => ({
        primaryQuestionId: group._id,
        questions: group.questions.map(q => {
          console.log(q)
          return ({
            id: q.id,
            title: q.title, // Assuming there's a title or question text
            language: q.language,
            status: q.status
          })
        })

      }));
      return {
        success: true,
        result: result,
        message: `${groupedQuestions.length} question groups found for quizId: ${quizId} in language: ${languageCode}`
      };
    } else {
      return {
        success: false,
        result: [],
        message: `No questions found for quizId: ${quizId} in language: ${languageCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      result: [],
      message: `Error fetching questions: ${error.message}`
    };
  }
}

async function getAllQuestionsByQuizId(quizId) {
  try {
    const questions = await QuestionsModel.find({ quizId: quizId });

    if (questions.length > 0) {
      return {
        success: true,
        result: questions,
        message: `${questions.length} questions found for quizId: ${quizId}`
      };
    } else {
      return {
        success: false,
        result: [],
        message: `No questions found for quizId: ${quizId}`
      };
    }
  } catch (error) {
    return {
      success: false,
      result: [],
      message: `Error fetching questions: ${error.message}`
    };
  }
}

async function getPrimaryQuestionsByQuizId(quizId) {

  try {
    const primaryQuestions = await QuestionsModel.find({
      quizId: quizId,
      isPrimary: true // Filter for primary questions
    });

    if (primaryQuestions.length > 0) {
      return {
        success: true,
        result: primaryQuestions,
        message: `${primaryQuestions.length} primary questions found for quizId: ${quizId}`
      };
    } else {
      return {
        success: false,
        result: [],
        message: `No primary questions found for quizId: ${quizId}`
      };
    }
  } catch (error) {
    return {
      success: false,
      result: [],
      message: `Error fetching primary questions: ${error.message}`
    };
  }
}

async function getPrimaryQuestionsAndGroupedQuestions(quizId) {
  try {
    // Step 1: Retrieve primary questions for the quiz
    const primaryQuestions = await QuestionsModel.find({
      quizId,
      isPrimary: true // Assuming you have an `isPrimary` field to identify primary questions
    });

    //console.log("Primary questions",primaryQuestions)

    // Step 2: Group questions by primaryQuestionId
    const groupedQuestions = await QuestionsModel.aggregate([
      {
        $match: {
          quizId: quizId // Match the given quizId
        }
      },
      {
        $group: {
          _id: "$primaryQuestionId", // Group by primaryQuestionId
          secondaryQuestions: { $push: "$$ROOT" } // Push the entire question object
        }
      }
    ]);

    console.log("Grouped questions", groupedQuestions)

    // Step 3: Prepare final result
    const result = groupedQuestions.map(group => {
      // Find corresponding primary question
      const primaryQuestion = primaryQuestions.find(pq => pq.id === group._id);

      return {
        primaryQuestionId: group._id || 'All Primary Questions',
        primaryQuestionDetails: primaryQuestion ? {
          id: primaryQuestion.id,
          quizId: primaryQuestion.quizId,
          language: primaryQuestion.language,
          status: primaryQuestion.status,
          createdBy: primaryQuestion.createdBy,
          approvalState: primaryQuestion.approvalState,
          data: primaryQuestion.data
        } : null, // Include primary question details
        secondaryQuestions: group.secondaryQuestions.map(q => ({
          id: q.id,
          quizId: q.quizId,
          language: q.language,
          status: q.status,
          createdBy: q.createdBy,
          approvalState: q.approvalState,
          data: q.data
        }))
      };
    });

    return {
      success: true,
      groupedQuestions: result,
      message: `${result.length} question groups found for quizId: ${quizId}, along with ${primaryQuestions.length} primary questions.`
    };
  } catch (error) {
    return {
      success: false,
      groupedQuestions: [],
      message: `Error fetching questions: ${error.message}`
    };
  }
}


module.exports = { getQuizDetailsById, getQuestionsByQuizIdAndLanguageCode, getGroupedQuestionsByQuizIdAndLanguageCode, getAllQuestionsByQuizId, getQuizDetailsByQuizId, getPrimaryQuestionsByQuizId, getPrimaryQuestionsAndGroupedQuestions };
