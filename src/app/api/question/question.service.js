import connectMongo from '@/utils/dbConnect-mongo'
import Question from './question.model.js'
import Quiz from '../quiz/quiz.model.js'
import { questionCreateRequestDtoSchema } from './question.validator.js'

const Artifact = 'Question'
const ArtifactModel = Question
const CreateRequestDtoSchema = questionCreateRequestDtoSchema

// **Add Artifact**
export async function add(addRequestData) {
  //await createRootDocument();

  try {
    await CreateRequestDtoSchema.validate(addRequestData, { abortEarly: false })
  } catch (err) {
    console.error(err)
    return { status: 'error', result: null, message: err.message }
  }

  //{id,name, details, owner, createdBy, privacy, parentContextId, parentType, tags, status}) {
  await connectMongo()
  try {
    const newArtifact = new ArtifactModel({ ...addRequestData })
    await newArtifact.save()

    // Update the quiz's secondary languages count if the question is not the primary language
    if (addRequestData.isPrimary === false) {
      const langCode = addRequestData.language.split('|')[0];
      const langName = addRequestData.language.split('|')[1];

      // Find the quiz by ID
      const quiz = await Quiz.findById(addRequestData.quizId);

      if (quiz) {
        // Check if the language already exists in secondaryLanguages
        const existingLanguage = quiz.secondaryLanguages.find(lang => lang.code === langCode);

        if (existingLanguage) {
          // If the language exists, increment the count
          await Quiz.updateOne(
            { _id: addRequestData.quizId, 'secondaryLanguages.code': langCode },
            { $inc: { 'secondaryLanguages.$.count': 1 } } // Increment the count of the found language
          );
        } else {
          // If the language doesn't exist, push the new language with count 1
          await Quiz.updateOne(
            { _id: addRequestData.quizId },
            { $push: { secondaryLanguages: { code: langCode, name: langName, count: 1 } } } // Push the new language with count 1
          );
        }
      }
    }
    console.log(`Add Sec Lang updated in Quiz Successfully.`);

    console.log(`${Artifact}` + ' added successfully!')
    const allArtifacts = await ArtifactModel.find({quizId: addRequestData.quizId})
    return { status: 'success', result: allArtifacts, message: `${Artifact}` + ' Added Successfully' }
  } catch (err) {
    console.error('Error adding' + `${Artifact}`, err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Add Many
export async function addMany(addRequestDataArray) {
  // Validate all data at once
  try {
    for (const addRequestData of addRequestDataArray) {
      await CreateRequestDtoSchema.validate(addRequestData, { abortEarly: false });
    }
  } catch (err) {
    console.error('Validation Error:', err);
    return { status: 'error', result: null, message: err.message };
  }

  await connectMongo();

  try {
    // Insert all artifacts in one go
    const newArtifacts = await ArtifactModel.insertMany(addRequestDataArray);
    console.log('Artifacts added successfully:', newArtifacts);

    // Process secondary language update only once
    const { quizId, language, isPrimary } = addRequestDataArray[0];
    if (isPrimary === false) {
      const [langCode, langName] = language.split('|');

      // Find the quiz and update its secondary languages
      const quiz = await Quiz.findById(quizId);

      if (quiz) {
        const existingLanguage = quiz.secondaryLanguages.find(lang => lang.code === langCode);

        if (existingLanguage) {
          // Increment the count for the existing language
          await Quiz.updateOne(
            { _id: quizId, 'secondaryLanguages.code': langCode },
            { $inc: { 'secondaryLanguages.$.count': addRequestDataArray.length } } // Increment by the number of added questions
          );
        } else {
          // Add the new language
          await Quiz.updateOne(
            { _id: quizId },
            { $push: { secondaryLanguages: { code: langCode, name: langName, count: addRequestDataArray.length } } }
          );
        }

        console.log('Secondary language updated successfully for quiz:', quizId);
      }
    }

    const allArtifacts = await ArtifactModel.find({quizId: quizId}); // Fetch updated data
    return { status: 'success', result: allArtifacts, message: 'Artifacts added successfully' };
  } catch (err) {
    console.error('Error adding artifacts:', err);
    return { status: 'error', result: null, message: err.message };
  }
}


// **Update Artifact**

export async function update(id, updateData) {
  await connectMongo()

  try {
    const updatedArtifact = await ArtifactModel.findByIdAndUpdate(id, updateData, { new: true }) // Return updated document
    if (!updatedArtifact) {
      console.error(`${Artifact}` + 'not found for update.')
      return { status: 'error', result: null, message: `${Artifact}` + 'not found for update.' }
    }
    const allArtifacts = await ArtifactModel.find({quizId: updatedArtifact.quizId})
    // if(allAds)
    return { status: 'success', result: allArtifacts, message: `${Artifact}` + ' Updated Successfully' }
  } catch (err) {
    console.error('Error updating `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// **Soft Delete Artifact**
export async function softDelete(id) {
  await connectMongo()

  try {
    const updatedArtifact = await ArtifactModel.findByIdAndUpdate(id, { status: 'deleted' }) // Return updated document
    if (!updatedArtifact) {
      console.error('`${Artifact}` not found for deletion.')
      return { status: 'error', result: null, message: '`${Artifact}` not found for deletion.' }
    }
    const allArtifacts = await ArtifactModel.find({quizId: updatedArtifact.quizId})
    // if(allAds)
    return { status: 'success', result: allArtifacts, message: '`${Artifact}` Marked Deleted Successfully' }
  } catch (err) {
    console.error('Error deleting `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// **Delete Artifact**
export async function deleteArtifact(id) {
  await connectMongo()
  try {
    const result = await ArtifactModel.findByIdAndDelete(id)

    // Delete Sec Lang in Quiz
    if (result.isPrimary === false) {
      const quizId = result.quizId;
      const langCode = result.language.split('|')[0];

      // Find the quiz first to check the count of the language
      const quiz = await Quiz.findOne({ _id: quizId });

      if (quiz) {
        // Find the specific language in secondaryLanguages
        const existingLanguage = quiz.secondaryLanguages.find(lang => lang.code === langCode);

        if (existingLanguage) {
          if (existingLanguage.count === 1) {
            // If the count is 1, delete the language from secondaryLanguages
            await Quiz.findOneAndUpdate(
              { _id: quizId },
              { $pull: { secondaryLanguages: { code: langCode } } }, // Remove the language from the array
              { new: true } // Return the updated document
            );
          } else {
            // If the count is greater than 1, decrease the count by 1
            await Quiz.findOneAndUpdate(
              { _id: quizId, 'secondaryLanguages.code': langCode },
              { $inc: { 'secondaryLanguages.$.count': -1 } }, // Decrease the count
              { new: true } // Return the updated document
            );
          }
        } else {
          console.log(`Language with code ${langCode} not found in secondaryLanguages.`);
        }
      } else {
        console.log(`Quiz with ID ${quizId} not found.`);
      }
    }
    console.log(`Delete Sec Lang updated in Quiz Successfully.`);


    if (result) {
      console.log(`${Artifact} deleted successfully!` + result._id)
      const allArtifacts = await ArtifactModel.find({quizId: quizId})
      console.log(allArtifacts.length)
      // if(allAds)
      return { status: 'success', result: allArtifacts, message: '`${Artifact}` Deleted Successfully' }
      // return   { status:"success", result:{}, message:"Quiz Deleted Successfully" };
    } else {
      return { status: 'error', result: {}, message: '`${Artifact}` Delete failed' }
    }
  } catch (err) {
    console.error('Error deleting `${Artifact}`:', err)
    return { status: 'error', result: {}, message: 'Error deleting `${Artifact}` :' + err.message }
  }
}

// **Get Active Artifact**
export async function getActive() {
  await connectMongo()
  try {
    const today = new Date()

    const activeArtifacts = await ArtifactModel.find({
      status: 'active' //, endDate: { $gte: today }, // Filter for ads ending today or later
    })
    if (activeArtifacts.length === 0) {
      console.log('No active `${Artifact}` found.')
    } else {
      const finalResult = {
        status: 'success',
        result: activeArtifacts,
        message: `${Artifact} (${activeArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
  }
}

export async function getActiveByEmail(queryParams) {
  console.log('Query params: ', queryParams)
  await connectMongo()
  try {
    const today = new Date()

    const activeArtifacts = await ArtifactModel.find({
      ...queryParams,
      status: 'active' //, endDate: { $gte: today }, // Filter for ads ending today or later
    })
    if (activeArtifacts.length === 0) {
      console.log('No active `${Artifact}` found.')
    } else {
      const finalResult = {
        status: 'success',
        result: activeArtifacts,
        message: `${Artifact} (${activeArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
  }
}

// **Get All Artifacts**
export async function getAll() {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ status: { $ne: 'deleted' } })
    if (allArtifacts.length === 0) {
      console.log('No  `${Artifact}` found.')
      const finalResult = { status: 'success', result: {}, message: `No ${Artifact} Exists` }
      return finalResult
    } else {
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}(${allArtifacts.length} retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
    const finalResult = { status: 'error', result: {}, message: err.message }
    return finalResult
  }
}

export async function getAllByEmail(queryParams) {
  console.log('Query params: ', queryParams)
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ ...queryParams, status: { $ne: 'deleted' } })
    if (allArtifacts.length === 0) {
      console.log(`No ${Artifact} found.`)
      const finalResult = { status: 'success', result: [], message: `No ${Artifact} Exists` }
      return finalResult
    } else {
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}(${allArtifacts.length} retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
    const finalResult = { status: 'error', result: null, message: err.message }
    return finalResult
  }
}

// **Get All Artifacts Even deleted **
export async function getAllEvenDeleted() {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({})
    if (allArtifacts.length === 0) {
      console.log('No  `${Artifact}` found.')
      const finalResult = { status: 'success', result: {}, message: 'No `${Artifact} Exists' }
      return finalResult
    } else {
      console.log('All `${Artifact}s`', allArtifacts)
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}s(${allArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting all `${Artifact}s`:', err)
    const finalResult = { status: 'error', result: {}, message: err.message }
    return finalResult
  }
}

export async function getAllEvenDeletedByEmail(queryParams) {
  console.log('Query params: ', queryParams)
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ ...queryParams })
    if (allArtifacts.length === 0) {
      console.log('No  `${Artifact}` found.')
      const finalResult = { status: 'success', result: {}, message: 'No `${Artifact} Exists' }
      return finalResult
    } else {
      // console.log('All `${Artifact}s`', allArtifacts)
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}s(${allArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting all `${Artifact}s`:', err)
    const finalResult = { status: 'error', result: {}, message: err.message }
    return finalResult
  }
}
