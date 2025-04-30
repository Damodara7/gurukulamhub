import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const awsS3Region = process.env.NEXT_PUBLIC_AWS_S3_REGION;
export const userProfileBucketName = process.env.NEXT_PUBLIC_AWS_S3_USERPROFILE_UPLOAD_BUCKET
export const quizBucketName = process.env.NEXT_PUBLIC_AWS_S3_QUIZ_UPLOAD_BUCKET

export const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_S3_REGION, // from AWS S3 Bucket properties
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET,
    },
});

// Utility function to upload file to S3
export async function uploadFileToS3({ bucketName, fileBuffer,
    fileName: key, fileType }) {
    const putParams = {
        Bucket: bucketName,
        Key: key, // shd be unique-value with file path, will create folders accordingly.
        Body: fileBuffer,
        ContentType: fileType,
        CacheControl: 'no-cache, no-store, must-revalidate'
    };
    const command = new PutObjectCommand(putParams);
    await s3Client.send(command);
    return key;
}

// Utility function to delete file from S3
export async function deleteFileFromS3({ fileName: key, bucketName }) {
    const deleteParams = {
        Bucket: bucketName,
        Key: key, // unique
    };

    try {
        const command = new DeleteObjectCommand(deleteParams);
        const result = await s3Client.send(command);
        console.log("File successfully deleted from S3:", key);
        return result;
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw new Error("Failed to delete file from S3");
    }
}

// Utility function to delete a file from S3 when the extension is unknown
export async function deleteFileWithUnknownExtension({ bucketName, fileNamePrefix }) {
    try {
        // Step 1: List objects in S3 with the provided file name prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: fileNamePrefix, // Use the prefix to find objects starting with this key
        };

        const listCommand = new ListObjectsV2Command(listParams);
        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            // Step 2: Find the first object matching the prefix (you can change logic for other matches)
            const matchedObject = listResponse.Contents.find(obj => obj.Key.startsWith(fileNamePrefix));

            if (matchedObject) {
                // Step 3: Delete the matched object
                const deleteParams = {
                    Bucket: bucketName,
                    Key: matchedObject.Key, // Use the exact key (including extension) to delete the object
                };

                const deleteCommand = new DeleteObjectCommand(deleteParams);
                const deleteResponse = await s3Client.send(deleteCommand);
                console.log(`File successfully deleted from S3: ${matchedObject.Key}`);
                return deleteResponse;
            } else {
                console.log(`No object found with prefix: ${fileNamePrefix}`);
                throw new Error("No matching file found for deletion.");
            }
        } else {
            console.log(`No objects found with prefix: ${fileNamePrefix}`);
            throw new Error("No files found in the S3 bucket with the given prefix.");
        }
    } catch (error) {
        console.error("Error in deleteFileWithUnknownExtension:", error);
        throw new Error("Failed to delete file from S3.");
    }
}

export async function deleteAllMatchingFilesWithUnknownExtension({ bucketName, fileNamePrefix }) {
    try {
        // Step 1: List objects in S3 with the provided file name prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: fileNamePrefix, // Use the prefix to find objects starting with this key
        };

        const listCommand = new ListObjectsV2Command(listParams);
        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            // Step 2: Iterate over all matched objects and delete each
            const deleteResults = [];

            for (const matchedObject of listResponse.Contents.filter(obj => obj.Key.startsWith(fileNamePrefix))) {
                try {
                    // Step 3: Delete the matched object
                    const deleteParams = {
                        Bucket: bucketName,
                        Key: matchedObject.Key, // Use the exact key to delete the object
                    };

                    const deleteCommand = new DeleteObjectCommand(deleteParams);
                    const deleteResponse = await s3Client.send(deleteCommand);

                    console.log(`File successfully deleted from S3: ${matchedObject.Key}`);
                    deleteResults.push({ key: matchedObject.Key, status: "Deleted" });
                } catch (error) {
                    console.error(`Error deleting file ${matchedObject.Key}:`, error);
                    deleteResults.push({ key: matchedObject.Key, status: "Failed" });
                }
            }

            // Step 4: Return the result of all delete operations
            return deleteResults;
        } else {
            console.log(`No objects found with prefix: ${fileNamePrefix}`);
            throw new Error("No files found in the S3 bucket with the given prefix.");
        }
    } catch (error) {
        console.error("Error in deleteAllFilesWithUnknownExtension:", error);
        throw new Error("Failed to delete files from S3.");
    }
}


export async function getFileUrlFromS3({ fileName: key, bucketName }) {
    try {
        return "https://" + bucketName + ".s3." + awsS3Region + ".amazonaws.com/" + key + "?rsc_" + getRandomNumber();
    } catch (error) {
        console.error("Error fetching file from S3:", error);
        throw new Error("Failed to fetch file from S3");
    }
}

