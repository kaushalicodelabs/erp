import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import { getGridFSBucket } from '@/lib/db/mongodb'
import { Readable } from 'stream'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const bucket = await getGridFSBucket()
    if (!bucket) {
      return NextResponse.json({ error: 'GridFS Bucket not initialized' }, { status: 500 })
    }

    const uploadedFiles = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create a readable stream from the buffer
      const stream = Readable.from(buffer)

      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: { contentType: file.type }
      })

      // Pipe the readable stream to the GridFS upload stream
      await new Promise((resolve, reject) => {
        stream.pipe(uploadStream)
          .on('finish', resolve)
          .on('error', reject)
      })

      uploadedFiles.push({
        id: uploadStream.id.toString(),
        name: file.name,
        type: file.type,
      })
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 201 })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
