import { connectToDatabase } from '@/lib/connectToMongoDb';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = await connectToDatabase();
  const materiali = await db.collection('materiali').find({}).toArray();
  return NextResponse.json(materiali);
}
