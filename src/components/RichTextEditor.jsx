import { Editor } from '@tinymce/tinymce-react'
import { uploadFile } from '@/lib/api'

const API_KEY = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'

export default function RichTextEditor({ value, onChange }) {
  const handleImageUpload = (blobInfo) =>
    new Promise((resolve, reject) => {
      const file = blobInfo.blob()
      const named = new File([file], blobInfo.filename(), { type: file.type })
      uploadFile(named, 'blogs')
        .then(({ url }) => resolve(url))
        .catch(reject)
    })

  return (
    <Editor
      apiKey={API_KEY}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 420,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount',
        ],
        toolbar:
          'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | removeformat | code',
        content_style: 'body { font-family: Inter, system-ui, sans-serif; font-size: 15px; line-height: 1.65; }',
        branding: false,
        promotion: false,
        images_upload_handler: handleImageUpload,
        automatic_uploads: true,
      }}
    />
  )
}
