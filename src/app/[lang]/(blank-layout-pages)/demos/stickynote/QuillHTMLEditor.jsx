import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // Import Quill styles

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false })

export default function QuillHTMLEditor({ id, htmlContent, onUpdate }) {
  const [content, setContent] = useState(htmlContent)

  const quillModules = {
    // toolbar: [
    //   [{ header: [1, 2, 3, false] }],
    //   ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    //   [{ list: 'ordered' }, { list: 'bullet' }],
    //   ['link', 'image'],
    //   [{ align: [] }],
    //   [{ color: [] }],
    //   ['code-block'],
    //   ['clean'],
    // ],
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      ['link', 'image', 'video', 'formula'],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction

      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ['clean'] // remove formatting button
    ]
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
    'align',
    'color',
    'code-block'
  ]

  const handleEditorChange = newContent => {
    setContent(newContent)
    onUpdate(id, 'content', newContent)
  }

  return (
    <main>
      <div className=' flex items-center flex-col'>
        <div className='m-10  flex flex-col items-center'>
          <div className='h-full w-[40vw]'>
            <QuillEditor
              // theme=''
              // bounds={}
              value={content}
              onChange={handleEditorChange}
              // modules={quillModules}
              formats={quillFormats}
              className='w-full h-[70%] mt-10 bg-white'
            />
          </div>
        </div>
      </div>
    </main>
  )
}
