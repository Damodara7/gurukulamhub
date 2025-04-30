//import Compress from 'compress.js';

function isImgUrlLoad(url) {
  const img = new Image();
  img.src = url;
  return new Promise((resolve) => {
    img.onerror = () => resolve(false);
    img.onload = () => resolve(true);
  });
}

const isImageUrlHead = async (url) => {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    console.log("Response is returned...", res)
    // .then((res) => {
    const contentType = res.headers.get('Content-Type');
    //console.log("Testing head header.")
    return !!(contentType && contentType.startsWith('image'))
  } catch (err) {
    return false;
  }
  // .catch((err) => {
  // console.error('Error checking URL:', err);
  //console.log("Returning false")
  // return false; // Return false if any error occurs
  //  });
}

function isImageUrlExt(url) {
  //console.log("Testing extension.")
  if (url === null) return false;
  return /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
}


const isImageUrl = async (url) => {
  if (isImageUrlExt(url) === true) {
    console.log("Extension tested... image url")
    return true;
  }
  const isImage = await isImageUrlHead(url);
  console.log("Is image", isImage)
  if (isImage === true) {
    console.log("Extension failed... head tested image url is true..")
    return true;
  }
  else {
    console.log("all failed returning false.")
    return false;
  }
}

const urls = [
  'https://avatars.githubusercontent.com/u/33640448?v=4',
  'https://httpbin.org/image/webp',
  'https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg'
];

//Promise.all(urls.map((url) => isImageUrl(url))).then(console.log); // [true, true ,true]

const checkMediaUrl = async (imageUrl, mediaTypeVal, setMediaTypeVal) => {
  if (mediaTypeVal === null || mediaTypeVal === undefined) {
    let isImage = await isImageUrl(imageUrl);
    console.log(" is image url returned..", isImage)
    if (isImage === true) {
      setMediaTypeVal('image');
      console.log("#####MediaViewer###### :  ", mediaTypeVal)
    } else {
      if (imageUrl === null || imageUrl === undefined || imageUrl.trim().length === 0) {
        setMediaTypeVal('none')
      }
      else setMediaTypeVal('video')
    }
    //}
  }
}


const handleCompress = async (event) => {
  const compress = new Compress();
  const files = [...event.target.files];
  const options = {
    size: 0.3, // the max size in MB, defaults to 2MB
    quality: 0.75, // the quality of the image, max is 1
    maxWidth: 1920, // the max width of the output image, defaults to 1920px
    maxHeight: 1920, // the max height of the output image, defaults to 1920px
    resize: true // defaults to true, if set to false, width and height are ignored
  };

  const compressedImages = await compress.compress(files, options);
  console.log(compressedImages);
};


export default isImageUrl;