// Utility function to get a file URL from S3 without needing the file extension
export async function getFileUrlFromS3WithUnknownExtension({ bucketName, fileNamePrefix }) {
    try {
        // Step 1: List objects in S3 with the provided file name prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: fileNamePrefix, // Use the prefix to find objects starting with this key
        };

        const listCommand = new ListObjectsV2Command(listParams);
        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            // Step 2: Find the first object matching the prefix (you can change logic for other matches)
            const matchedObject = listResponse.Contents.find(obj => obj.Key.startsWith(fileNamePrefix));

            if (matchedObject) {
                // Step 3: Generate the URL for the matched object
                const fileUrl = `https://${bucketName}.s3.${awsS3Region}.amazonaws.com/${matchedObject.Key}?rsc_${getRandomNumber()}`;
                return fileUrl;
            } else {
                console.log(`No object found with prefix: ${fileNamePrefix}`);
                throw new Error("No matching file found.");
            }
        } else {
            console.log(`No objects found with prefix: ${fileNamePrefix}`);
            throw new Error("No files found in the S3 bucket with the given prefix.");
        }
    } catch (error) {
        console.error("Error in getFileUrlFromS3WithUnknownExtension:", error);
        throw new Error("Failed to get file URL from S3.");
    }
}

export async function getAllMatchingFileUrlsFromS3WithUnknownExtension({ bucketName, fileNamePrefix }) {
    try {
        // Step 1: List objects in S3 with the provided file name prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: fileNamePrefix, // Use the prefix to find objects starting with this key
        };

        const listCommand = new ListObjectsV2Command(listParams);
        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            // Step 2: Generate URLs for all matched objects
            const fileUrls = listResponse.Contents
                .filter(obj => obj.Key.startsWith(fileNamePrefix)) // Filter objects that match the prefix
                .map(matchedObject => {
                    // Step 3: Construct the URL for each matched object
                    return `https://${bucketName}.s3.${awsS3Region}.amazonaws.com/${matchedObject.Key}?rsc_${getRandomNumber()}`;
                });

            // Step 4: Return all generated URLs
            return fileUrls;
        } else {
            console.log(`No objects found with prefix: ${fileNamePrefix}`);
            throw new Error("No files found in the S3 bucket with the given prefix.");
        }
    } catch (error) {
        console.error("Error in getAllMatchingFileUrlsFromS3WithUnknownExtension:", error);
        throw new Error("Failed to get file URLs from S3.");
    }
}



// Utility function to get a file URL from S3 without needing the file extension
export async function getFileUrlWithUnknownExtension({ bucketName, fileNamePrefix }) {
    try {
        // Step 1: List objects in S3 with the provided file name prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: fileNamePrefix, // Use the prefix to find objects starting with this key
        };

        const listCommand = new ListObjectsV2Command(listParams);
        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            // Step 2: Find the first object matching the prefix (you can change logic for other matches)
            const matchedObject = listResponse.Contents.find(obj => obj.Key.startsWith(fileNamePrefix));

            if (matchedObject) {
                // Step 3: Generate the URL for the matched object
                const fileUrl = `https://${bucketName}.s3.${awsS3Region}.amazonaws.com/${matchedObject.Key}?rsc_${getRandomNumber()}`;
                return fileUrl;
            } else {
                console.log(`No object found with prefix: ${fileNamePrefix}`);
                throw new Error("No matching file found.");
            }
        } else {
            console.log(`No objects found with prefix: ${fileNamePrefix}`);
            throw new Error("No files found in the S3 bucket with the given prefix.");
        }
    } catch (error) {
        console.error("Error in getFileUrlWithUnknownExtension:", error);
        throw new Error("Failed to get file URL from S3.");
    }
}


function getRandomNumber() {
    return Math.random() * 3949339393;
}

// Utility function to convert a ReadableStream to text
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function getJsonFileFromS3({ bucketName, fileName }) {
  const getParams = {
    Bucket: bucketName,
    Key: fileName, // The key (file path) in S3
  };

  try {
    const command = new GetObjectCommand(getParams);
    const response = await s3Client.send(command);

    // Convert the ReadableStream to a string and then parse as JSON
    const fileContent = await streamToString(response.Body);
    const jsonData = JSON.parse(fileContent);

    console.log("Parsed JSON data:", jsonData);
    return jsonData;
  } catch (error) {
    console.error("Error fetching or parsing JSON file from S3:", error);
    throw new Error("Failed to fetch or parse JSON file from S3");
  }
}

// Convert file to buffer
export async function convertFileToBufferFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(Buffer.from(reader.result));  // Convert ArrayBuffer to Buffer
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);  // Read file as ArrayBuffer
    });
}

export async function getFileDataFromS3({ fileName: key, bucketName }) {
  const getParams = {
      Bucket: bucketName,
      Key: key, // The unique key of the file in S3
  };

  try {
      const command = new GetObjectCommand(getParams);
      const response = await s3Client.send(command);

      // Convert the response.Body (ReadableStream) to a Blob
      const blob = await streamToBlob(response.Body); // Converting to Blob

      return blob; // Return the Blob or ArrayBuffer as needed
  } catch (error) {
      console.error("Error fetching file from S3:", error);
      throw new Error("Failed to fetch file from S3");
  }
}


