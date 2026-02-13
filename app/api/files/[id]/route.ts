import { NextResponse } from 'next/server'
import { getGridFSBucket } from '@/lib/db/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bucket = await getGridFSBucket()
    
    if (!bucket) {
      return NextResponse.json({ error: 'GridFS Bucket not initialized' }, { status: 500 })
    }

    const fileId = new ObjectId(id)
    
    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray()
    if (files.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const file = files[0]

    // Create a download stream
    const downloadStream = bucket.openDownloadStream(fileId)

    // Convert the stream to a Web Stream for Next.js response
    const webStream = new ReadableStream({
      start(controller) {
        downloadStream.on('data', (chunk) => controller.enqueue(chunk))
        downloadStream.on('end', () => controller.close())
        downloadStream.on('error', (err) => controller.error(err))
      },
      cancel() {
        downloadStream.destroy()
      }
    })

    return new Response(webStream, {
      headers: {
        'Content-Type': file.metadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.filename}"`,
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Argument passed in must be a string of 12 bytes')) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
    }
    console.error('Error streaming file:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
