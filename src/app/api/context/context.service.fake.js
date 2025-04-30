// fallbackMutations.js

// Fallback implementation of createQuiz2 mutation
export const add = async (input) => {
  // Perform fallback logic here, such as logging the mutation input
  console.log('Fallback implementation of add mutation:', input);

  // Simulate a successful response
  return {
    id: 'fallback-quiz-id', // Example ID for the created quiz
    name: input.name // Example name from input
    // Add other fields as needed
  };
};



// Fallback implementation of createQuiz2 mutation
export const getAll= async () => {
  // Perform fallback logic here, such as logging the mutation input
  console.log('Fallback implementation of getAll query:');

  // Simulate a successful response
  return [{
    id: 'quiz_ramayana', // Example ID for the created quiz
    name: "ramayana quiz 1" // Example name from input
    // Add other fields as needed
  },
  {
    id: 'quiz_id2', // Example ID for the created quiz
    name: "mock-quiz2" // Example name from input
    // Add other fields as needed
  },
  ];
};


//export  createQuiz2, listQuiz2s ;