export async function getFileFromS3({ fileName: key, bucketName }) {
    const getParams = {
        Bucket: bucketName,
        Key: key, // The unique key of the file in S3
    };

    try {
        const command = new GetObjectCommand(getParams);
        const response = await s3Client.send(command);

        // Convert the response.Body (ReadableStream) to a Blob
        const blob = await streamToBlob(response.Body); // Converting to Blob

        const file = convertBlobToFile({ blob: blob, fileName: key });

        console.log("File successfully fetched from S3:", file);
        return file; // Return the Blob or ArrayBuffer as needed
    } catch (error) {
        console.error("Error fetching file from S3:", error);
        throw new Error("Failed to fetch file from S3");
    }
}

// Utility function to get a file from S3 without knowing the file extension
export async function getFileFromS3WithUnknownExtension({ bucketName, fileNamePrefix }) {
    try {
        // Step 1: List objects in S3 with the provided file name prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: fileNamePrefix, // Use the prefix to find objects starting with this key
        };

        const listCommand = new ListObjectsV2Command(listParams);
        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            // Step 2: Find the first object matching the prefix
            const matchedObject = listResponse.Contents.find(obj => obj.Key.startsWith(fileNamePrefix));

            if (matchedObject) {
                // Step 3: Fetch the matched object using its full key
                const getParams = {
                    Bucket: bucketName,
                    Key: matchedObject.Key, // Use the exact key to fetch the object
                };

                const command = new GetObjectCommand(getParams);
                const response = await s3Client.send(command);

                // Step 4: Convert the response.Body (ReadableStream) to a Blob
                const blob = await streamToBlob(response.Body);

                // Step 5: Convert Blob to File
                const file = convertBlobToFile({ blob: blob, fileName: matchedObject.Key, fileType: getFileExtension(matchedObject.Key) });

                console.log("File successfully fetched from S3:", file);
                return file; // Return the File object
            } else {
                console.log(`No object found with prefix: ${fileNamePrefix}`);
                throw new Error("No matching file found.");
            }
        } else {
            console.log(`No objects found with prefix: ${fileNamePrefix}`);
            throw new Error("No files found in the S3 bucket with the given prefix.");
        }
    } catch (error) {
        console.error("Error in getFileFromS3WithUnknownExtension:", error);
        throw new Error("Failed to fetch file from S3.");
    }
}

export async function getAllMatchingFilesFromS3WithUnknownExtension({ bucketName, fileNamePrefix }) {
    try {
        // Step 1: List objects in S3 with the provided file name prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: fileNamePrefix, // Use the prefix to find objects starting with this key
        };

        const listCommand = new ListObjectsV2Command(listParams);
        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
            const files = [];

            // Step 2: Iterate over all matched objects
            for (const matchedObject of listResponse.Contents.filter(obj => obj.Key.startsWith(fileNamePrefix))) {
                try {
                    // Step 3: Fetch the matched object using its full key
                    const getParams = {
                        Bucket: bucketName,
                        Key: matchedObject.Key, // Use the exact key to fetch the object
                    };

                    const command = new GetObjectCommand(getParams);
                    const response = await s3Client.send(command);

                    // Step 4: Convert the response.Body (ReadableStream) to a Blob
                    const blob = await streamToBlob(response.Body);

                    // Step 5: Convert Blob to File
                    const file = convertBlobToFile({
                        blob: blob,
                        fileName: matchedObject.Key,
                        fileType: getFileExtension(matchedObject.Key),
                    });

                    console.log("File successfully fetched from S3:", file);
                    files.push(file); // Add each file to the array
                } catch (error) {
                    console.error(`Error fetching file ${matchedObject.Key}:`, error);
                    // Continue to the next file even if one fails
                }
            }

            // Step 6: Return all fetched files
            if (files.length > 0) {
                return files; // Return the array of File objects
            } else {
                throw new Error("No matching files found.");
            }
        } else {
            console.log(`No objects found with prefix: ${fileNamePrefix}`);
            throw new Error("No files found in the S3 bucket with the given prefix.");
        }
    } catch (error) {
        console.error("Error in getAllFilesFromS3WithUnknownExtension:", error);
        throw new Error("Failed to fetch files from S3.");
    }
}


// Helper function to convert ReadableStream to Blob
async function streamToBlob(stream) {
    const reader = stream.getReader();
    const chunks = [];
    let done, value;

    // Read the stream and collect chunks
    while (!(done = (await reader.read()).done)) {
        chunks.push(value);
    }

    // Create a Blob from the collected chunks
    return new Blob(chunks);
}

export function convertBlobToFile({ blob, fileName, fileType }) {
    return new File([blob], fileName, { type: fileType || blob.type });
}

// Utility function to get the file extension from the key or file name
export function getFileExtension(fileName) {
    // Use regex or split the file name to get the extension
    const fileNameParts = fileName.split('.');
    if (fileNameParts.length > 1) {
        return fileNameParts[fileNameParts.length - 1]; // Return the part after the last dot
    }
    console.log('File extension is not found.')
}
